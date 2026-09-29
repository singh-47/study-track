import { useState, useEffect, useCallback } from 'react';
import type { Subject, Task, Settings, TopicStatus } from '@/types';
import {
  loadSubjects,
  saveSubjects,
  loadTasks,
  saveTasks,
  loadSettings,
  saveSettings,
} from '@/lib/storage';
import { GATE_SUBJECTS, DEFAULT_SETTINGS } from '@/data/subjects';
import { generateDailyTasks } from '@/lib/scheduler';
import { todayStr } from '@/lib/dates';

export interface Store {
  subjects: Subject[];
  tasks: Task[];
  settings: Settings;
  setSubjects: (s: Subject[]) => void;
  setTasks: (t: Task[]) => void;
  setSettings: (s: Settings) => void;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (id: string) => void;
  toggleSubjectSelection: (subjectId: string) => void;
  setTopicStatus: (subjectId: string, topicId: string, status: TopicStatus) => void;
  generateSchedule: () => void;
}

export function useStore(): Store {
  const [subjects, setSubjectsState] = useState<Subject[]>(GATE_SUBJECTS);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSubjectsState(loadSubjects());
    setTasksState(loadTasks());
    setSettingsState(loadSettings());
  }, []);

  const setSubjects = useCallback((s: Subject[]) => {
    setSubjectsState(s);
    saveSubjects(s);
  }, []);

  const setTasks = useCallback((t: Task[]) => {
    setTasksState(t);
    saveTasks(t);
  }, []);

  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    saveSettings(s);
  }, []);

  const toggleSubjectSelection = useCallback(
    (subjectId: string) => {
      const updated = subjects.map((s) =>
        s.id === subjectId ? { ...s, selected: !s.selected } : s
      );
      setSubjectsState(updated);
      saveSubjects(updated);
    },
    [subjects]
  );

  const setTopicStatusImpl = useCallback(
    (subjectId: string, topicId: string, status: TopicStatus) => {
      const updated = subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: s.topics.map((t) => (t.id === topicId ? { ...t, status } : t)),
            }
          : s
      );
      setSubjectsState(updated);
      saveSubjects(updated);
    },
    [subjects]
  );

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      setTasksState(updated);
      saveTasks(updated);

      if (task.topicId && task.subjectId) {
        const newStatus: TopicStatus = task.done ? 'in-progress' : 'completed';
        setTopicStatusImpl(task.subjectId, task.topicId, newStatus);
      }
    },
    [tasks, setTopicStatusImpl]
  );

  const addTask = useCallback(
    (task: Omit<Task, 'id'>) => {
      const newTask: Task = { ...task, id: crypto.randomUUID() };
      const updated = [...tasks, newTask];
      setTasksState(updated);
      saveTasks(updated);
    },
    [tasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const updated = tasks.filter((t) => t.id !== id);
      setTasksState(updated);
      saveTasks(updated);
    },
    [tasks]
  );

  const generateSchedule = useCallback(() => {
    const today = todayStr();
    const newTasks = generateDailyTasks(subjects, settings, today);
    if (newTasks.length === 0) return;

    const existingNonGenerated = tasks.filter(
      (t) => t.date === today && (!t.generated || t.done)
    );
    const updated = [...existingNonGenerated, ...newTasks];
    setTasksState(updated);
    saveTasks(updated);
  }, [subjects, settings, tasks]);

  return {
    subjects,
    tasks,
    settings,
    setSubjects,
    setTasks,
    setSettings,
    toggleTask,
    addTask,
    deleteTask,
    toggleSubjectSelection,
    setTopicStatus: setTopicStatusImpl,
    generateSchedule,
  };
}
