"use client";

import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [taskInput, setTaskInput] = useState("");
  const [eventInput, setEventInput] = useState("");
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Split user input into arrays safely
    const tasks = taskInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const events = eventInput
      .split(",")
      .map((ev) => ev.trim())
      .filter((ev) => ev.length > 0);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, events }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setSchedule(data.schedule);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">
        📅 AI Study Schedule
      </h1>

      <div className="w-full">
        <label className="block mb-2 font-medium">
          Tasks (comma separated)
        </label>
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          placeholder="e.g. math homework, read history, code project"
        />

        <label className="block mb-2 font-medium">
          Events (comma separated)
        </label>
        <input
          type="text"
          value={eventInput}
          onChange={(e) => setEventInput(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          placeholder="e.g. soccer practice, doctor appointment"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
        >
          {loading ? "Generating..." : "Generate Schedule"}
        </button>

        {/* Button to go to Todo List page */}
        <div className="flex justify-center mt-6">
          <Link href="/input">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">Task List</button>
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {schedule && (
        <div className="mt-6 p-4 rounded-2xl shadow-lg bg-white dark:bg-gray-800 w-full">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Generated Schedule
          </h2>
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {schedule}
          </pre>
        </div>
      )}
    </main>
  );
}
