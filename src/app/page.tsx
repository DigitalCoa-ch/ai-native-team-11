"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Assignment { id: string; title: string; subject: string; deadline: string; priority: string; done?: boolean; createdAt?: string }
interface ScheduleEvent { id: string; title: string; dateTime: string; type?: string; createdAt?: string }
interface Course { id: string; name: string; code: string; credits: number; grade: string; progress: number }
interface PomodoroData { sessions: number; focusMinutes: number }
interface Recommendation { id: string; text: string; priority: string }

// ─── API ─────────────────────────────────────────────────────────────────────
const API = "/api/studyflow";
async function apiGet(action: string) { const r = await fetch(`${API}?action=${action}`); return r.json(); }
async function apiPost(action: string, body: Record<string, unknown>) {
  const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
  return r.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (d: string) => new Date(d).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
const isOverdue = (d: string) => new Date(d) < new Date();
const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
const isSoon = (d: string) => { const t = new Date().getTime(); return new Date(d).getTime() - t > 0 && new Date(d).getTime() - t < 86400000; };
const pBadge = (p: string) => p === "high" ? "bg-red-500/20 text-red-300 border border-red-500/30" : p === "medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-teal-500/20 text-teal-300 border border-teal-500/30";
const pDot = (p: string) => p === "high" ? "bg-red-400" : p === "medium" ? "bg-amber-400" : "bg-teal-400";

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
function Icon({ name, className = "" }: { name: string; className?: string }) {
  const icons: Record<string, string> = {
    dashboard: "M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z",
    schedule: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 14.03-1.41 1.41L12 15.41l-2.58 2.59-1.41-1.41L10.59 14l-2.59-2.58 1.41-1.41L12 12.59l2.58-2.59 1.41 1.41L13.41 14z",
    school: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
    notes: "M3 13h8V3H3v10zm2 2v-4h4v4H5zm8-8v8h8V5h-8zm2 2h4v4h-4V7z",
    settings: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    help: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    ai: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
    calendar: "M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z",
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    check: "M9 16.17L4.83 12l-1.42 1.41L7.83 14H2v2h5.83l-1.59 1.59L5.83 20 12 13.83l6.18 6.18-1.41 1.41L12 16.17z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  };
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d={icons[name] || icons.dashboard} />
    </svg>
  );
}

function PulseDot({ color = "bg-teal-400" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
    </span>
  );
}

function MaterialIcon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ active, onNavigate }: { active: string; onNavigate: (v: string) => void }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "schedule", label: "Schedule", icon: "calendar" },
    { id: "courses", label: "Courses", icon: "school" },
    { id: "notes", label: "Notes", icon: "notes" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1f1f21] border-r border-[#44474d] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[#44474d]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7701d0] to-[#dcb8ff] flex items-center justify-center text-white font-bold text-sm shadow-lg">
          CA
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">CampusAI</p>
          <p className="text-xs text-[#c5c6cd]">Navigator Pro</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === item.id
                ? "bg-[#7701d0] text-white shadow-md"
                : "text-[#c5c6cd] hover:bg-[#2a2a2c] hover:text-white"
            }`}
          >
            <Icon name={item.icon} className={active === item.id ? "text-white" : "text-[#c5c6cd]"} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Help + Profile */}
      <div className="px-3 pb-4 space-y-1 border-t border-[#44474d] pt-3">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-[#c5c6cd] hover:bg-[#2a2a2c] hover:text-white rounded-lg text-sm transition-all">
          <Icon name="help" className="text-[#c5c6cd]" /> Help Center
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-[#ffb4ab] hover:bg-[#93000a]/20 hover:text-[#ffb4ab] rounded-lg text-sm transition-all">
          <Icon name="logout" className="text-[#ffb4ab]" /> Logout
        </button>
      </div>

      {/* User profile */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 p-3 bg-[#1b1b1d] rounded-xl border border-[#44474d]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b9c7e4] to-[#7701d0] flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Alex Chen</p>
            <p className="text-xs text-[#c5c6cd] truncate">Computer Science · Yr 2</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CampusAINavigator() {
  const [nav, setNav] = useState("dashboard");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pomodoro, setPomodoro] = useState<PomodoroData>({ sessions: 0, focusMinutes: 0 });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string; text: string}>>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryResult, setSummaryResult] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  const [aTitle, setATitle] = useState("");
  const [aSubject, setASubject] = useState("");
  const [aDeadline, setADeadline] = useState("");
  const [aPriority, setAPriority] = useState<string>("medium");
  const [eTitle, setETitle] = useState("");
  const [eDateTime, setEDateTime] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet("assignments").then(r => r.success && setAssignments(r.data));
    apiGet("schedule").then(r => r.success && setEvents(r.data));
    apiGet("courses").then(r => r.success && setCourses(r.data));
    apiGet("pomodoro").then(r => r.success && setPomodoro(r.data));
    apiGet("recommendations").then(r => r.success && setRecommendations(r.data));
  }, []);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [chatHistory]);

  const addAssignment = async () => {
    if (!aTitle || !aDeadline) return;
    const r = await apiPost("add-assignment", { title: aTitle, subject: aSubject, deadline: aDeadline, priority: aPriority });
    if (r.success) { setAssignments(prev => [...prev, r.data]); setATitle(""); setASubject(""); setAPriority("medium"); }
  };
  const deleteAssignment = async (id: string) => {
    await apiPost("delete-assignment", { id });
    setAssignments(prev => prev.filter(a => a.id !== id));
  };
  const markDone = async (id: string) => {
    await apiPost("mark-done", { id });
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, done: true } : a));
  };

  const addEvent = async () => {
    if (!eTitle || !eDateTime) return;
    const r = await apiPost("add-event", { title: eTitle, dateTime: eDateTime });
    if (r.success) { setEvents(prev => [...prev, r.data]); setETitle(""); }
  };
  const deleteEvent = async (id: string) => {
    await apiPost("delete-event", { id });
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const startPomodoro = async () => {
    const r = await apiPost("start-pomodoro", {});
    if (r.success) setPomodoro(r.data);
  };

  const handleSummarize = async () => {
    if (!summaryText.trim()) return;
    setSummarizing(true);
    const r = await apiPost("summarize-lecture", { text: summaryText });
    if (r.success) setSummaryResult(r.data.map((b: {point: string}) => b.point));
    setSummarizing(false);
  };

  const sendChat = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setAiTyping(true);
    const r = await apiPost("ai-chat", { message: userMsg });
    setAiTyping(false);
    if (r.success) setChatHistory(prev => [...prev, { role: "assistant", text: r.response }]);
  };

  const priorities = assignments.filter(a => !a.done).sort((a, b) => {
    const s: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return s[a.priority] - s[b.priority] || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  }).slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const activeAssignments = assignments.filter(a => !a.done);
  const now = new Date();
  const weekEvents = events.filter(e => {
    const d = new Date(e.dateTime);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
    return d >= startOfWeek && d <= endOfWeek;
  });

  return (
    <div className="min-h-screen bg-[#131315] text-[#e4e2e4]">
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');`}</style>

      {/* Sidebar */}
      <Sidebar active={nav} onNavigate={setNav} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full ml-64 pl-10 pr-10 h-16 bg-[#131315]/80 backdrop-blur-md border-b border-[#44474d] shadow-md">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f9097]" />
            <input placeholder="Search resources, notes, or courses..." className="w-full bg-[#1b1b1d] border border-[#44474d] rounded-full py-2 pl-10 pr-4 text-sm text-[#e4e2e4] placeholder:text-[#8f9097] focus:outline-none focus:border-[#b9c7e4]/50 focus:bg-[#1f1f21] transition-all" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#0a192f] text-[#b9c7e4] border border-[#8f9097]/30 px-4 py-1.5 rounded-full text-sm hover:bg-[#0a192f]/80 transition-all">
            <PulseDot color="bg-[#b9c7e4]" /> AI Ready
          </button>
          <div className="flex items-center gap-2 border-l border-[#44474d] pl-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b9c7e4] to-[#7701d0] flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="text-sm text-[#e4e2e4] hidden md:block">Alex</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="ml-64 p-10 min-h-[calc(100vh-64px)]">

        {/* Hero Welcome Section */}
        <section className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a192f] via-[#0a192f] to-[#112240] border border-[#233554] p-8 flex flex-col justify-between min-h-[260px] mb-6">
          {/* Background accent circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#7701d0]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#b9c7e4]/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <p className="text-sm text-[#b9c7e4] mb-1">Good morning,</p>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Alex! 👋</h1>
            <p className="text-[#c5c6cd] text-base max-w-lg">Your academic command center — stay ahead of deadlines and focus on what matters most.</p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-[#1b1b1d]/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <PulseDot color="bg-red-400" />
              <span className="text-sm text-white">{activeAssignments.length} Active Tasks</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1b1b1d]/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-sm text-[#dcb8ff]">🎯</span>
              <span className="text-sm text-white">{priorities[0]?.title || "All caught up!"}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1b1b1d]/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-sm text-[#7ad0ff]">⏱</span>
              <span className="text-sm text-white">{pomodoro.sessions} sessions · {pomodoro.focusMinutes}min</span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Deadlines", value: activeAssignments.length, icon: "📋", color: "border-red-500/30 bg-red-500/5" },
            { label: "This Week", value: weekEvents.length, icon: "📅", color: "border-blue-500/30 bg-blue-500/5" },
            { label: "Focus Sessions", value: pomodoro.sessions, icon: "⏱", color: "border-violet-500/30 bg-violet-500/5" },
            { label: "Courses", value: courses.length, icon: "📚", color: "border-teal-500/30 bg-teal-500/5" },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl border ${stat.color} p-5`}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#c5c6cd] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-all">
            <span>▶</span> Start Focus Session
          </button>
          <button onClick={startPomodoro} className="flex items-center gap-2 bg-[#1b1b1d] border border-[#44474d] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#2a2a2c] transition-all">
            ⏱ Pomodoro
          </button>
          <button onClick={() => apiGet("recommendations").then(r => r.success && setRecommendations(r.data))} className="flex items-center gap-2 bg-[#1b1b1d] border border-[#44474d] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#2a2a2c] transition-all">
            💡 Refresh Recommendations
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Column 1: Upcoming Deadlines ── */}
          <div className="rounded-3xl border border-[#44474d] bg-[#1f1f21] p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <span className="text-[#dcb8ff]"><MaterialIcon name="assignment" /></span>
                Upcoming Deadlines
              </h2>
              <span className="text-xs text-[#c5c6cd] bg-[#2a2a2c] px-2 py-1 rounded-full">{activeAssignments.length} active</span>
            </div>

            {/* Add form */}
            <div className="space-y-2.5 mb-5">
              <input value={aTitle} onChange={e=>setATitle(e.target.value)} placeholder="Assignment title" className="w-full bg-[#1b1b1d] border border-[#44474d] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#8f9097] focus:outline-none focus:border-[#b9c7e4]/50 transition-all" />
              <input value={aSubject} onChange={e=>setASubject(e.target.value)} placeholder="Subject (e.g. Calculus)" className="w-full bg-[#1b1b1d] border border-[#44474d] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#8f9097] focus:outline-none focus:border-[#b9c7e4]/50 transition-all" />
              <div className="flex gap-2">
                <input type="datetime-local" value={aDeadline} onChange={e=>setADeadline(e.target.value)} className="flex-1 bg-[#1b1b1d] border border-[#44474d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#b9c7e4]/50 transition-all" />
                <select value={aPriority} onChange={e=>setAPriority(e.target.value)} className="bg-[#1b1b1d] border border-[#44474d] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                  <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
                </select>
              </div>
              <button onClick={addAssignment} className="w-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                + Add Assignment
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activeAssignments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm text-[#c5c6cd]">No upcoming deadlines</p>
                </div>
              )}
              {activeAssignments.sort((a,b)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime()).map(a => (
                <div key={a.id} className="p-3 rounded-xl border border-[#44474d] bg-[#1b1b1d] hover:border-[#8f9097]/40 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isOverdue(a.deadline)?"text-red-400":"text-white"}`}>{a.title}</p>
                      {a.subject && <p className="text-xs text-[#8f9097] mt-0.5">{a.subject}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pBadge(a.priority)}`}>{a.priority}</span>
                        <span className={`text-xs ${isOverdue(a.deadline)?"text-red-400":"text-[#8f9097]"}`}>{fmt(a.deadline)}</span>
                        {isToday(a.deadline) && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Today</span>}
                        {isSoon(a.deadline) && !isToday(a.deadline) && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full animate-pulse">Due soon</span>}
                        {isOverdue(a.deadline) && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full animate-pulse">OVERDUE</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={()=>markDone(a.id)} className="text-xs text-[#8f9097] hover:text-green-400 transition-colors p-1">✓</button>
                      <button onClick={()=>deleteAssignment(a.id)} className="text-xs text-[#8f9097] hover:text-red-400 transition-colors p-1">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Column 2: Schedule + Lecture Notes ── */}
          <div className="space-y-6">
            {/* Weekly Schedule */}
            <div className="rounded-3xl border border-[#44474d] bg-[#1f1f21] p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-[#7ad0ff]"><MaterialIcon name="calendar_month" /></span>
                  Weekly Schedule
                </h2>
                <span className="text-xs text-[#c5c6cd] bg-[#2a2a2c] px-2 py-1 rounded-full">{weekEvents.length} events</span>
              </div>
              <div className="space-y-2.5 mb-4">
                <input value={eTitle} onChange={e=>setETitle(e.target.value)} placeholder="Event / Class name" className="w-full bg-[#1b1b1d] border border-[#44474d] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#8f9097] focus:outline-none focus:border-[#b9c7e4]/50 transition-all" />
                <input type="datetime-local" value={eDateTime} onChange={e=>setEDateTime(e.target.value)} className="w-full bg-[#1b1b1d] border border-[#44474d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#b9c7e4]/50 transition-all" />
                <button onClick={addEvent} className="w-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">+ Add Event</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.length===0&&<p className="text-sm text-[#8f9097] text-center py-4">No events scheduled</p>}
                {events.sort((a,b)=>new Date(a.dateTime).getTime()-new Date(b.dateTime).getTime()).map(e=>(
                  <div key={e.id} className={`p-3 rounded-xl border ${isToday(e.dateTime)?"bg-[#0a192f] border-[#233554]":"bg-[#1b1b1d] border-[#44474d]"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{e.title}</p>
                        <p className={`text-xs mt-0.5 ${isToday(e.dateTime)?"text-[#7ad0ff]":"text-[#8f9097]"}`}>{fmt(e.dateTime)}</p>
                      </div>
                      <button onClick={()=>deleteEvent(e.id)} className="text-xs text-[#8f9097] hover:text-red-400 ml-2">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lecture Notes Summary */}
            <div className="rounded-3xl border border-[#44474d] bg-[#1f1f21] p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-[#dcb8ff]"><MaterialIcon name="auto_fix_high" /></span>
                  Lecture Summary
                </h2>
              </div>
              <textarea value={summaryText} onChange={e=>setSummaryText(e.target.value)} placeholder="Paste lecture notes here to get an AI summary..." rows={4} className="w-full bg-[#1b1b1d] border border-[#44474d] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8f9097] focus:outline-none focus:border-[#b9c7e4]/50 resize-none transition-all mb-3"/>
              <button onClick={handleSummarize} disabled={summarizing||!summaryText.trim()} className="w-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] disabled:opacity-40 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                {summarizing ? "✨ Analyzing..." : "✨ Summarize Notes"}
              </button>
              {summaryResult.length>0&&(
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[#dcb8ff] font-medium uppercase tracking-wide">Key Points</p>
                  {summaryResult.map((s,i)=>(
                    <div key={i} className="bg-[#0a192f] border border-[#233554] rounded-xl px-3 py-2">
                      <p className="text-sm text-[#e4e2e4]">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Column 3: Study Priorities + AI Hub + Courses ── */}
          <div className="space-y-6">
            {/* AI Assistant Hub */}
            <div className="rounded-3xl border border-[#7701d0]/40 bg-gradient-to-br from-[#0a192f] to-[#1f1f21] p-6">
              <div className="flex items-center gap-2 mb-4">
                <PulseDot color="bg-[#dcb8ff]" />
                <h2 className="font-bold text-lg text-white">AI Assistant</h2>
              </div>
              <div ref={chatRef} className="space-y-3 max-h-56 overflow-y-auto mb-4">
                {chatHistory.length===0&&(
                  <div className="text-center py-5">
                    <p className="text-3xl mb-2">🤖</p>
                    <p className="text-sm text-[#8f9097]">Ask about deadlines, courses, or study tips.</p>
                  </div>
                )}
                {chatHistory.map((m,i)=>(
                  <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role==="user"?"bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white":"bg-[#2a2a2c] border border-[#44474d] text-[#e4e2e4]"}`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {aiTyping&&(
                  <div className="flex justify-start">
                    <div className="bg-[#2a2a2c] border border-[#44474d] rounded-2xl px-4 py-2.5 text-sm text-[#8f9097] animate-pulse">Thinking...</div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask the AI anything..." className="flex-1 bg-[#1b1b1d] border border-[#44474d] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-[#8f9097] focus:outline-none focus:border-[#b9c7e4]/50 transition-all" />
                <button onClick={sendChat} className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] flex items-center justify-center text-white text-sm hover:opacity-90 transition-all shrink-0">▶</button>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="rounded-3xl border border-[#44474d] bg-[#1f1f21] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-[#7ad0ff]"><MaterialIcon name="lightbulb" /></span>
                  Recommendations
                </h2>
                <button onClick={()=>apiGet("recommendations").then(r=>r.success&&setRecommendations(r.data))} className="text-xs text-[#dcb8ff] hover:underline">Refresh</button>
              </div>
              <div className="space-y-3">
                {recommendations.map(rec=>(
                  <div key={rec.id} className="p-3 bg-[#1b1b1d] rounded-xl border border-[#44474d]">
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${pDot(rec.priority)}`}></span>
                      <p className="text-sm text-[#c5c6cd] leading-relaxed">{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Priorities */}
            <div className="rounded-3xl border border-[#44474d] bg-[#1f1f21] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-[#dcb8ff]"><MaterialIcon name="flag" /></span>
                  Study Priorities
                </h2>
              </div>
              {priorities.length===0?(
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm text-[#8f9097]">All caught up!</p>
                </div>
              ):(
                <div className="space-y-3">
                  {priorities.map((a,i)=>(
                    <div key={a.id} className={`border-l-4 pl-3 py-2 rounded-r-xl bg-[#1b1b1d] border-[${pDot(a.priority)}]`} style={{borderLeftColor: a.priority==="high"?"#ef4444":a.priority==="medium"?"#f59e0b":"#22c55e"}}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pBadge(a.priority)}`}>{a.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-white">{a.title}</p>
                      {a.subject&&<p className="text-xs text-[#8f9097] mt-0.5">{a.subject}</p>}
                      <p className="text-xs text-[#8f9097] mt-1">{fmt(a.deadline)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Courses Progress */}
            <div className="rounded-3xl border border-[#44474d] bg-[#1f1f21] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-[#dcb8ff]"><MaterialIcon name="school" /></span>
                  Courses
                </h2>
              </div>
              <div className="space-y-3">
                {courses.map(c=>(
                  <div key={c.id} className="bg-[#1b1b1d] rounded-xl p-3 border border-[#44474d]">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#b9c7e4]">{c.code}</span>
                        <span className="text-xs bg-[#7701d0]/20 text-[#dcb8ff] px-1.5 py-0.5 rounded">{c.grade}</span>
                      </div>
                      <span className="text-xs text-[#8f9097]">{c.credits}cr</span>
                    </div>
                    <p className="text-xs text-[#8f9097] mb-2">{c.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#2a2a2c] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] rounded-full transition-all" style={{width:`${c.progress}%`}}/>
                      </div>
                      <span className="text-xs text-[#8f9097] w-8 text-right">{c.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
