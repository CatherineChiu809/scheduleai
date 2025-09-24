import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { tasks, events } = body;

    if (!tasks || !events) {
      return new Response(
        JSON.stringify({ error: "Tasks and events are required." }),
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a study planner assistant. Create a structured daily schedule based on tasks and events.",
        },
        {
          role: "user",
          content: `Here are my tasks: ${JSON.stringify(
            tasks
          )} and events: ${JSON.stringify(
            events
          )}. Please return an organized schedule with times.`,
        },
      ],
    });

    const schedule = completion.choices[0].message.content;

    return new Response(JSON.stringify({ schedule }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate schedule" }),
      { status: 500 }
    );
  }
}
