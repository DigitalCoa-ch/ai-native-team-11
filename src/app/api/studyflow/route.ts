import { NextResponse } from 'next/server';

// In-memory store for demo (replace with DB/Redis in production)
interface Assignment { id: string; title: string; subject: string; deadline: string; priority: string; createdAt?: string; done?: boolean }
interface ScheduleEvent { id: string; title: string; dateTime: string; type?: string; createdAt?: string }
interface Course { id: string; name: string; code: string; credits: number; grade: string; progress: number }
interface PomodoroData { sessions: number; focusMinutes: number }

interface Store {
  assignments: Assignment[];
  schedule: ScheduleEvent[];
  courses: Course[];
  pomodoro: PomodoroData;
}

const store: Store = {
  assignments: [],
  schedule: [],
  courses: [
    { id: 'cs101', name: 'Computer Science 101', code: 'CS101', credits: 4, grade: 'A', progress: 78 },
    { id: 'math201', name: 'Advanced Mathematics', code: 'MATH201', credits: 3, grade: 'B+', progress: 65 },
    { id: 'phys150', name: 'Physics Fundamentals', code: 'PHYS150', credits: 4, grade: 'A-', progress: 52 },
    { id: 'eng102', name: 'Academic English', code: 'ENG102', credits: 2, grade: 'A', progress: 90 },
  ],
  pomodoro: { sessions: 0, focusMinutes: 0 },
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || searchParams.get('type');

  if (action === 'assignments') {
    return NextResponse.json({ success: true, data: store.assignments });
  }
  if (action === 'schedule') {
    return NextResponse.json({ success: true, data: store.schedule });
  }
  if (action === 'courses') {
    return NextResponse.json({ success: true, data: store.courses });
  }
  if (action === 'pomodoro') {
    return NextResponse.json({ success: true, data: store.pomodoro });
  }
  if (action === 'recommendations') {
    const recs = [
      { id: '1', text: 'Complete Math problem set by Thursday — high priority based on upcoming deadline.', priority: 'high' },
      { id: '2', text: 'Review Physics lecture notes — performance dipped last week according to your progress tracker.', priority: 'medium' },
      { id: '3', text: 'Start CS101 project early — the scope is larger than previous assignments.', priority: 'medium' },
    ];
    return NextResponse.json({ success: true, data: recs });
  }
  if (action === 'ai-suggest') {
    const prompt = searchParams.get('prompt') || '';
    const suggestions = [
      `Based on "${prompt.slice(0, 50)}...", here are 3 actionable steps:\n1. Break the task into 25-min Pomodoro blocks\n2. Start with the hardest section first (when focus is highest)\n3. Review and iterate — don't aim for perfection on first pass`,
    ];
    return NextResponse.json({ success: true, data: suggestions, prompt });
  }

  return NextResponse.json({ success: true, store });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === 'add-assignment') {
    const { title, subject, deadline, priority } = body as { title: string; subject: string; deadline: string; priority: string };
    if (!title || !deadline) {
      return NextResponse.json({ success: false, error: 'title and deadline required' }, { status: 400 });
    }
    const assignment: Assignment = {
      id: generateId(),
      title,
      subject: subject || 'General',
      deadline,
      priority: priority || 'medium',
      createdAt: new Date().toISOString(),
    };
    store.assignments.push(assignment);
    return NextResponse.json({ success: true, data: assignment });
  }

  if (action === 'delete-assignment') {
    const { id } = body as { id: string };
    store.assignments = store.assignments.filter((a) => a.id !== id);
    return NextResponse.json({ success: true });
  }

  if (action === 'mark-done') {
    const { id } = body as { id: string };
    const assignment = store.assignments.find((a) => a.id === id);
    if (assignment) assignment.done = true;
    return NextResponse.json({ success: true });
  }

  if (action === 'add-event') {
    const { title, dateTime, type } = body as { title: string; dateTime: string; type?: string };
    if (!title || !dateTime) {
      return NextResponse.json({ success: false, error: 'title and dateTime required' }, { status: 400 });
    }
    const event: ScheduleEvent = {
      id: generateId(),
      title,
      dateTime,
      type: type || 'class',
      createdAt: new Date().toISOString(),
    };
    store.schedule.push(event);
    return NextResponse.json({ success: true, data: event });
  }

  if (action === 'delete-event') {
    const { id } = body as { id: string };
    store.schedule = store.schedule.filter((e) => e.id !== id);
    return NextResponse.json({ success: true });
  }

  if (action === 'start-pomodoro') {
    store.pomodoro.sessions += 1;
    store.pomodoro.focusMinutes += 25;
    return NextResponse.json({ success: true, data: store.pomodoro, message: 'Pomodoro session started! 🎯' });
  }

  if (action === 'summarize-lecture') {
    const { text } = body as { text: string };
    if (!text || text.length < 10) {
      return NextResponse.json({ success: false, error: 'text too short' }, { status: 400 });
    }
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
    const bullets = paragraphs.slice(0, 5).map((p: string, i: number) => ({
      id: i + 1,
      point: p.replace(/\n/g, ' ').slice(0, 150) + (p.length > 150 ? '...' : ''),
    }));
    return NextResponse.json({
      success: true,
      data: bullets,
      meta: { originalLength: text.length, summaryLength: bullets.length },
    });
  }

  if (action === 'ai-chat') {
    const { message } = body as { message: string };
    if (!message) {
      return NextResponse.json({ success: false, error: 'message required' }, { status: 400 });
    }
    const lower = message.toLowerCase();
    let response = "I'm here to help! Can you tell me more about what you need?";
    
    if (lower.includes('deadline') || lower.includes('assignment')) {
      response = `📋 You have ${store.assignments.filter((a) => !a.done).length} active assignments.\n\n`;
      response += store.assignments.slice(0, 3).map((a) => 
        `• ${a.title} — ${a.subject} (${a.priority}) due ${new Date(a.deadline).toLocaleDateString()}`
      ).join('\n') || 'No assignments yet!';
    } else if (lower.includes('study') || lower.includes('focus')) {
      const top = store.assignments.filter((a) => !a.done).slice(0, 3);
      response = `🎯 Study Priority:\n${top.map((a, i) => `${i + 1}. ${a.title} (${a.priority})`).join('\n')}\n\n💡 Tip: Use Pomodoro technique — 25 min focus, 5 min break!`;
    } else if (lower.includes('course') || lower.includes('grade')) {
      response = `📚 Your Courses:\n${store.courses.map((c) => `• ${c.code} — ${c.name}: ${c.grade} (${c.progress}% complete)`).join('\n')}`;
    } else if (lower.includes('schedule') || lower.includes('class')) {
      response = `📅 Today's Schedule:\n${store.schedule.length > 0 ? store.schedule.map((e) => `• ${e.title} at ${new Date(e.dateTime).toLocaleTimeString()}`).join('\n') : 'No events scheduled'}`;
    }

    return NextResponse.json({ success: true, response, timestamp: new Date().toISOString() });
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
}