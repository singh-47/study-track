import type { Subject, Task, Settings, TopicStatus } from '@/types';
import { GATE_SUBJECTS, DEFAULT_SETTINGS } from '@/data/subjects';

const SUBJECTS_KEY = 'gate_tracker_subjects';
const TASKS_KEY = 'gate_tracker_tasks';
const SETTINGS_KEY = 'gate_tracker_settings';
const VERSION_KEY = 'gate_tracker_version';
const CURRENT_VERSION = '2';
const LOCKED_DATES_KEY = 'gate_tracker_locked_dates';
const SETTINGS_VERSION_KEY = 'gate_tracker_settings_version';
const CURRENT_SETTINGS_VERSION = '2';

function migrateSubjects(raw: Subject[]): Subject[] {
  return GATE_SUBJECTS.map((baseSubject) => {
    const existing = raw.find((s) => s.id === baseSubject.id);
    if (!existing) return { ...baseSubject, selected: true };

    const migratedTopics = baseSubject.topics.map((baseTopic) => {
      const oldTopic = existing.topics.find((t) => t.id === baseTopic.id);
      if (oldTopic) {
        return { ...baseTopic, status: oldTopic.status };
      }
      return baseTopic;
    });

    return {
      ...baseSubject,
      selected: existing.selected ?? true,
      topics: migratedTopics,
    };
  });
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    const version = localStorage.getItem(VERSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Subject[];
      if (version !== CURRENT_VERSION) {
        const migrated = migrateSubjects(parsed);
        saveSubjects(migrated);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        return migrated;
      }
      return parsed;
    }
  } catch {}
  return GATE_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]): void {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw) as Task[];
  } catch {}
  return [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
      // v1 defaults (6h day + 2h night) become the 2 PM–4 PM + 8 PM–12 AM routine.
      if (localStorage.getItem(SETTINGS_VERSION_KEY) !== CURRENT_SETTINGS_VERSION) {
        if (settings.dayStudyHours === 6 && settings.nightStudyHours === 2) {
          settings.dayStudyHours = DEFAULT_SETTINGS.dayStudyHours;
          settings.nightStudyHours = DEFAULT_SETTINGS.nightStudyHours;
          saveSettings(settings);
        }
        localStorage.setItem(SETTINGS_VERSION_KEY, CURRENT_SETTINGS_VERSION);
      }
      return settings;
    }
  } catch {}
  localStorage.setItem(SETTINGS_VERSION_KEY, CURRENT_SETTINGS_VERSION);
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadLockedDates(): string[] {
  try {
    const raw = localStorage.getItem(LOCKED_DATES_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
  return [];
}

export function saveLockedDates(dates: string[]): void {
  localStorage.setItem(LOCKED_DATES_KEY, JSON.stringify(dates));
}

export function setTopicStatus(
  subjects: Subject[],
  subjectId: string,
  topicId: string,
  status: TopicStatus
): Subject[] {
  const updated = subjects.map((s) =>
    s.id === subjectId
      ? {
          ...s,
          topics: s.topics.map((t) => (t.id === topicId ? { ...t, status } : t)),
        }
      : s
  );
  saveSubjects(updated);
  return updated;
}
