import type { Subject, Task, Settings, Topic } from '@/types';

const DAY_START = 9 * 60; // 09:00 in minutes
const NIGHT_START = 19 * 60; // 19:00 in minutes
const LUNCH_START = 13 * 60; // 13:00
const LUNCH_END = 14 * 60; // 14:00
const BREAK_MINUTES = 15;
const SESSION_MINUTES = 90;

export function generateDailyTasks(
  subjects: Subject[],
  settings: Settings,
  date: string
): Task[] {
  const totalMinutes = (settings.dayStudyHours + settings.nightStudyHours) * 60;

  const selectedSubjects = subjects
    .filter((s) => s.selected)
    .sort((a, b) => {
      const oa = settings.subjectOrder.indexOf(a.id);
      const ob = settings.subjectOrder.indexOf(b.id);
      return oa - ob;
    });

  const candidates: { subject: Subject; topic: Topic; topicIndex: number }[] = [];
  for (const subject of selectedSubjects) {
    subject.topics.forEach((topic, idx) => {
      if (topic.status !== 'completed') {
        candidates.push({ subject, topic, topicIndex: idx });
      }
    });
  }

  candidates.sort((a, b) => {
    if (a.topic.priority !== b.topic.priority) return a.topic.priority - b.topic.priority;
    const oa = settings.subjectOrder.indexOf(a.subject.id);
    const ob = settings.subjectOrder.indexOf(b.subject.id);
    if (oa !== ob) return oa - ob;
    return a.topicIndex - b.topicIndex;
  });

  const tasks: Task[] = [];
  let scheduled = 0;
  let clock = DAY_START;

  for (const { subject, topic } of candidates) {
    if (scheduled >= totalMinutes) break;

    if (clock >= LUNCH_START && clock < LUNCH_END) clock = LUNCH_END;

    const sessionMin = Math.min(topic.estimatedHours * 60, SESSION_MINUTES);

    tasks.push({
      id: crypto.randomUUID(),
      date,
      subjectId: subject.id,
      topicId: topic.id,
      topic: topic.name,
      time: formatTime(clock),
      duration: sessionMin,
      done: false,
      isExtra: false,
      generated: true,
    });

    scheduled += sessionMin;
    clock += sessionMin + BREAK_MINUTES;
  }

  return tasks;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
