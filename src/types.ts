export type TopicStatus = 'not-started' | 'in-progress' | 'completed';

export type Priority = 'High' | 'Medium' | 'Low';

export interface Subtopic {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
  estimatedHours: number;
  priority: Priority;
  status: TopicStatus;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  order: number;
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
