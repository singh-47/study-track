import type { Subject, Topic, Subtopic } from '@/types';
import { DEFAULT_TOPIC_HOURS } from '@/data/subjects';

export type TopicPatch = Partial<Pick<Topic, 'name' | 'estimatedHours' | 'priority' | 'status'>>;

const newId = () => crypto.randomUUID();

function mapSubject(subjects: Subject[], subjectId: string, fn: (s: Subject) => Subject): Subject[] {
  return subjects.map((s) => (s.id === subjectId ? fn(s) : s));
}

function mapTopic(
  subjects: Subject[],
  subjectId: string,
  topicId: string,
  fn: (t: Topic) => Topic
): Subject[] {
  return mapSubject(subjects, subjectId, (s) => ({
    ...s,
    topics: s.topics.map((t) => (t.id === topicId ? fn(t) : t)),
  }));
}

export function sortByOrder(subjects: Subject[]): Subject[] {
  return [...subjects].sort((a, b) => a.order - b.order);
}

export function addSubject(subjects: Subject[], name: string): Subject[] {
  const order = subjects.reduce((max, s) => Math.max(max, s.order), -1) + 1;
  return [...subjects, { id: newId(), name, icon: 'BookOpen', enabled: true, order, topics: [] }];
}

export function addTopic(subjects: Subject[], subjectId: string, name: string): Subject[] {
  const topic: Topic = {
    id: newId(),
    name,
    subtopics: [],
    estimatedHours: DEFAULT_TOPIC_HOURS,
    priority: 'Medium',
    status: 'not-started',
  };
  return mapSubject(subjects, subjectId, (s) => ({ ...s, topics: [...s.topics, topic] }));
}

export function updateTopic(subjects: Subject[], subjectId: string, topicId: string, patch: TopicPatch): Subject[] {
  return mapTopic(subjects, subjectId, topicId, (t) => ({ ...t, ...patch }));
}

export function deleteTopic(subjects: Subject[], subjectId: string, topicId: string): Subject[] {
  return mapSubject(subjects, subjectId, (s) => ({ ...s, topics: s.topics.filter((t) => t.id !== topicId) }));
}

export function moveTopic(subjects: Subject[], subjectId: string, topicId: string, dir: -1 | 1): Subject[] {
  return mapSubject(subjects, subjectId, (s) => {
    const i = s.topics.findIndex((t) => t.id === topicId);
    const j = i + dir;
    if (i === -1 || j < 0 || j >= s.topics.length) return s;
    const topics = [...s.topics];
    [topics[i], topics[j]] = [topics[j], topics[i]];
    return { ...s, topics };
  });
}

export function addSubtopic(subjects: Subject[], subjectId: string, topicId: string, name: string): Subject[] {
  const subtopic: Subtopic = { id: newId(), name };
  return mapTopic(subjects, subjectId, topicId, (t) => ({ ...t, subtopics: [...t.subtopics, subtopic] }));
}

export function updateSubtopic(
  subjects: Subject[],
  subjectId: string,
  topicId: string,
  subtopicId: string,
  name: string
): Subject[] {
  return mapTopic(subjects, subjectId, topicId, (t) => ({
    ...t,
    subtopics: t.subtopics.map((st) => (st.id === subtopicId ? { ...st, name } : st)),
  }));
}

export function deleteSubtopic(subjects: Subject[], subjectId: string, topicId: string, subtopicId: string): Subject[] {
  return mapTopic(subjects, subjectId, topicId, (t) => ({
    ...t,
    subtopics: t.subtopics.filter((st) => st.id !== subtopicId),
  }));
}
