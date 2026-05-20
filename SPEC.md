---
provider: openclaw
agentId: ""
---

# Academic Workflow Assistant — Team 11

## 1. Concept & Vision

A calm, focused academic companion for university students (18-25). It doesn't try to do everything — it does **one thing well**: keeps the student ahead of their workload. Clean, distraction-free, with just enough intelligence to prioritize what matters most. Feels like a smart notebook, not enterprise software.

## 2. Design Language

- **Aesthetic**: Soft academic — think Notion meets a well-designed student planner. Light background, ink-dark text, accent colors for urgency levels.
- **Colors**:
  - Background: `#F8FAFC` (slate-50)
  - Card bg: `#FFFFFF`
  - Primary text: `#1E293B` (slate-800)
  - Muted text: `#64748B` (slate-500)
  - Accent/Action: `#6366F1` (indigo-500)
  - High priority: `#EF4444` (red-500)
  - Medium priority: `#F59E0B` (amber-500)
  - Low/_done: `#22C55E` (green-500)
  - Border: `#E2E8F0` (slate-200)
- **Typography**: System font stack (Tailwind default). Clean hierarchy.
- **Spatial**: Generous padding inside cards (p-5/p-6). 4px base grid.
- **Motion**: Subtle — cards fade in, deadline badges pulse gently if urgent.
- **Visual assets**: Emoji icons for quick recognition (📋 📅 📝 ⚡ 🎯).

## 3. Layout & Structure

Single page with a **sticky header** (app name + current date) and a **responsive card grid** below:

```
[Header: StudyFlow + date]
[3-col grid on desktop, 1-col on mobile]
  Left: Upcoming Deadlines (sorted by urgency)
  Middle: Add Assignment / Add Event
  Right: Lecture Summary + Study Priorities
```

No routing. Everything on one page. Simple.

## 4. Features & Interactions

### Assignments Panel
- List of assignments with: title, subject, deadline, priority (high/med/low)
- Add via inline form (title, subject, deadline, priority select)
- Color-coded left border by priority
- Overdue items shown in red with "OVERDUE" badge
- Delete button on hover

### Schedule Panel
- List of upcoming events/classes: title, date/time
- Add via inline form
- Date-sorted, nearest first
- Simple delete on hover

### Lecture Summary
- Textarea to paste lecture notes
- "Summarize" button → returns 3-5 bullet point summary (mock LLM for prototype)
- Summary displayed below

### Study Priorities
- Auto-generated list based on assignment deadlines + priority
- Shows top 3 things to focus on right now
- Refresh button to regenerate
- Motivational micro-copy

### Reminders
- Visual badges on items due within 24h (pulsing amber dot)
- Items due today get red highlight

## 5. Component Inventory

| Component | States |
|---|---|
| Assignment Card | default, overdue (red border), urgent <24h (amber badge), done (struck) |
| Schedule Card | default, happening-today (indigo highlight) |
| Add Form | idle, filled, submitting |
| Summary Output | empty, loading, populated |
| Priority List | empty (no assignments), populated (1-3 items) |
| Badge | low (green), medium (amber), high (red), overdue (red+pulse) |

## 6. Technical Approach

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **State**: React useState + localStorage for persistence
- **No API calls** — summary feature uses a mock summarizer (for prototype)
- **No external dependencies** beyond defaults
- **Data model**:
  ```ts
  type Priority = 'high' | 'medium' | 'low'
  type Assignment = { id: string; title: string; subject: string; deadline: string; priority: Priority; done: boolean }
  type ScheduleEvent = { id: string; title: string; dateTime: string }
  ```