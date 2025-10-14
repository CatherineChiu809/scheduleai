import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { tasks = [], events = [] } = body;

    // Convert task data to readable text for the AI
    const formattedTasks = tasks.map((t) => {
      return `Task: ${t.text}
${t.details ? `Notes: ${t.details}` : ""}
${t.time ? `Time Estimate: ${t.time}` : ""}
${t.dueDate ? `Due Date: ${t.dueDate}` : ""}
${t.priority ? `Priority: ${t.priority}` : ""}
${t.completed ? "This task can be split." : ""}`;
    }).join("\n\n");

    // Optional: read a longer instruction from a .txt file (if exists)
    const txtPath = path.join(process.cwd(), "prompt.txt");
    let extraPrompt = "";
    if (fs.existsSync(txtPath)) {
      extraPrompt = fs.readFileSync(txtPath, "utf8");
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI that creates study schedules using cognitive science principles to optimize focus, breaks, and learning efficiency.",
        },
        {
          role: "user",
          content: `
${extraPrompt}
Here are my tasks:\n${formattedTasks}\n
Here are my events: ${events.join(", ")}.
Please create a structured study schedule considering all task details.`,
        },
      ],
    });

    return new Response(
      JSON.stringify({ schedule: completion.choices[0].message.content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in /api/schedule:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate schedule" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
