import { useState } from 'react';
import { Plus, Target, CalendarDays, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import type { Store } from '@/hooks/useStore';
import { todayStr, daysBetween, formatDate } from '@/lib/dates';
import { totalStudyMinutes } from '@/lib/progress';
import TaskRow from '@/components/TaskRow';
import ProgressBar from '@/components/ProgressBar';
import { GATE_SUBJECTS } from '@/data/subjects';
import { nextIncompleteTask, toMinutes, formatTimeRange, NIGHT_START } from '@/lib/scheduler';

export default function HomePage({ store }: { store: Store }) {
  const { subjects, tasks, settings, toggleTask, generateSchedule } = store;
  const today = todayStr();
  const daysLeft = daysBetween(today, settings.examDate);
  const todayTasks = tasks
    .filter((t) => t.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const completedToday = todayTasks.filter((t) => t.done).length;
  const todayProgress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const studyMinutes = totalStudyMinutes(todayTasks);
  const hasGeneratedTasks = todayTasks.some((t) => t.generated);

  const now = new Date();
  const currentTask = todayTasks.find((t) => {
    const [h, m] = t.time.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + t.duration * 60000);
    return now >= start && now <= end;
  });
  const nextTask = nextIncompleteTask(
    tasks.filter((t) => t.id !== currentTask?.id),
    today
  );
  const routineGroups = [
    { label: 'Day Study', tasks: todayTasks.filter((t) => toMinutes(t.time) < NIGHT_START) },
    { label: 'Night Study', tasks: todayTasks.filter((t) => toMinutes(t.time) >= NIGHT_START) },
  ].filter((g) => g.tasks.length > 0);

  const selectedSubjects = subjects.filter((s) => s.selected);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">GATE 2027 Study Tracker</h1>
        <p className="text-slate-500 mt-1">Computer Science & Information Technology</p>
      </div>

      {/* Countdown card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-100 text-sm">Exam Countdown</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold">{daysLeft}</span>
              <span className="text-blue-100">days left</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">{formatDate(settings.examDate)}</p>
          </div>
          <CalendarDays className="w-12 h-12 text-blue-300" />
        </div>
      </div>

      {/* Today's progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Target className="w-4 h-4" /> Today's Progress
          </div>
          <p className="text-2xl font-bold text-slate-800">{todayProgress}%</p>
          <ProgressBar value={todayProgress} className="mt-2" />
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" /> Tasks Done
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {completedToday}<span className="text-slate-400 text-base">/{todayTasks.length}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <TrendingUp className="w-4 h-4" /> Study Time
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {Math.floor(studyMinutes / 60)}h <span className="text-base">{studyMinutes % 60}m</span>
          </p>
        </div>
      </div>

      {/* Current / Next task */}
      {(currentTask || nextTask) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {currentTask && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Current Task</p>
              <p className="text-slate-800 font-medium mt-1">{currentTask.topic}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {GATE_SUBJECTS.find((s) => s.id === currentTask.subjectId)?.name}
              </p>
            </div>
          )}
          {nextTask && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Task</p>
              <p className="text-slate-800 font-medium mt-1">{nextTask.topic}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {GATE_SUBJECTS.find((s) => s.id === nextTask.subjectId)?.name} ·{' '}
                {nextTask.date !== today && `${formatDate(nextTask.date)}, `}
                {formatTimeRange(nextTask.time, nextTask.duration)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Daily Routine */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800">Today's Routine</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{formatDate(today)}</span>
            {!hasGeneratedTasks && (
              <button
                onClick={generateSchedule}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-400 mb-3">No tasks scheduled for today.</p>
              <button
                onClick={generateSchedule}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Generate Today's Schedule
              </button>
            </div>
          ) : (
            routineGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">{group.label}</p>
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} subjects={subjects} onToggle={toggleTask} />
                ))}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-3">
          <AddTaskButton store={store} date={today} isExtra={false} label="+ Add Task" />
          <AddTaskButton store={store} date={today} isExtra={true} label="+ Extra Study" />
        </div>
      </div>

      {/* Compact subject progress - selected subjects only */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Subject Progress</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {selectedSubjects.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              No subjects selected. Go to Settings to select subjects.
            </div>
          ) : (
            selectedSubjects.map((subject) => {
              const done = subject.topics.filter((t) => t.status === 'completed').length;
              const pct = Math.round((done / subject.topics.length) * 100);
              return (
                <div key={subject.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-sm text-slate-600 flex-1 truncate">{subject.name}</span>
                  <span className="text-xs text-slate-400 w-20 text-right">{done}/{subject.topics.length}</span>
                  <div className="w-24">
                    <ProgressBar value={pct} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 w-8 text-right">{pct}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  function AddTaskButton({
    store,
    date,
    isExtra,
    label,
  }: {
    store: Store;
    date: string;
    isExtra: boolean;
    label: string;
  }) {
    const [open, setOpen] = useState(false);
    const [subjectId, setSubjectId] = useState(store.subjects[0]?.id ?? '');
    const [topic, setTopic] = useState('');
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState(60);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!topic.trim()) return;
      store.addTask({ date, subjectId, topic: topic.trim(), time, duration, done: false, isExtra, generated: false, topicId: '' });
      setTopic('');
      setOpen(false);
    };

    if (!open) {
      return (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" /> {label}
        </button>
      );
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-blue-200 p-4 space-y-3 w-full"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{isExtra ? 'Extra Study' : 'Add Task'}</span>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {store.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Topic name"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save Task
        </button>
      </form>
    );
  }
}
