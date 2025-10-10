import { OpenAI } from "openai";
import { promises as fs } from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // set this in your .env
  baseURL: "https://api.groq.com/openai/v1", // Groq uses OpenAI-compatible API
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { tasks = [], events = [] } = body;

    // reads txt file
    const promptPath = path.join(process.cwd(), "app", "api", "schedule", "prompt.txt");
    const basePrompt = await fs.readFile(promptPath, "utf-8");

    // ✅ Combine static text with user inputs
    const finalPrompt = `
${basePrompt}
Here are my tasks: ${tasks.join("\n")}
Here are my events:${events.join("\n")}
Please create a structured, realistic, and productive study schedule.`;

    // ✅ Send the combined prompt to Groq’s API
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:"You are a helpful AI that creates optimized study schedules using the latest cognitive science research.",
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
    });

    // ✅ Return the AI-generated schedule
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
