import type { Subject, Settings } from '@/types';

export function subjectProgress(subject: Subject): number {
  if (subject.topics.length === 0) return 0;
  const done = subject.topics.filter((t) => t.status === 'completed').length;
  return Math.round((done / subject.topics.length) * 100);
}

export function overallProgress(subjects: Subject[]): number {
  if (subjects.length === 0) return 0;
  const total = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const done = subjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.status === 'completed').length,
    0
  );
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function totalTopics(subjects: Subject[]): number {
  return subjects.reduce((acc, s) => acc + s.topics.length, 0);
}

export function completedTopics(subjects: Subject[]): number {
  return subjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.status === 'completed').length,
    0
  );
}

export function totalStudyMinutes(tasks: { duration: number; done: boolean }[]): number {
  return tasks.filter((t) => t.done).reduce((acc, t) => acc + t.duration, 0);
}

export function plannedStudyMinutes(tasks: { duration: number }[]): number {
  return tasks.reduce((acc, t) => acc + t.duration, 0);
}
