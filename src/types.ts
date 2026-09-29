export type TopicStatus = 'pending' | 'in-progress' | 'completed';

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  estimatedHours: number;
  priority: number; // 1 = highest
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  topics: Topic[];
}

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  topicId: string;
  topic: string;
  time: string; // e.g. "09:00"
  duration: number; // minutes
  done: boolean;
  isExtra: boolean;
  generated: boolean;
}

export interface Settings {
  studyStartDate: string;
  examDate: string;
  dayStudyHours: number;
  nightStudyHours: number;
  subjectOrder: string[];
  selectedSubjects: string[];
}
