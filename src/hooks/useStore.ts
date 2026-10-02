import { useState, useEffect, useCallback, useRef } from 'react';
import type { Subject, Task, Settings, TopicStatus } from '@/types';
import {
  loadSubjects,
  saveSubjects,
  loadTasks,
  saveTasks,
  loadSettings,
  saveSettings,
  loadLockedDates,
  saveLockedDates,
} from '@/lib/storage';
import { planSchedule } from '@/lib/scheduler';
import { sortByOrder } from '@/lib/syllabus';
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

function topicStatusFromTasks(tasks: Task[], subject: Subject | undefined, topicId: string): TopicStatus | null {
  const topic = subject?.topics.find((t) => t.id === topicId);
  if (!subject || !topic) return null;
  const doneMin = tasks
    .filter((t) => t.done && t.subjectId === subject.id && t.topicId === topicId)
    .reduce((acc, t) => acc + t.duration, 0);
  if (doneMin >= topic.estimatedHours * 60) return 'completed';
  if (doneMin > 0 || topic.status !== 'not-started') return 'in-progress';
  return 'not-started';
}

export function useStore(): Store {
  const [subjects, setSubjectsState] = useState<Subject[]>(loadSubjects);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [settings, setSettingsState] = useState<Settings>(loadSettings);
  const [lockedDates, setLockedDates] = useState<string[]>([]);
  const plannedDay = useRef('');

  const commitPlan = useCallback(
    (
      nextSubjects: Subject[],
      nextSettings: Settings,
      nextTasks: Task[],
      nextLocked: string[],
      replanToday = false
    ) => {
      const today = todayStr();
      const locked = [...new Set(nextLocked)].filter((d) => d >= today);
      const planned = planSchedule(nextSubjects, nextSettings, nextTasks, {
        today,
        replanToday,
        lockedDates: locked,
      });
      plannedDay.current = today;
      setTasksState(planned);
      saveTasks(planned);
      setLockedDates(locked);
      saveLockedDates(locked);
    },
    []
  );

  useEffect(() => {
    const refresh = () => {
      const s = loadSubjects();
      const st = loadSettings();
      setSubjectsState(s);
      setSettingsState(st);
      commitPlan(s, st, loadTasks(), loadLockedDates());
    };
    refresh();
    const onFocus = () => {
      if (plannedDay.current !== todayStr()) refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [commitPlan]);

  const setSubjects = useCallback(
    (s: Subject[]) => {
      setSubjectsState(s);
      saveSubjects(s);
      commitPlan(s, settings, tasks, lockedDates, true);
    },
    [settings, tasks, lockedDates, commitPlan]
  );

  const setTasks = useCallback((t: Task[]) => {
    setTasksState(t);
    saveTasks(t);
  }, []);

  const setSettings = useCallback(
    (s: Settings) => {
      const ordered = sortByOrder(
        subjects.map((sub) => {
          const i = s.subjectOrder.indexOf(sub.id);
          return i === -1 ? sub : { ...sub, order: i };
        })
      );
      setSettingsState(s);
      saveSettings(s);
      setSubjectsState(ordered);
      saveSubjects(ordered);
      commitPlan(ordered, s, tasks, lockedDates, true);
    },
    [subjects, tasks, lockedDates, commitPlan]
  );

  const toggleSubjectSelection = useCallback(
    (subjectId: string) => {
      const updated = subjects.map((s) =>
        s.id === subjectId ? { ...s, enabled: !s.enabled } : s
      );
      setSubjectsState(updated);
      saveSubjects(updated);
      commitPlan(updated, settings, tasks, lockedDates, true);
    },
    [subjects, settings, tasks, lockedDates, commitPlan]
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
      commitPlan(updated, settings, tasks, lockedDates);
    },
    [subjects, settings, tasks, lockedDates, commitPlan]
  );

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      let updatedSubjects = subjects;
      if (task.topicId && task.subjectId) {
        const subject = subjects.find((s) => s.id === task.subjectId);
        const status = topicStatusFromTasks(updatedTasks, subject, task.topicId);
        if (status) {
          updatedSubjects = subjects.map((s) =>
            s.id === task.subjectId
              ? { ...s, topics: s.topics.map((t) => (t.id === task.topicId ? { ...t, status } : t)) }
              : s
          );
          setSubjectsState(updatedSubjects);
          saveSubjects(updatedSubjects);
        }
      }
      commitPlan(updatedSubjects, settings, updatedTasks, lockedDates);
    },
    [tasks, subjects, settings, lockedDates, commitPlan]
  );

  const addTask = useCallback(
    (task: Omit<Task, 'id'>) => {
      const newTask: Task = { ...task, id: crypto.randomUUID() };
      commitPlan(subjects, settings, [...tasks, newTask], [...lockedDates, task.date]);
    },
    [subjects, settings, tasks, lockedDates, commitPlan]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      commitPlan(
        subjects,
        settings,
        tasks.filter((t) => t.id !== id),
        [...lockedDates, task.date]
      );
    },
    [subjects, settings, tasks, lockedDates, commitPlan]
  );

  const generateSchedule = useCallback(() => {
    const today = todayStr();
    commitPlan(
      subjects,
      settings,
      tasks,
      lockedDates.filter((d) => d !== today),
      true
    );
  }, [subjects, settings, tasks, lockedDates, commitPlan]);

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
