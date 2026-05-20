"use client";

import { useState, useEffect } from "react";

// --- Types ---
type Priority = "high" | "medium" | "low";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  priority: Priority;
  done: boolean;
}

interface ScheduleEvent {
  id: string;
  title: string;
  dateTime: string;
}

// --- Helpers ---
const uid = () => Math.random().toString(36).slice(2, 9);

const priorityColor = (p: Priority) =>
  p === "high" ? "border-l-red-500" : p === "medium" ? "border-l-amber-500" : "border-l-green-500";

const priorityBadge = (p: Priority) =>
  p === "high"
    ? "bg-red-100 text-red-700"
    : p === "medium"
    ? "bg-amber-100 text-amber-700"
    : "bg-green-100 text-green-700";

const isOverdue = (deadline: string) => new Date(deadline) < new Date();
const isDueToday = (deadline: string) =>
  new Date(deadline).toDateString() === new Date().toDateString();
const isDueSoon = (deadline: string) => {
  const now = new Date();
  const diff = new Date(deadline).getTime() - now.getTime();
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
};

// Mock summarizer — replace with real LLM call later
const mockSummarize = (text: string): string[] => {
  const lines = text
    .split(/[.\n]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10);
  if (lines.length === 0) return ["No content to summarize."];
  return lines.slice(0, 5).map((l, i) => `${i + 1}. ${l.slice(0, 120)}${l.length > 120 ? "..." : ""}`);
};

// --- Main Component ---
export default function StudyFlow() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [lectureText, setLectureText] = useState("");
  const [summary, setSummary] = useState<string[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");

  // Persistence
  useEffect(() => {
    const savedA = localStorage.getItem("studyflow_assignments");
    const savedE = localStorage.getItem("studyflow_events");
    if (savedA) setAssignments(JSON.parse(savedA));
    if (savedE) setEvents(JSON.parse(savedE));
  }, []);

  useEffect(() => {
    localStorage.setItem("studyflow_assignments", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("studyflow_events", JSON.stringify(events));
  }, [events]);

  // Handlers
  const addAssignment = () => {
    if (!title || !deadline) return;
    setAssignments((prev) => [
      ...prev,
      { id: uid(), title, subject, deadline, priority, done: false },
    ]);
    setTitle("");
    setSubject("");
    setDeadline("");
    setPriority("medium");
  };

  const deleteAssignment = (id: string) =>
    setAssignments((prev) => prev.filter((a) => a.id !== id));

  const toggleDone = (id: string) =>
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
    );

  const addEvent = () => {
    if (!eventTitle || !eventDateTime) return;
    setEvents((prev) => [
      ...prev,
      { id: uid(), title: eventTitle, dateTime: eventDateTime },
    ]);
    setEventTitle("");
    setEventDateTime("");
  };

  const deleteEvent = (id: string) =>
    setEvents((prev) => prev.filter((e) => e.id !== id));

  const handleSummarize = () => {
    if (!lectureText.trim()) return;
    setSummaryLoading(true);
    setTimeout(() => {
      setSummary(mockSummarize(lectureText));
      setSummaryLoading(false);
    }, 800);
  };

  // Study Priorities
  const priorities = assignments
    .filter((a) => !a.done)
    .sort((a, b) => {
      const urgencyScore: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return (
        urgencyScore[a.priority] - urgencyScore[b.priority] ||
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    })
    .slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-xl font-bold text-slate-800">StudyFlow</h1>
          </div>
          <span className="text-sm text-slate-500">{today}</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Deadlines */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h2 className="font-semibold text-slate-800">Upcoming Deadlines</h2>
          </div>

          <div className="p-5 space-y-3 border-b border-slate-100">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g. Calculus)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Med</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <button
              onClick={addAssignment}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              + Add Assignment
            </button>
          </div>

          <div className="p-5 space-y-3 flex-1">
            {assignments.filter((a) => !a.done).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No upcoming assignments 🎉
              </p>
            )}
            {assignments
              .filter((a) => !a.done)
              .sort(
                (a, b) =>
                  new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
              )
              .map((a) => (
                <div
                  key={a.id}
                  className={`border-l-4 ${priorityColor(a.priority)} bg-slate-50 rounded-r-lg p-3 fade-in`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium text-slate-800 ${
                          isOverdue(a.deadline) ? "text-red-600" : ""
                        }`}
                      >
                        {a.title}
                      </p>
                      {a.subject && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {a.subject}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(
                            a.priority
                          )}`}
                        >
                          {a.priority}
                        </span>
                        <span
                          className={`text-xs ${
                            isOverdue(a.deadline)
                              ? "text-red-500 font-semibold"
                              : "text-slate-400"
                          }`}
                        >
                          {new Date(a.deadline).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {isDueSoon(a.deadline) && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse-soft">
                            Due soon
                          </span>
                        )}
                        {isOverdue(a.deadline) && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium animate-pulse-soft">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        onClick={() => toggleDone(a.id)}
                        className="text-xs text-slate-400 hover:text-green-500 transition-colors"
                        title="Mark done"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => deleteAssignment(a.id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {assignments.filter((a) => a.done).length > 0 && (
              <details className="mt-4">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                  {assignments.filter((a) => a.done).length} completed
                </summary>
                <div className="mt-2 space-y-2">
                  {assignments
                    .filter((a) => a.done)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between bg-green-50 border-l-4 border-l-green-400 rounded-r-lg p-2"
                      >
                        <span className="text-sm text-slate-400 line-through">
                          {a.title}
                        </span>
                        <button
                          onClick={() => deleteAssignment(a.id)}
                          className="text-xs text-slate-300 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>
        </section>

        {/* Column 2: Schedule + Notes */}
        <section className="flex flex-col gap-6">
          {/* Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <span className="text-lg">📅</span>
              <h2 className="font-semibold text-slate-800">Schedule</h2>
            </div>
            <div className="p-5 space-y-3 border-b border-slate-100">
              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event / Class name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="datetime-local"
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addEvent}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                + Add Event
              </button>
            </div>
            <div className="p-5 space-y-2 flex-1">
              {events.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No upcoming events
                </p>
              )}
              {events
                .sort(
                  (a, b) =>
                    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
                )
                .map((e) => (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDueToday(e.dateTime)
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-slate-50 border-slate-100"
                    } fade-in`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {e.title}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isDueToday(e.dateTime)
                            ? "text-indigo-600 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {new Date(e.dateTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Lecture Notes */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <span className="text-lg">📝</span>
              <h2 className="font-semibold text-slate-800">Lecture Notes</h2>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={lectureText}
                onChange={(e) => setLectureText(e.target.value)}
                placeholder="Paste your lecture notes here..."
                rows={5}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={handleSummarize}
                disabled={summaryLoading || !lectureText.trim()}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {summaryLoading ? "Summarizing..." : "✨ Summarize"}
              </button>
            </div>
            {summary.length > 0 && (
              <div className="px-5 pb-5 space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Summary
                </p>
                {summary.map((s, i) => (
                  <p
                    key={i}
                    className="text-sm text-slate-700 bg-indigo-50 rounded-lg px-3 py-2"
                  >
                    {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Column 3: Study Priorities */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h2 className="font-semibold text-slate-800">Study Priorities</h2>
          </div>
          <div className="p-5 flex-1">
            {priorities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-sm text-slate-500">
                  All caught up! Add assignments to see your priorities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {priorities.map((a, i) => {
                  const motivationalMsgs = [
                    "You've got this! 💪",
                    "Focus time. Let&apos;s go! 🚀",
                    "One step at a time! ✨",
                  ];
                  return (
                    <div
                      key={a.id}
                      className={`border-l-4 ${priorityColor(
                        a.priority
                      )} bg-slate-50 rounded-r-lg p-4 fade-in`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge(
                            a.priority
                          )}`}
                        >
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {a.title}
                      </p>
                      {a.subject && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {a.subject}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(a.deadline).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-indigo-500 mt-2 font-medium">
                        {motivationalMsgs[i]}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
