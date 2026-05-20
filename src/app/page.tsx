"use client";
import { useState, useEffect, useRef } from "react";
interface Assignment { id: string; title: string; subject: string; deadline: string; priority: string; done?: boolean }
interface ScheduleEvent { id: string; title: string; dateTime: string }
interface Course { id: string; name: string; code: string; credits: number; grade: string; progress: number }
interface PomodoroData { sessions: number; focusMinutes: number }
interface Recommendation { id: string; text: string; priority: string }
const API = "/api/studyflow";
async function apiGet(a: string) { return fetch(`${API}?action=${a}`).then(r => r.json()); }
async function apiPost(a: string, b: Record<string, unknown> = {}) { return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: a, ...b }) }).then(r => r.json()); }
const fmt = (d: string) => new Date(d).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
const isSoon = (d: string) => { const t = new Date().getTime(); return new Date(d).getTime() - t > 0 && new Date(d).getTime() - t < 86400000; };
const isOverdue = (d: string) => new Date(d) < new Date();
function PulseDot({ c }: { c?: string }) { return <span className="relative flex h-2 w-2"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c || "bg-teal-400"} opacity-75`}></span><span className={`relative inline-flex rounded-full h-2 w-2 ${c || "bg-teal-400"}`}></span></span>; }
function MIcon({ n, s }: { n: string; s?: number }) { return <span className="material-symbols-outlined" style={{ fontSize: s || 18 }}>{n}</span>; }
export default function CampusAIHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pomodoro, setPomodoro] = useState<PomodoroData>({ sessions: 0, focusMinutes: 0 });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [chat, setChat] = useState<{role: string; text: string}[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summary, setSummary] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [aTitle, setATitle] = useState("");
  const [aSubject, setASubject] = useState("");
  const [aDeadline, setADeadline] = useState("");
  const [aPriority, setAPriority] = useState("medium");
  const [eTitle, setETitle] = useState("");
  const [eDateTime, setEDateTime] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => { apiGet("assignments").then(r => r.success && setAssignments(r.data)); apiGet("schedule").then(r => r.success && setEvents(r.data)); apiGet("courses").then(r => r.success && setCourses(r.data)); apiGet("pomodoro").then(r => r.success && setPomodoro(r.data)); apiGet("recommendations").then(r => r.success && setRecommendations(r.data)); }, []);
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [chat]);
  const addAssignment = async () => { if (!aTitle || !aDeadline) return; const res = await apiPost("add-assignment", { title: aTitle, subject: aSubject, deadline: aDeadline, priority: aPriority }); if (res.success) { setAssignments(p => [...p, res.data]); setATitle(""); setASubject(""); setAPriority("medium"); } };
  const markDone = async (id: string) => { await apiPost("mark-done", { id }); setAssignments(p => p.map(a => a.id === id ? { ...a, done: true } : a)); };
  const deleteAssignment = async (id: string) => { await apiPost("delete-assignment", { id }); setAssignments(p => p.filter(a => a.id !== id)); };
  const addEvent = async () => { if (!eTitle || !eDateTime) return; const res = await apiPost("add-event", { title: eTitle, dateTime: eDateTime }); if (res.success) { setEvents(p => [...p, res.data]); setETitle(""); } };
  const deleteEvent = async (id: string) => { await apiPost("delete-event", { id }); setEvents(p => p.filter(e => e.id !== id)); };
  const startPomodoro = async () => { const res = await apiPost("start-pomodoro", {}); if (res.success) setPomodoro(res.data); };
  const handleSummarize = async () => { if (!summaryText.trim()) return; setSummarizing(true); const res = await apiPost("summarize-lecture", { text: summaryText }); if (res.success) setSummary(res.data.map((b: {point: string}) => b.point)); setSummarizing(false); };
  const sendChat = async () => { if (!chatMsg.trim()) return; const m = chatMsg; setChatMsg(""); setChat(p => [...p, { role: "user", text: m }]); setAiTyping(true); const res = await apiPost("ai-chat", { message: m }); setAiTyping(false); if (res.success) setChat(p => [...p, { role: "assistant", text: res.response }]); };
  const active = assignments.filter(a => !a.done);
  const priorities = [...active].sort((a, b) => { const s: Record<string, number> = { high: 0, medium: 1, low: 2 }; return s[a.priority] - s[b.priority] || new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); }).slice(0, 3);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const navItems = [{ id: "home", label: "Home", icon: "home" }, { id: "schedule", label: "Schedule", icon: "calendar_month" }, { id: "courses", label: "Courses", icon: "school" }, { id: "notes", label: "Notes", icon: "edit_note" }, { id: "settings", label: "Settings", icon: "settings" }];
  return (
    <div className="min-h-screen bg-[#0A192F] text-[#e4e2e4]">

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0A192F]/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7701d0] to-[#dcb8ff] flex items-center justify-center text-white font-bold text-xs">CA</div>
          <span className="font-bold text-sm text-white">CampusAI Navigator</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 bg-[#0a192f] border border-[#8f9097]/30 px-3 py-1 rounded-full text-xs text-[#b9c7e4]"><PulseDot c="bg-[#b9c7e4]" /> AI</button>
          <button onClick={() => setMenuOpen(true)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><MIcon n="menu" /></button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#0a192f] border-r border-[#233554] flex-col z-40">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[#233554]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7701d0] to-[#dcb8ff] flex items-center justify-center text-white font-bold text-sm shadow-lg">CA</div>
          <div><p className="text-sm font-bold text-white leading-tight">CampusAI</p><p className="text-xs text-[#74829d]">Navigator Pro</p></div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (<button key={item.id} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-[#112240] text-white border border-[#233554]"><MIcon n={item.icon} /> {item.label}</button>))}
        </nav>
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3 p-3 bg-[#112240] rounded-xl border border-[#233554]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b9c7e4] to-[#7701d0] flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white truncate">Alex Chen</p><p className="text-xs text-[#74829d] truncate">Computer Science · Yr 2</p></div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      {menuOpen && (<div className="lg:hidden fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} /><div className="relative w-72 bg-[#0a192f] border-r border-[#233554] flex flex-col"><div className="flex items-center justify-between px-5 py-6 border-b border-[#233554]"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7701d0] to-[#dcb8ff] flex items-center justify-center text-white font-bold text-sm">CA</div><div><p className="text-sm font-bold text-white">CampusAI</p><p className="text-xs text-[#74829d]">Navigator Pro</p></div></div><button onClick={() => setMenuOpen(false)} className="text-[#74829d] hover:text-white"><MIcon n="close" /></button></div><nav className="flex-1 px-3 py-4 space-y-1">{navItems.map(item => (<button key={item.id} onClick={() => setMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-[#112240] text-white border border-[#233554]"><MIcon n={item.icon} /> {item.label}</button>))}</nav><div className="px-4 pb-5"><div className="flex items-center gap-3 p-3 bg-[#112240] rounded-xl border border-[#233554]"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b9c7e4] to-[#7701d0] flex items-center justify-center text-white font-bold text-sm">A</div><div><p className="text-sm font-semibold text-white">Alex Chen</p><p className="text-xs text-[#74829d]">CS · Year 2</p></div></div></div></div></div>)}

      {/* Desktop Header */}
      <header className="hidden lg:flex sticky top-0 z-50 justify-between items-center ml-64 px-10 h-16 bg-[#0A192F]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74829d]"><MIcon n="search" s={16} /></div>
          <input placeholder="Search resources, notes, or courses..." className="w-full bg-[#112240] border border-[#233554] rounded-full py-2 pl-10 pr-4 text-sm text-[#e4e2e4] placeholder:text-[#74829d] focus:outline-none focus:border-[#b9c7e4]/50" />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#0a192f] text-[#b9c7e4] border border-[#8f9097]/30 px-4 py-1.5 rounded-full text-sm hover:bg-[#112240] transition-all"><PulseDot c="bg-[#b9c7e4]" /> AI Ready</button>
          <div className="flex items-center gap-2 border-l border-[#233554] pl-4"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b9c7e4] to-[#7701d0] flex items-center justify-center text-white font-bold text-xs">A</div><span className="text-sm text-white">Alex</span></div>
        </div>
      </header>

      <main className="lg:ml-64 px-4 lg:px-10 py-6 space-y-5">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a192f] via-[#0d2137] to-[#112240] border border-[#233554] p-6 lg:p-8 flex flex-col justify-between min-h-[220px]">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#7701d0]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#b9c7e4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[#b9c7e4] text-sm mb-1">{today}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">Welcome back, Alex! 👋</h1>
            <p className="text-[#c5c6cd] text-sm max-w-lg">Your AI-powered academic command center. Stay ahead of deadlines and focus on what matters.</p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-sm text-white">{active.length} Active Tasks</span></div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"><span className="text-sm text-[#dcb8ff]">🎯</span><span className="text-sm text-white">{priorities[0]?.title || "All caught up!"}</span></div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"><span className="text-sm text-[#7ad0ff]">⏱</span><span className="text-sm text-white">{pomodoro.sessions} sessions · {pomodoro.focusMinutes}min</span></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4"><p className="text-2xl font-bold text-white">{active.length}</p><p className="text-xs text-[#c5c6cd] mt-1">Active Deadlines</p></div>
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4"><p className="text-2xl font-bold text-white">{events.length}</p><p className="text-xs text-[#c5c6cd] mt-1">This Week</p></div>
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4"><p className="text-2xl font-bold text-white">{pomodoro.sessions}</p><p className="text-xs text-[#c5c6cd] mt-1">Focus Sessions</p></div>
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4"><p className="text-2xl font-bold text-white">{courses.length}</p><p className="text-xs text-[#c5c6cd] mt-1">Courses</p></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={startPomodoro} className="flex items-center gap-2 bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:opacity-90 transition-all"><MIcon n="play_arrow" s={16} /> Start Focus</button>
          <button onClick={startPomodoro} className="flex items-center gap-2 bg-[#112240] border border-[#233554] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1d3050] transition-all"><MIcon n="timer" s={16} /> Pomodoro</button>
          <button onClick={() => apiGet("recommendations").then(r => r.success && setRecommendations(r.data))} className="flex items-center gap-2 bg-[#112240] border border-[#233554] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1d3050] transition-all">💡 Recommendations</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Col 1: Deadlines */}
          <div className="rounded-2xl border border-[#233554] bg-[#112240] p-5">
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-base text-white flex items-center gap-2"><MIcon n="assignment" /> Upcoming Deadlines</h2><span className="text-xs text-[#74829d] bg-[#0a192f] px-2 py-0.5 rounded-full">{active.length}</span></div>
            <div className="space-y-2 mb-4">
              <input value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="Assignment title" className="w-full bg-[#0a192f] border border-[#233554] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#74829d] focus:outline-none focus:border-[#b9c7e4]/50" />
              <input value={aSubject} onChange={e => setASubject(e.target.value)} placeholder="Subject" className="w-full bg-[#0a192f] border border-[#233554] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#74829d] focus:outline-none focus:border-[#b9c7e4]/50" />
              <div className="flex gap-2">
                <input type="datetime-local" value={aDeadline} onChange={e => setADeadline(e.target.value)} className="flex-1 bg-[#0a192f] border border-[#233554] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#b9c7e4]/50" />
                <select value={aPriority} onChange={e => setAPriority(e.target.value)} className="bg-[#0a192f] border border-[#233554] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"><option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option></select>
              </div>
              <button onClick={addAssignment} className="w-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">+ Add Assignment</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {active.length === 0 && <p className="text-sm text-[#74829d] text-center py-4">No upcoming deadlines 🎉</p>}
              {active.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).map(a => {
                const overdue = isOverdue(a.deadline);
                const todayFlag = isToday(a.deadline);
                const soonFlag = isSoon(a.deadline);
                return (<div key={a.id} className="p-3 rounded-xl border border-[#233554] bg-[#0a192f] hover:border-[#8f9097]/40 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={"text-sm font-medium " + (overdue ? "text-red-400" : "text-white")}>{a.title}</p>
                      {a.subject ? <p className="text-xs text-[#74829d] mt-0.5">{a.subject}</p> : null}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={"text-xs px-2 py-0.5 rounded-full " + (a.priority === "high" ? "bg-red-500/20 text-red-300" : a.priority === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-teal-500/20 text-teal-300")}>{a.priority}</span>
                        <span className={"text-xs " + (overdue ? "text-red-400" : "text-[#74829d]")}>{fmt(a.deadline)}</span>
                        {todayFlag ? <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Today</span> : null}
                        {soonFlag && !todayFlag ? <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full animate-pulse">Due soon</span> : null}
                        {overdue ? <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full animate-pulse">OVERDUE</span> : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => markDone(a.id)} className="text-xs text-[#74829d] hover:text-green-400">✓</button>
                      <button onClick={() => deleteAssignment(a.id)} className="text-xs text-[#74829d] hover:text-red-400">✕</button>
                    </div>
                  </div>
                </div>);
              })}
            </div>
          </div>

          {/* Col 2: Schedule + Lecture Notes */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#233554] bg-[#112240] p-5">
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-base text-white flex items-center gap-2"><MIcon n="calendar_month" /> Schedule</h2></div>
              <div className="space-y-2 mb-4">
                <input value={eTitle} onChange={e => setETitle(e.target.value)} placeholder="Event / Class name" className="w-full bg-[#0a192f] border border-[#233554] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#74829d] focus:outline-none focus:border-[#b9c7e4]/50" />
                <input type="datetime-local" value={eDateTime} onChange={e => setEDateTime(e.target.value)} className="w-full bg-[#0a192f] border border-[#233554] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#b9c7e4]/50" />
                <button onClick={addEvent} className="w-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">+ Add Event</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.length === 0 && <p className="text-sm text-[#74829d] text-center py-4">No events scheduled</p>}
                {events.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(e => {
                  const eToday = isToday(e.dateTime);
                  return (<div key={e.id} className="p-3 rounded-xl border border-[#233554] bg-[#0a192f]">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{e.title}</p>
                        <p className={"text-xs mt-0.5 " + (eToday ? "text-[#7ad0ff]" : "text-[#74829d]")}>{fmt(e.dateTime)}</p>
                      </div>
                      <button onClick={() => deleteEvent(e.id)} className="text-xs text-[#74829d] hover:text-red-400 ml-2">✕</button>
                    </div>
                  </div>);
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#233554] bg-[#112240] p-5">
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-base text-white flex items-center gap-2"><MIcon n="auto_fix_high" /> Lecture Summary</h2></div>
              <textarea value={summaryText} onChange={e => setSummaryText(e.target.value)} placeholder="Paste lecture notes to summarize..." rows={4} className="w-full bg-[#0a192f] border border-[#233554] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#74829d] focus:outline-none focus:border-[#b9c7e4]/50 resize-none mb-3" />
              <button onClick={handleSummarize} disabled={summarizing || !summaryText.trim()} className="w-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] disabled:opacity-40 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">{summarizing ? "✨ Analyzing..." : "✨ Summarize"}</button>
              {summary.length > 0 && (<div className="mt-4 space-y-2"><p className="text-xs text-[#dcb8ff] font-medium uppercase tracking-wide">Key Points</p>{summary.map((s, i) => (<div key={i} className="bg-[#0a192f] border border-[#233554] rounded-xl px-3 py-2"><p className="text-sm text-[#e4e2e4]">{s}</p></div>))}</div>)}
            </div>
          </div>

          {/* Col 3: AI Hub + Recs + Priorities + Courses */}
          <div className="space-y-5">
            {/* AI Assistant */}
            <div className="rounded-2xl border border-[#7701d0]/40 bg-gradient-to-br from-[#0a192f] to-[#112240] p-5">
              <div className="flex items-center gap-2 mb-4"><PulseDot c="bg-[#dcb8ff]" /><h2 className="font-bold text-base text-white">AI Assistant</h2></div>
              <div ref={chatRef} className="space-y-3 max-h-56 overflow-y-auto mb-4">
                {chat.length === 0 && (<div className="text-center py-5"><p className="text-3xl mb-2">🤖</p><p className="text-sm text-[#74829d]">Ask about deadlines, courses, or study tips.</p></div>)}
                {chat.map((m, i) => (<div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}><div className={"max-w-[85%] rounded-2xl px-4 py-2.5 text-sm " + (m.role === "user" ? "bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] text-white" : "bg-[#1d3050] border border-[#233554] text-[#e4e2e4]")}><p className="whitespace-pre-wrap">{m.text}</p></div></div>))}
                {aiTyping && (<div className="flex justify-start"><div className="bg-[#1d3050] border border-[#233554] rounded-2xl px-4 py-2.5 text-sm text-[#74829d] animate-pulse">Thinking...</div></div>)}
              </div>
              <div className="flex gap-2">
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Ask the AI..." className="flex-1 bg-[#0a192f] border border-[#233554] rounded-full px-4 py-2.5 text-sm text-white placeholder:text-[#74829d] focus:outline-none focus:border-[#b9c7e4]/50" />
                <button onClick={sendChat} className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] flex items-center justify-center text-white text-sm hover:opacity-90 transition-all shrink-0">▶</button>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl border border-[#233554] bg-[#112240] p-5">
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-base text-white flex items-center gap-2"><MIcon n="lightbulb" /> Recommendations</h2><button onClick={() => apiGet("recommendations").then(r => r.success && setRecommendations(r.data))} className="text-xs text-[#dcb8ff] hover:underline">Refresh</button></div>
              <div className="space-y-3">
                {recommendations.map(rec => (<div key={rec.id} className="p-3 bg-[#0a192f] rounded-xl border border-[#233554]"><div className="flex items-start gap-2"><span className={"w-2 h-2 rounded-full mt-1.5 shrink-0 " + (rec.priority === "high" ? "bg-red-400" : rec.priority === "medium" ? "bg-amber-400" : "bg-teal-400")}></span><p className="text-sm text-[#c5c6cd] leading-relaxed">{rec.text}</p></div></div>))}
              </div>
            </div>

            {/* Study Priorities */}
            <div className="rounded-2xl border border-[#233554] bg-[#112240] p-5">
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-base text-white flex items-center gap-2"><MIcon n="flag" /> Study Priorities</h2></div>
              {priorities.length === 0 ? (<div className="text-center py-6"><p className="text-3xl mb-2">🎉</p><p className="text-sm text-[#74829d]">All caught up!</p></div>) : null}
              {priorities.map((a, i) => (<div key={a.id} className="border-l-4 pl-3 py-2 rounded-r-xl" style={{borderLeftColor: a.priority === "high" ? "#ef4444" : a.priority === "medium" ? "#f59e0b" : "#22c55e"}}><div className="flex items-center gap-2 mb-1"><span>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span><span className={"text-xs px-2 py-0.5 rounded-full " + (a.priority === "high" ? "bg-red-500/20 text-red-300" : a.priority === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-teal-500/20 text-teal-300")}>{a.priority}</span></div><p className="text-sm font-medium text-white">{a.title}</p>{a.subject ? <p className="text-xs text-[#74829d] mt-0.5">{a.subject}</p> : null}<p className="text-xs text-[#74829d] mt-1">{fmt(a.deadline)}</p></div>))}
            </div>

            {/* Courses */}
            <div className="rounded-2xl border border-[#233554] bg-[#112240] p-5">
              <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-base text-white flex items-center gap-2"><MIcon n="school" /> Courses</h2></div>
              <div className="space-y-3">
                {courses.map(c => (<div key={c.id} className="bg-[#0a192f] rounded-xl p-3 border border-[#233554]"><div className="flex justify-between items-center mb-1.5"><div className="flex items-center gap-2"><span className="text-xs font-bold text-[#b9c7e4]">{c.code}</span><span className="text-xs bg-[#7701d0]/20 text-[#dcb8ff] px-1.5 py-0.5 rounded">{c.grade}</span></div><span className="text-xs text-[#74829d]">{c.credits}cr</span></div><p className="text-xs text-[#74829d] mb-2">{c.name}</p><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-[#1d3050] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#7701d0] to-[#dcb8ff] rounded-full" style={{width: c.progress + "%"}} /></div><span className="text-xs text-[#74829d] w-8 text-right">{c.progress}%</span></div></div>))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
