"use client";
import { useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState("");
  const [events, setEvents] = useState("");
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSchedule("");

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.split("\n").map((t) => t.trim()).filter(Boolean),
          events: events.split("\n").map((e) => e.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.schedule) {
        setSchedule(data.schedule);
      } else {
        setSchedule("⚠️ No schedule returned.");
      }
    } catch (err) {
      console.error(err);
      setSchedule("⚠️ Error generating schedule.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">📅 Study Planner</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md space-y-4"
      >
        <div>
          <label className="block font-medium">Tasks (one per line)</label>
          <textarea
            className="w-full border rounded-md p-2 mt-1"
            rows={4}
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder="Math homework - 2h&#10;Read history - 1h"
          />
        </div>

        <div>
          <label className="block font-medium">Events (one per line)</label>
          <textarea
            className="w-full border rounded-md p-2 mt-1"
            rows={3}
            value={events}
            onChange={(e) => setEvents(e.target.value)}
            placeholder="Lecture 10:00-11:00&#10;Group study 3:00-4:00"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Create Schedule"}
        </button>
      </form>

      {schedule && (
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Schedule</h2>
          <pre className="whitespace-pre-wrap text-gray-800">{schedule}</pre>
        </div>
      )}
    </main>
  );
}
