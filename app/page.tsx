"use client";

import { useState } from "react";

export default function Page() {
  const [tasks, setTasks] = useState("");
  const [events, setEvents] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.split("\n").map((t) => t.trim()).filter(Boolean),
          events: events.split("\n").map((e) => e.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setSchedule(data.schedule);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">📅 Schedule AI</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md space-y-4"
      >
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Tasks (one per line)
          </label>
          <textarea
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            placeholder="Math homework - 2h&#10;Read history - 1h"
            className="w-full border rounded-lg p-3 text-sm text-gray-900"
            rows={4}
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Events (one per line)
          </label>
          <textarea
            value={events}
            onChange={(e) => setEvents(e.target.value)}
            placeholder="Lecture 10:00-11:00&#10;Group study 3:00-4:00"
            className="w-full border rounded-lg p-3 text-sm text-gray-900"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Generating..." : "Create Schedule"}
        </button>
      </form>

      {error && (
        <p className="mt-6 text-red-600 font-medium">❌ {error}</p>
      )}

      {schedule && (
        <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">
            Generated Schedule
          </h2>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm">
            {schedule}
          </pre>
        </div>
      )}
    </main>
  );
}
