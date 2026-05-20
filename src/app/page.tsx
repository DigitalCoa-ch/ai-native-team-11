"use client";

import { useState, useEffect, useRef } from "react";

// --- Types ---
interface Assignment { id: string; title: string; subject: string; deadline: string; priority: "high"|"medium"|"low"; done?: boolean; createdAt?: string }
interface ScheduleEvent { id: string; title: string; dateTime: string; type?: string; createdAt?: string }
interface Course { id: string; name: string; code: string; credits: number; grade: string; progress: number }
interface Recommendation { id: string; text: string; priority: "high"|"medium"|"low" }
interface PomodoroData { sessions: number; focusMinutes: number }

const API = "/api/studyflow";

// --- Helpers ---
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (dt: string) => new Date(dt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });
const isOverdue = (d: string) => new Date(d) < new Date();
const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
const isSoon = (d: string) => { const t = new Date().getTime(); return new Date(d).getTime() - t > 0 && new Date(d).getTime() - t < 86400000; };
const pColor = (p: string) => p === "high" ? "border-l-red-400" : p === "medium" ? "border-l-amber-400" : "border-l-teal-400";
const pBadge = (p: string) => p === "high" ? "bg-red-500/20 text-red-300" : p === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-teal-500/20 text-teal-300";

// --- API helper ---
async function apiGet(action: string) {
  const r = await fetch(`${API}?action=${action}`);
  return r.json();
}
async function apiPost(action: string, body: Record<string, unknown>) {
  const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
  return r.json();
}

// --- Glass Panel ---
function Glass({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md ${className}`}>{children}</div>;
}

// --- AI Pulse dot ---
function PulseDot() {
  return <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span></span>;
}

// --- Main Component ---
export default function CampusAINavigator() {
  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pomodoro, setPomodoro] = useState<PomodoroData>({ sessions: 0, focusMinutes: 0 });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role:string; text:string}>>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryResult, setSummaryResult] = useState<string[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  // Form state
  const [aTitle, setATitle] = useState("");
  const [aSubject, setASubject] = useState("");
  const [aDeadline, setADeadline] = useState("");
  const [aPriority, setAPriority] = useState<"high"|"medium"|"low">("medium");

  const [eTitle, setETitle] = useState("");
  const [eDateTime, setEDateTime] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    apiGet("assignments").then(r => r.success && setAssignments(r.data));
    apiGet("schedule").then(r => r.success && setEvents(r.data));
    apiGet("courses").then(r => r.success && setCourses(r.data));
    apiGet("pomodoro").then(r => r.success && setPomodoro(r.data));
    apiGet("recommendations").then(r => r.success && setRecommendations(r.data));
  }, []);

  // Scroll chat
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [chatHistory]);

  // Handlers
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
    if (r.success) { setPomodoro(r.data); }
  };

  const handleSummarize = async () => {
    if (!summaryText.trim()) return;
    setSummarizing(true);
    const r = await apiPost("summarize-lecture", { text: summaryText });
    if (r.success) setSummaryResult(r.data.map((b: {point:string}) => b.point));
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

  // Priorities
  const priorities = assignments.filter(a => !a.done).sort((a,b) => {
    const s = { high: 0, medium: 1, low: 2 };
    return s[a.priority] - s[b.priority] || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  }).slice(0, 3);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#0A192F] text-[#E4E2E4]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-[#0A192F]/80">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">CA</div>
            <span className="font-bold text-lg text-white">CampusAI Navigator</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#c5c6cd] hidden sm:block">{today}</span>
            <button className="flex items-center gap-2 bg-[#b9c7e4]/10 border border-[#b9c7e4]/30 px-4 py-1.5 rounded-full text-sm text-[#b9c7e4] hover:bg-[#b9c7e4]/20 transition-all">
              <PulseDot/> AI Ready
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 space-y-6">
        {/* Hero: Academic Mission */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Academic Mission</h1>
              <p className="text-[#c5c6cd] max-w-xl">AI-powered dashboard that organizes assignments, summarizes lectures, and keeps you ahead of your workload.</p>
              {priorities.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-teal-400 font-medium">🎯 Next up:</span>
                  <span className="text-sm text-white">{priorities[0].title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${pBadge(priorities[0].priority)}`}>{priorities[0].priority}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2 rounded-full text-white font-medium text-sm transition-all">View Dashboard</button>
              <button onClick={startPomodoro} className="bg-gradient-to-r from-violet-500 to-blue-500 hover:opacity-90 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg transition-all flex items-center gap-2">
                ⏱ Start Focus
              </button>
            </div>
          </div>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Deadlines + Courses */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">📋 Upcoming Deadlines</h2>
                <span className="text-xs text-[#c5c6cd]">{assignments.filter(a=>!a.done).length} active</span>
              </div>
              <div className="space-y-3 mb-4">
                <input value={aTitle} onChange={e=>setATitle(e.target.value)} placeholder="Assignment title" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400/50"/>
                <input value={aSubject} onChange={e=>setASubject(e.target.value)} placeholder="Subject" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400/50"/>
                <div className="flex gap-2">
                  <input type="datetime-local" value={aDeadline} onChange={e=>setADeadline(e.target.value)} className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400/50"/>
                  <select value={aPriority} onChange={e=>setAPriority(e.target.value as any)} className="bg-white/5 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="high">🔴</option><option value="medium">🟡</option><option value="low">🟢</option>
                  </select>
                </div>
                <button onClick={addAssignment} className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">+ Add Assignment</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assignments.filter(a=>!a.done).length===0 && <p className="text-sm text-white/40 text-center py-4">No upcoming deadlines 🎉</p>}
                {assignments.filter(a=>!a.done).sort((a,b)=>new Date(a.deadline).getTime()-new Date(b.deadline).getTime()).map(a=>(
                  <div key={a.id} className={`border-l-4 ${pColor(a.priority)} bg-white/5 rounded-r-xl p-3`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isOverdue(a.deadline)?"text-red-400":"text-white"}`}>{a.title}</p>
                        {a.subject && <p className="text-xs text-white/50 mt-0.5">{a.subject}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${pBadge(a.priority)}`}>{a.priority}</span>
                          <span className={`text-xs ${isOverdue(a.deadline)?"text-red-400":"text-white/40"}`}>{fmt(a.deadline)}</span>
                          {isToday(a.deadline)&&<span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Today</span>}
                          {isSoon(a.deadline)&&<span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full animate-pulse">Due soon</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={()=>markDone(a.id)} className="text-xs text-white/30 hover:text-green-400">✓</button>
                        <button onClick={()=>deleteAssignment(a.id)} className="text-xs text-white/30 hover:text-red-400">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Courses */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-white">📚 Your Courses</h2>
              </div>
              <div className="space-y-3">
                {courses.map(c=>(
                  <div key={c.id} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-white">{c.code}</span>
                      <span className="text-xs text-violet-300">{c.credits} credits</span>
                    </div>
                    <p className="text-xs text-white/60 mb-2">{c.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" style={{width:`${c.progress}%`}}/>
                      </div>
                      <span className="text-xs text-white/50">{c.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
          {/* Middle: Schedule + Lecture Summary */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">📅 Today's Schedule</h2>
              </div>
              <div className="space-y-2 mb-4">
                <input value={eTitle} onChange={e=>setETitle(e.target.value)} placeholder="Event / Class name" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400/50"/>
                <input type="datetime-local" value={eDateTime} onChange={e=>setEDateTime(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400/50"/>
                <button onClick={addEvent} className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">+ Add Event</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.length===0&&<p className="text-sm text-white/40 text-center py-4">No events scheduled</p>}
                {events.sort((a,b)=>new Date(a.dateTime).getTime()-new Date(b.dateTime).getTime()).map(e=>(
                  <div key={e.id} className={`p-3 rounded-xl border ${isToday(e.dateTime)?"bg-blue-500/10 border-blue-500/30":"bg-white/5 border-white/10"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-white">{e.title}</p>
                        <p className={`text-xs mt-0.5 ${isToday(e.dateTime)?"text-blue-300":"text-white/40"}`}>{fmt(e.dateTime)}</p>
                      </div>
                      <button onClick={()=>deleteEvent(e.id)} className="text-xs text-white/30 hover:text-red-400 ml-2">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Pomodoro Stats */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">⏱ Pomodoro Focus</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-white">{pomodoro.sessions}</p>
                  <p className="text-xs text-white/50 mt-1">Sessions Today</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-3xl font-bold text-white">{pomodoro.focusMinutes}</p>
                  <p className="text-xs text-white/50 mt-1">Focus Minutes</p>
                </div>
              </div>
              <button onClick={startPomodoro} className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                ▶ Start 25-min Session
              </button>
            </Glass>

            {/* Lecture Notes Summary */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">📝 Lecture Summary</h2>
              </div>
              <textarea value={summaryText} onChange={e=>setSummaryText(e.target.value)} placeholder="Paste lecture notes here to get an AI summary..." rows={4} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400/50 resize-none mb-3"/>
              <button onClick={handleSummarize} disabled={summarizing||!summaryText.trim()} className="w-full bg-gradient-to-r from-violet-500 to-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
                {summarizing?"✨ Analyzing...":"✨ Summarize"}
              </button>
              {summaryResult.length>0&&(
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-violet-300 font-medium uppercase tracking-wide">Key Points</p>
                  {summaryResult.map((s,i)=>(
                    <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                      <p className="text-sm text-white/80">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </Glass>
          </div>

          {/* Right: AI Hub + Recommendations */}
          <div className="space-y-6">
            {/* AI Assistant Hub */}
            <Glass className="p-6 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-4">
                <PulseDot/>
                <h2 className="font-bold text-lg text-white">AI Assistant Hub</h2>
              </div>
              <div ref={chatRef} className="space-y-3 max-h-72 overflow-y-auto mb-4">
                {chatHistory.length===0&&(
                  <div className="text-center py-6">
                    <p className="text-3xl mb-2">🤖</p>
                    <p className="text-sm text-white/50">Ask me anything about your assignments, courses, or study plan.</p>
                  </div>
                )}
                {chatHistory.map((m,i)=>(
                  <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role==="user"?"bg-gradient-to-r from-violet-500 to-blue-500 text-white":"bg-white/10 border border-white/10 text-white/90"}`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {aiTyping&&(
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/50 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input value={chatMessage} onChange={e=>setChatMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask about deadlines, courses, study tips..." className="flex-1 bg-white/5 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400/50"/>
                <button onClick={sendChat} className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm hover:opacity-90 transition-all">▶</button>
              </div>
            </Glass>

            {/* Smart Recommendations */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">💡 Recommendations</h2>
                <button onClick={()=>apiGet("recommendations").then(r=>r.success&&setRecommendations(r.data))} className="text-xs text-violet-300 hover:underline">Refresh</button>
              </div>
              <div className="space-y-3">
                {recommendations.map(rec=>(
                  <div key={rec.id} className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{(rec as any).priority==="high"?"🔴":(rec as any).priority==="medium"?"🟡":"🟢"}</span>
                      <p className="text-sm text-white/80 leading-relaxed">{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>

            {/* Study Priorities */}
            <Glass className="p-6 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">⚡ Study Priorities</h2>
              </div>
              {priorities.length===0?(
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm text-white/50">All caught up! Add assignments to see priorities.</p>
                </div>
              ):(
                <div className="space-y-3">
                  {priorities.map((a,i)=>(
                    <div key={a.id} className={`border-l-4 ${pColor(a.priority)} bg-white/5 rounded-r-xl p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pBadge(a.priority)}`}>{a.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-white">{a.title}</p>
                      {a.subject&&<p className="text-xs text-white/50 mt-0.5">{a.subject}</p>}
                      <p className="text-xs text-white/40 mt-1">{fmt(a.deadline)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Glass>
          </div>
        </div>
      </main>
    </div>
  );
}
