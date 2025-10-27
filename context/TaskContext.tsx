"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Task {
  id: number;
  text: string;
  done: boolean;
  details?: string;
  time?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: number) => void;
  toggleTask: (id: number) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string) => {
    const newTask: Task = { id: Date.now(), text, done: false };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, toggleTask, setTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
}
