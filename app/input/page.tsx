"use client";

import { useState } from "react";
import Link from "next/link";

interface Task {
  id: number;
  text: string;
  done: boolean;
}

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  // Add new task
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      text: input.trim(),
      done: false,
    };

    setTasks([...tasks, newTask]);
    setInput("");
  };

  // Toggle completion
  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // Delete task
  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      {/* Back button */}
      <Link href="/">
        <button className="mb-6 bg-gray-500 text-white px-4 py-2 rounded">
          ← Back to Home
        </button>
      </Link>

      {/* Task input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task"
          className="border rounded px-2 py-1"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </form>

      {/* Task list */}
      <div className="mt-6 w-full max-w-md space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span
                className={task.done ? "line-through text-gray-500" : ""}
              >
                {task.text}
              </span>
            </label>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
