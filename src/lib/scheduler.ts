import type { Subject, Task, Settings, Topic, Priority } from '@/types';
import { nextNDays } from '@/lib/dates';

export const DAY_START = 14 * 60; // 2:00 PM
export const NIGHT_START = 20 * 60; // 8:00 PM
const DAY_END_LIMIT = NIGHT_START;
const NIGHT_END_LIMIT = 24 * 60; // 12:00 AM
const MIN_CHUNK = 15;
const REVIEW_MINUTES = 30;
export const PLAN_DAYS = 8; // today + next 7 days (matches the Schedule page)

export type PriorityLevel = Priority;

const LEVEL_RANK: Record<PriorityLevel, number> = { High: 0, Medium: 1, Low: 2 };

export interface PlanOptions {
  today: string;
  /** Regenerate today's incomplete auto tasks (unless today was manually edited). */
  replanToday: boolean;
  /** Dates the user edited manually; their tasks are never regenerated. */
  lockedDates: string[];
}

interface Slot {
  start: number;
  end: number;
}

interface QueueItem {
  subject: Subject;
  topic: Topic;
  remaining: number;
  part: number;
  split: boolean;
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function studyBlocks(settings: Settings): Slot[] {
  const dayMin = Math.min(Math.max(settings.dayStudyHours, 0) * 60, DAY_END_LIMIT - DAY_START);
  const nightMin = Math.min(Math.max(settings.nightStudyHours, 0) * 60, NIGHT_END_LIMIT - NIGHT_START);
  return [
    { start: DAY_START, end: DAY_START + dayMin },
    { start: NIGHT_START, end: NIGHT_START + nightMin },
  ].filter((b) => b.end > b.start);
}

function freeSlots(blocks: Slot[], busy: Task[]): Slot[] {
  const taken = busy
    .map((t) => ({ start: toMinutes(t.time), end: toMinutes(t.time) + t.duration }))
    .sort((a, b) => a.start - b.start);
  const free: Slot[] = [];
  for (const block of blocks) {
    let cursor = block.start;
    for (const t of taken) {
      if (t.end <= cursor || t.start >= block.end) continue;
      if (t.start > cursor) free.push({ start: cursor, end: t.start });
      cursor = Math.max(cursor, t.end);
    }
    if (cursor < block.end) free.push({ start: cursor, end: block.end });
  }
  return free;
}

function buildQueue(subjects: Subject[], kept: Task[], today: string): QueueItem[] {
  const doneMin = new Map<string, number>();
  const openMin = new Map<string, number>();
  const parts = new Map<string, number>();
  for (const t of kept) {
    if (!t.topicId) continue;
    const key = `${t.subjectId}/${t.topicId}`;
    if (t.done) doneMin.set(key, (doneMin.get(key) ?? 0) + t.duration);
    else if (t.date >= today) openMin.set(key, (openMin.get(key) ?? 0) + t.duration);
    else continue;
    if (t.generated) parts.set(key, (parts.get(key) ?? 0) + 1);
  }

  const candidates: { subject: Subject; topic: Topic; index: number }[] = [];
  for (const subject of subjects) {
    if (!subject.enabled) continue;
    subject.topics.forEach((topic, index) => {
      if (topic.status !== 'completed') candidates.push({ subject, topic, index });
    });
  }
  candidates.sort(
    (a, b) =>
      LEVEL_RANK[a.topic.priority] - LEVEL_RANK[b.topic.priority] ||
      a.subject.order - b.subject.order ||
      a.index - b.index
  );

  const queue: QueueItem[] = [];
  for (const { subject, topic } of candidates) {
    const key = `${subject.id}/${topic.id}`;
    const total = Math.round(topic.estimatedHours * 60);
    const done = topic.status === 'not-started' ? 0 : doneMin.get(key) ?? 0;
    const open = openMin.get(key) ?? 0;
    let remaining = total - done - open;
    if (remaining <= 0 && open === 0) remaining = Math.min(REVIEW_MINUTES, total);
    if (remaining <= 0) continue;
    const prevParts = parts.get(key) ?? 0;
    queue.push({ subject, topic, remaining, part: prevParts + 1, split: prevParts > 0 });
  }
  return queue;
}

/**
 * Rebuilds the rolling schedule. Past tasks, completed tasks, manual tasks and
 * tasks on locked dates are kept untouched; incomplete auto tasks on regenerable
 * dates are replaced by a fresh plan for today..today+PLAN_DAYS-1.
 */
export function planSchedule(
  subjects: Subject[],
  settings: Settings,
  tasks: Task[],
  { today, replanToday, lockedDates }: PlanOptions
): Task[] {
  const locked = new Set(lockedDates);
  const todayHasPlan = tasks.some((t) => t.date === today && t.generated);
  const regenerable = (date: string) => {
    if (date < today || locked.has(date)) return false;
    if (date === today) return replanToday || !todayHasPlan;
    return true;
  };

  const topicExists = (t: Task) =>
    subjects.some((s) => s.id === t.subjectId && s.topics.some((tp) => tp.id === t.topicId));
  const kept = tasks.filter(
    (t) =>
      t.done ||
      !t.generated ||
      (!regenerable(t.date) && (t.date < today || topicExists(t)))
  );
  const queue = buildQueue(subjects, kept, today);
  const blocks = studyBlocks(settings);
  const created: Task[] = [];

  for (const date of nextNDays(today, PLAN_DAYS)) {
    if (queue.length === 0) break;
    if (!regenerable(date)) continue;

    for (const slot of freeSlots(blocks, kept.filter((t) => t.date === date))) {
      let cursor = slot.start;
      while (queue.length > 0 && slot.end - cursor >= MIN_CHUNK) {
        const item = queue[0];
        const take = Math.min(item.remaining, slot.end - cursor);
        const isSplit = item.split || take < item.remaining;
        created.push({
          id: crypto.randomUUID(),
          date,
          subjectId: item.subject.id,
          topicId: item.topic.id,
          topic: isSplit ? `${item.topic.name} (Part ${item.part})` : item.topic.name,
          time: formatTime(cursor),
          duration: take,
          done: false,
          isExtra: false,
          generated: true,
        });
        cursor += take;
        item.remaining -= take;
        item.part += 1;
        item.split = true;
        if (item.remaining <= 0) queue.shift();
      }
    }
  }

  return [...kept, ...created];
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

export function formatTimeRange(time: string, duration: number): string {
  const start = toMinutes(time);
  return `${formatClock(start)} – ${formatClock(start + duration)}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function taskPriority(task: Task, subjects: Subject[]): PriorityLevel | null {
  const topic = subjects
    .find((s) => s.id === task.subjectId)
    ?.topics.find((t) => t.id === task.topicId);
  return topic ? topic.priority : null;
}

/** First unfinished task starting at or after `nowMinutes` today, or on a later day. */
export function nextIncompleteTask(tasks: Task[], today: string, nowMinutes: number): Task | undefined {
  return tasks
    .filter((t) => !t.done && (t.date > today || (t.date === today && toMinutes(t.time) >= nowMinutes)))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
}
