import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tasks = [], events = [] } = body;

    if ((!tasks || tasks.length === 0) && (!events || events.length === 0)) {
      return new Response(
        JSON.stringify({ error: "No tasks or events provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🧠 Format tasks neatly for AI
    const formattedTasks = tasks
      .map(
        (t: any) => `
Task: ${t.text}
${t.details ? `Notes: ${t.details}` : ""}
${t.time ? `Time Estimate: ${t.time}` : ""}
${t.dueDate ? `Due Date: ${t.dueDate}` : ""}
${t.priority ? `Priority: ${t.priority}` : ""}
${t.completed ? "This task can be split." : ""}
`
      )
      .join("\n");

    // 🗓️ Format events
    const formattedEvents =
      events.length > 0
        ? events.map((e: any) => `• ${e}`).join("\n")
        : "No events provided.";

    // 🧩 Optional prompt
    const txtPath = path.join(process.cwd(), "prompt.txt");
    let extraPrompt = "";
    if (fs.existsSync(txtPath)) {
      extraPrompt = fs.readFileSync(txtPath, "utf8");
    }

    // 🧭 Scheduling prompt
    const prompt = `
${extraPrompt}

You are an AI schedule planner that creates realistic, multi-day study and event schedules using cognitive science principles (Pomodoro, interleaving, spaced repetition).

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

### INPUT DATA
**Tasks:**
${formattedTasks || "None provided."}

**Events:**
${formattedEvents}
`;

    // 🧩 Generate schedule
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

    let parsed;
    try {
      parsed = JSON.parse(cleanJSON);
      console.log("✅ Parsed schedule:", JSON.stringify(parsed, null, 2));
    } catch {
      console.error("❌ JSON parse error from Groq:", raw);
      throw new Error("Failed to generate valid JSON from AI.");
    }

    // Normalize if needed
    if (parsed && !parsed.days && typeof parsed === "object") {
      parsed = {
        days: Object.entries(parsed).map(([day, schedule]) => ({
          day,
          date: "",
          schedule: Array.isArray(schedule) ? schedule : [],
        })),
      };
    }

    // 🧠 Collect study-related task names
    const allTasks: string[] = [];
    parsed.days?.forEach((day: any) => {
      const related = day.schedule
        ?.filter((b: any) =>
          /(study|homework|hw|review|practice|essay|reading|assignment|prepare|research)/i.test(
            b.task || ""
          )
        )
        .map((b: any) => b.task);
      if (related?.length) allTasks.push(...related);
    });

    // Deduplicate task names to prevent multiple tips per task
    const uniqueStudyTasks = [...new Set(allTasks)].slice(0, 5); // max 5 per schedule

    // 🧠 Generate richer, single tips per task
    let studyTips: any[] = [];

    if (uniqueStudyTasks.length > 0) {
      const tipPrompt = `
Generate ONE detailed, helpful study or productivity tip for each of the following tasks.
Each tip should:
- Include 1–2 relevant emojis (📚, ✍️, ⏳, 🧠, ☕, etc.)
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
        studyTips = JSON.parse(cleanTips);
        console.log("✅ Study Tips:", studyTips);
      } catch {
        console.warn("⚠️ Could not parse AI-generated tips:", rawTips);
        studyTips = [];
      }
    }

    // ✅ Return schedule + AI tips
    return new Response(JSON.stringify({ ...parsed, studyTips }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("💥 Error in /api/schedule:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to generate schedule",
        details: err.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
