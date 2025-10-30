"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  name: string;
  id: number;
  text: string;
  done: boolean;
  details?: string;
  time?: string;
  dueDate?: string;
  priority?: string;
  completed?: boolean;
}

interface ScheduleBlock {
  timeStart: string;
  timeEnd: string;
  task?: string;
  priority?: string;
  break?: string;
  event?: string;
}

interface DaySchedule {
  day: string;
  date: string;
  schedule: ScheduleBlock[];
}

interface StudyTip {
  relatedTo: string;
  title: string;
  content: string;
}

interface ScheduleResponse {
  days: {
    day?: string;
    date?: string;
    schedule: {
      timeStart?: string;
      timeEnd?: string;
      task?: string;
      priority?: string;
      event?: string;
      break?: string;
    }[];
  }[];
  studyTips?: StudyTip[];
}

interface ScheduleData {
  days: DaySchedule[];
  studyTips?: StudyTip[];
}

export default function Page() {
  const [eventInput, setEventInput] = useState("");
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    days: [],
    studyTips: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const pastelColors = ["#FDCEDF", "#C3F8FF", "#D8F3DC", "#FFF3B0", "#E5CFF7"];

  // lLoad saved tasks & schedule from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      try {
        setSavedTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved tasks:", e);
      }
    }

    const savedSchedule = localStorage.getItem("aiSchedule");
    if (savedSchedule) {
      try {
        const parsed: ScheduleData = JSON.parse(savedSchedule);
        setScheduleData(parsed);
        if (parsed.days?.length > 0) {
          setSelectedDay(`${parsed.days[0].day} ${parsed.days[0].date}`);
        }
      } catch (e) {
        console.error("Error parsing saved schedule:", e);
      }
    }
  }, []);

  // save schedule to localStorage
  useEffect(() => {
    if (scheduleData?.days?.length) {
      localStorage.setItem("aiSchedule", JSON.stringify(scheduleData));
    }
  }, [scheduleData]);

  // generate Schedule from API
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setScheduleData({ days: [], studyTips: [] }); // clear previous schedule
    localStorage.removeItem("aiSchedule");

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: savedTasks,
          events: eventInput
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data: ScheduleResponse = await res.json();
      console.log("Schedule API Response:", data);

      const taskDueDates = savedTasks
        .map((t) => (t.dueDate ? new Date(t.dueDate) : null))
        .filter((d): d is Date => d !== null);

      const latestDueDate =
        taskDueDates.length > 0
          ? new Date(Math.max(...taskDueDates.map((d) => d.getTime())))
          : null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const limitDate = latestDueDate
        ? latestDueDate > new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)
          ? latestDueDate
          : new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000)
        : new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);

      // robustly align returned days to real calendar
      const parseDateFromString = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;
        try {
          if (dateStr.includes("/")) {
            const parts = dateStr.split("/").map((p) => p.trim());
            if (parts.length >= 2) {
              const month = parseInt(parts[0], 10) - 1;
              const day = parseInt(parts[1], 10);
              const year = parts.length === 3 ? parseInt(parts[2], 10) : today.getFullYear();
              const d = new Date(year, month, day);
              if (!Number.isNaN(d.getTime())) return d;
            }
          }
          const maybe = new Date(`${dateStr}, ${today.getFullYear()}`);
          if (!Number.isNaN(maybe.getTime())) return maybe;
        } catch {
          return null;
        }
        return null;
      };

      const weekdayNameToIndex = (name: string) => {
        const normalized = name.toLowerCase().slice(0, 3);
        const map: Record<string, number> = {
          sun: 0,
          mon: 1,
          tue: 2,
          wed: 3,
          thu: 4,
          fri: 5,
          sat: 6,
        };
        return map[normalized] ?? -1;
      };

      let matchIndex = -1;
      for (let i = 0; i < data.days.length; i++) {
        const d = data.days[i];
        const parsedDate = parseDateFromString(d.date);
        if (parsedDate) {
          parsedDate.setHours(0, 0, 0, 0);
          if (parsedDate.getTime() === today.getTime()) {
            matchIndex = i;
            break;
          }
        }
        const dayName = d.day;
        if (typeof dayName === "string") {
          const idx = weekdayNameToIndex(dayName);
          if (idx !== -1 && idx === today.getDay()) {
            matchIndex = i;
            break;
          }
        }
      }

      if (matchIndex === -1) matchIndex = 0;

      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() - matchIndex);

      const daysArray: DaySchedule[] = data.days
        .map((dayObj, index) => {
          const dayDate = new Date(baseDate);
          dayDate.setDate(baseDate.getDate() + index);
          const formattedDate = dayDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const formattedDay = dayDate.toLocaleDateString("en-US", {
            weekday: "short",
          });

          return {
            day: formattedDay,
            date: formattedDate,
            schedule: dayObj.schedule.map((item) => ({
              timeStart: item.timeStart || "",
              timeEnd: item.timeEnd || "",
              task: item.task || item.event || item.break || "",
              priority: item.priority || "",
              event: item.event || "",
              break: item.break || "",
            })),
          };
        })
        .filter((dayObj) => {
          const date = new Date(`${dayObj.date}, ${today.getFullYear()}`);
          return date <= limitDate;
        })
        .slice(0, 10);

      setScheduleData({ days: daysArray, studyTips: data.studyTips || [] });
      localStorage.setItem(
        "aiSchedule",
        JSON.stringify({ days: daysArray, studyTips: data.studyTips || [] })
      );

      if (daysArray.length > 0) {
        setSelectedDay(`${daysArray[0].day} ${daysArray[0].date}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching schedule:", err);
        setError(err.message);
      } else {
        console.error("Unknown error:", err);
        setError("Unexpected error generating schedule");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    if (time.toUpperCase().includes("AM") || time.toUpperCase().includes("PM"))
      return time;
    const [hourStr, minute = "00"] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <main className="min-h-screen bg-[#c6dbd5] flex flex-col items-center font-sans relative">
      <header className="w-full  backdrop-blur-md bg-[#7aaa9d]/80 shadow-md py-4 px-6 flex flex-col items-center relative">
        {/* nav buttons */}
        <div className="absolute right-6 top-4 flex gap-3">
          <Link href="/script">
            <button className="bg-[#CED3BA] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#c6ccaf]">
              info
            </button>
          </Link>
          <Link href="/input">
            <button className="bg-[#CBC6DB] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#bbb4cf]">
              todo
            </button>
          </Link>
          <Link href="/">
            <button className="bg-[#DBC6CC] text-gray-800 px-4 py-2 rounded-lg shadow font-semibold transition-all hover:bg-[#cfb3bb]">
              schedule
            </button>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Synapse
          </h1>
          <p className="text-gray-600 font-medium mt-1">
            Organizing Student Success
          </p>
        </div>
      </header>
        {/* event input */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5 mt-16">
          
          <label className="block mb-2 font-medium text-gray-700"> Events </label>
          <input
            type="text"
            value={eventInput}
            onChange={(e) => setEventInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. soccer practice, doctor appointment"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#7f85ca] text-white py-2 rounded-lg font-medium hover:bg-[#6970c1] transition disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Schedule"}
          </button>
        </div>

        {/* errors :(*/}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {/* day selector */}
        {scheduleData.days?.length > 0 && (
          <div className="flex overflow-x-auto gap-3 mb-4 pb-2 scrollbar-hide">
            {scheduleData.days.map((day, i) => {
              const key = `${day.day} ${day.date}`;
              const pastel = pastelColors[i % pastelColors.length];
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(key)}
                  className={`flex flex-col items-center justify-center min-w-[85px] px-4 py-3 rounded-xl transition-all shadow-sm border ${
                    selectedDay === key
                      ? "bg-[#e2e3f3] border-[#6970c1]"
                      : "bg-white hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-800">
                    {i === 0 ? "Today" : day.day}
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {day.date}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: pastel }}
                  ></span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* schedule display :)*/}
        <div className="flex justify-center w-full px-4 mt-8">
        <div className="w-full max-w-md">
        <AnimatePresence>
          {scheduleData.days?.length > 0 && (
            <motion.div
              key="schedule-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-5 rounded-2xl shadow-lg mt-3"
            >
              {scheduleData.days
                .filter((day) => `${day.day} ${day.date}` === selectedDay)
                .map((day, i) => (
                  <div key={i}>
                    <h2 className="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">
                      📅 {day.day} {day.date}
                    </h2>
                    <div
                      className="space-y-5 border-l-2 pl-4"
                      style={{
                        borderColor:
                          pastelColors[
                            scheduleData.days.findIndex(
                              (d) => `${d.day} ${d.date}` === selectedDay
                            ) % pastelColors.length
                          ],
                      }}
                    >
                      {day.schedule.map((block, j) => (
                        <div key={j}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {block.timeStart && block.timeEnd
                                ? `${formatTime(block.timeStart)} – ${formatTime(block.timeEnd)}`
                                : "No time specified"}
                            </span>
                          </div>
                          <div>
                            <span className="text-base font-medium text-black block mt-1">
                              {block.task || block.event || block.break || "Untitled"}
                            </span>
                          </div>
                          {block.priority && (
                            <p className="text-xs text-gray-500 ml-6">
                              Priority: {block.priority}
                            </p>
                          )}
                          {scheduleData.studyTips
                            ?.filter(
                              (tip) =>
                                tip.relatedTo?.toLowerCase() ===
                                block.task?.toLowerCase()
                            )
                            .map((tip, idx) => (
                              <div
                                key={idx}
                                className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm"
                              >
                                <p className="font-semibold text-blue-900 mb-1">
                                  {tip.title}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {tip.content}
                                </p>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        </div>
      </main>

  );
}
