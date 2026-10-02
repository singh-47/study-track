import { createClient } from '@supabase/supabase-js';
import type { Priority, Subject } from '@/types';

export interface TopicSuggestion {
  topicId: string;
  estimatedHours: number;
  priority: Priority;
  reason: string;
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const aiCoachEnabled = supabase !== null;

export async function suggestTopicPlan(subject: Subject): Promise<TopicSuggestion[]> {
  if (!supabase) throw new Error('AI is not configured');
  const { data, error } = await supabase.functions.invoke<{ suggestions: TopicSuggestion[] }>('study-coach', {
    body: {
      subjectName: subject.name,
      topics: subject.topics.map((t) => ({
        id: t.id,
        name: t.name,
        subtopics: t.subtopics.map((s) => s.name),
        estimatedHours: t.estimatedHours,
        priority: t.priority,
        status: t.status,
      })),
    },
  });
  if (error) throw new Error(error.message);
  return data?.suggestions ?? [];
}
