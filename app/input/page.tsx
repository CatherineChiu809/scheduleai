"use client";

import { useState } from "react";
import Link from "next/link";
import { useTasks, Task } from "../context/TaskContext";
import "./switchstyle.css";

export default function TodoPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [input, setInput] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTask(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col items-center mt-10 px-4">
      <Link href="/">
        <button className="mb-6 bg-gray-500 text-white px-4 py-2 rounded">
          Back to Home
        </button>
      </Link>
        {/* add a new task */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task"
          className="border rounded px-2 py-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
          Add
        </button>
      </form>
    {/* task line */}
      <div className="mt-6 w-full max-w-md space-y-2">
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center">No tasks yet. Add one!</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="flex items-center justify-between cursor-pointer"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={(e) => {
                  e.stopPropagation(); 
                  toggleTask(task.id);
                }}
              />
              <span className={task.done ? "line-through text-gray-500" : ""}>
                {task.text}
              </span>
            </label>
            <span className="text-gray-400 text-sm">⚙️</span>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <h2 className="text-xl font-bold mb-4 text-black">Edit Task</h2>

            <input
              type="text"
              value={selectedTask.text}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, text: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded text-black"
            />

            <textarea
              placeholder="Notes / Details"
              value={selectedTask.details || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, details: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded text-black"
            />

            <input
              placeholder="Approximate Time to Finish"
              value={selectedTask.time || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, time: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded text-black"
            />

            <label className="block mb-3">
              <span className="text-sm font-medium text-black">Due Date:</span>
              <input
                type="date"
                value={selectedTask.dueDate || ""}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, dueDate: e.target.value })
                }
                className="border p-2 rounded w-full mt-1 text-black"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-medium text-black">Priority:</span>
              <select
                value={selectedTask.priority || ""}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, priority: e.target.value })
                }
                className="border p-2 rounded w-full mt-1 text-black"
              >
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <div className="flex items-center justify-between mb-4">
              <span className="mb-3 text-black">Can this task be split?</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTask.completed || false}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      completed: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
              </label>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() =>
                  updateTask({ ...selectedTask, done: !selectedTask.done })
                }
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                {selectedTask.done ? "Undo" : "Mark Done"}
              </button>
              <button
                onClick={() => {
                  deleteTask(selectedTask.id);
                  setSelectedTask(null);
                }}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  updateTask(selectedTask);
                  setSelectedTask(null);
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
