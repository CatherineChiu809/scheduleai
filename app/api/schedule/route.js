import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, // set this in your .env
  baseURL: "https://api.groq.com/openai/v1", // Groq uses OpenAI-compatible API
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { tasks = [], events = [] } = body;
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI that creates study schedules using the latest studies in the science of studying to makes the most productive and effective schedule possible.",
        },
        {
          role: "user",
          content: `Here are my tasks: ${tasks.join(", ")}. 
                    Here are my events: ${events.join(", ")}. 
                    Please create a structured study schedule for me`,
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
