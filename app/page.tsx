"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { TaskProvider } from "./context/TaskContext";

interface Task {
  id: number;
  text: string;
  done: boolean;
  details?: string;
  time?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
}

export default function Page() {
  const [taskInput, setTaskInput] = useState("");
  const [eventInput, setEventInput] = useState("");
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);

  // Load tasks from localStorage
  const loadTasks = () => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      try {
        setSavedTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved tasks:", e);
      }
    } else {
      setSavedTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
    // Listen for changes to localStorage (syncs across pages)
    window.addEventListener("storage", loadTasks);
    return () => window.removeEventListener("storage", loadTasks);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Combine manual and saved tasks
    const manualTasks = taskInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const allTasks = [
      ...new Set([
        ...savedTasks.map((t) => t.text),
        ...manualTasks,
      ]),
    ];

    const events = eventInput
      .split(",")
      .map((ev) => ev.trim())
      .filter((ev) => ev.length > 0);

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: savedTasks, events }), // send full objects now
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      setSchedule(data.schedule);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📅 AI Study Schedule</h1>

      <div className="flex justify-between mb-4">
        <Link href="/input">
          <button className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
            📝 Go to Tasks
          </button>
        </Link>
      </div>

      {/* <label className="block mb-2 font-medium">Additional Tasks</label>
      <input
        type="text"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        className="w-full border rounded p-2 mb-4"
        placeholder="Add extra tasks here (comma separated)"
      /> */}

      <label className="block mb-2 font-medium">Events</label>
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Schedule"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {schedule && (
        <div className="mt-6 p-4 rounded-2xl shadow-lg bg-white dark:bg-gray-800">
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
