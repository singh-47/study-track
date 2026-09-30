import type { Subject, Settings } from '@/types';
import { GATE_2027_SYLLABUS } from '@/data/syllabus';

export const DEFAULT_TOPIC_HOURS = 4;

export const GATE_SUBJECTS: Subject[] = GATE_2027_SYLLABUS.map((subject, order) => ({
  id: subject.id,
  name: subject.name,
  icon: subject.icon,
  enabled: true,
  order,
  topics: subject.topics.map(([name, subtopics = []], i) => {
    const id = `${subject.id}-${i + 1}`;
    return {
      id,
      name,
      subtopics: subtopics.map((sub, j) => ({ id: `${id}-${j + 1}`, name: sub })),
      estimatedHours: DEFAULT_TOPIC_HOURS,
      priority: 'Medium' as const,
      status: 'not-started' as const,
    };
  }),
}));

export const DEFAULT_SETTINGS: Settings = {
  studyStartDate: new Date().toISOString().slice(0, 10),
  examDate: '2027-02-06',
  dayStudyHours: 2,
  nightStudyHours: 4,
  subjectOrder: GATE_SUBJECTS.map((s) => s.id),
  selectedSubjects: GATE_SUBJECTS.map((s) => s.id),
};
