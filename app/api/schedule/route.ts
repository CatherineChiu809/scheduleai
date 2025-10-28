import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

interface Task {
  text: string;
  details?: string;
  time?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
}

interface ScheduleBlock {
  timeStart?: string;
  timeEnd?: string;
  task?: string;
  event?: string;
  break?: string;
}

interface DaySchedule {
  day: string;
  date: string;
  schedule: ScheduleBlock[];
}

interface ParsedResponse {
  days?: DaySchedule[];
  [key: string]: unknown;
}

interface StudyTip {
  relatedTo: string;
  title: string;
  content: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: { tasks?: Task[]; events?: string[] } = await req.json();
    const { tasks = [], events = [] } = body;

    if ((!tasks || tasks.length === 0) && (!events || events.length === 0)) {
      return new Response(
        JSON.stringify({ error: "No tasks or events provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // format tasks neatly for AI to read better
    const formattedTasks = tasks
      .map(
        (t: Task) => `
          Task: ${t.text}
          ${t.details ? `Notes: ${t.details}` : ""}
          ${t.time ? `Time Estimate: ${t.time}` : ""}
          ${t.dueDate ? `Due Date: ${t.dueDate}` : ""}
          ${t.priority ? `Priority: ${t.priority}` : ""}
          ${t.completed ? "This task can be split." : ""}
        `
      )
      .join("\n");

    // format events
    const formattedEvents =
      events.length > 0
        ? events.map((e: string) => `• ${e}`).join("\n")
        : "No events provided.";

    // extra prompt
    const txtPath = path.join(process.cwd(), "prompt.txt");
    let extraPrompt = "";
    if (fs.existsSync(txtPath)) {
      extraPrompt = fs.readFileSync(txtPath, "utf8");
    }
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    // main prompt
    const prompt = `
      ${extraPrompt}

You are an AI schedule planner that creates realistic, multi-day study and event schedules using cognitive science principles (Pomodoro, interleaving, spaced repetition).
**Today's date is ${todayStr}.**
All schedules should start from today unless explicitly stated otherwise.
You are given:
1. A list of tasks (with possible due dates or priorities)
2. A list of events (which may have specified times or repeat rules like "Mon–Fri 8–5pm")

### RULES
- Output **ONLY valid JSON** (no markdown or commentary).
- The top-level structure MUST be:
{
  "days": [
    {
      "day": "Sunday",
      "date": "10/27",
      "schedule": [
        { "timeStart": "9:00 AM", "timeEnd": "10:00 AM", "task": "Math HW" },
        { "timeStart": "10:00 AM", "timeEnd": "11:00 AM", "break": "Short break" },
        { "timeStart": "11:00 AM", "timeEnd": "1:00 PM", "event": "Church" }
      ]
    }
  ]
}

### REQUIREMENTS
- Always include "timeStart" and "timeEnd" (12-hour format).
- Each schedule entry must contain one of: "task", "event", or "break".
- No overlaps.
- Respect due dates.
- Schedule around fixed events.
- Include natural breaks and meals.
- Each day must have a non-overlapping schedule
- Events always take priority — do **not** overlap tasks or meals on top of events.
- Meals (breakfast, lunch, dinner) should be spaced reasonably and never overlap events - if there is an event that takes place over reasonable meal times, ommit the meal times from the schedule
    - breakfast 6am-11am
    - lunch 11am - 2:30pm
    - dinner 4:30pm - 10pm
- Tasks can fill the remaining available time slots.
- If there are too many tasks to fit into a day (including a healthy sleep amount), move them to the next day
    - always proritize higher priority levels and closer due dates when moving tasks past their due dates
- If a recurring event is like "Mon–Fri 8–5pm", apply it **for all those weekdays**, including today if it matches.
- Always assign correct days and times.
- You can extend schedules to 11pm if needed (when there are too many tasks to fit into a day)
    -If you end the previous day later, make sure to start the next day a bit later as well
    -ex) end 10/27 at 11pm and start 10/28 at 7:30am
    -When you do this make sure to observe all start times for tasks and leave room for meals IF POSSIBLE
- Include realistic gaps between items like prep times to move from one event to another.

### INPUT DATA
**Tasks:**
${formattedTasks || "None provided."}

**Events:**
${formattedEvents}
`;

    // generate schedule!
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI that outputs structured JSON schedules with explicit times and dates for each activity.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const cleanJSON = raw.slice(jsonStart, jsonEnd + 1);

    let parsed: ParsedResponse;
    try {
      parsed = JSON.parse(cleanJSON) as ParsedResponse;
      console.log("Parsed schedule:", JSON.stringify(parsed, null, 2));
    } catch {
      console.error("JSON parse error from Groq:", raw);
      throw new Error("Failed to generate valid JSON from AI.");
    }

    if (parsed && !parsed.days && typeof parsed === "object") {
      parsed = {
        days: Object.entries(parsed).map(([day, schedule]) => ({
          day,
          date: "",
          schedule: Array.isArray(schedule)
            ? (schedule as ScheduleBlock[])
            : [],
        })),
      };
    }

    // look through task lists for study related items
    const allTasks: string[] = [];
    parsed.days?.forEach((day: DaySchedule) => {
      const related =
        day.schedule
          ?.filter((b: ScheduleBlock) =>
            /(study|homework|hw|review|practice|essay|reading|assignment|prepare|research|prep|quiz|test|plan)/i.test(
              b.task || ""
            )
          )
          .map((b) => b.task || "") ?? [];
      if (related.length) allTasks.push(...related);
    });

    // duplicate task names to prevent multiple tips per task
    const uniqueStudyTasks = [...new Set(allTasks)].slice(0, 5); // set max 5 tips per day

    // tip generator 
    let studyTips: StudyTip[] = [];

    if (uniqueStudyTasks.length > 0) {
      const tipPrompt = `
        Generate ONE detailed, helpful study or productivity tip for each of the following tasks.
        Each tip should:
          - Include 1–2 relevant emojis (📚, ✍️, ⏳, 🧠, ☕, 💡, etc.)
          - Not include emojis in the tip body, only at the beginning of the title
          - Be around 2–3 sentences (40–60 words).
          - Give practical, encouraging, and task-specific advice.

        Respond ONLY with a valid JSON array:
          [
            { "relatedTo": "task name", "title": "💡 Short, catchy title", "content": "Detailed, actionable tip paragraph." }
          ]

          Tasks:
            ${uniqueStudyTasks.join("\n")}
        `;

      const tipsResponse = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You generate concise but detailed study tips with emojis. One JSON object per task.",
          },
          { role: "user", content: tipPrompt },
        ],
      });

      const rawTips = tipsResponse.choices[0]?.message?.content?.trim() || "";
      const start = rawTips.indexOf("[");
      const end = rawTips.lastIndexOf("]");
      const cleanTips = rawTips.slice(start, end + 1);

      try {
        studyTips = JSON.parse(cleanTips) as StudyTip[];
        console.log("Study Tips:", studyTips);
      } catch {
        console.warn("Could not parse AI-generated tips:", rawTips);
        studyTips = [];
      }
    }

    // return schedule and tips
    return new Response(JSON.stringify({ ...parsed, studyTips }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Error in /api/schedule:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error occurred.";
    return new Response(
      JSON.stringify({
        error: "Failed to generate schedule",
        details: message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
