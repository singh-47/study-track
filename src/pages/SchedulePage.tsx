import { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import type { Store } from '@/hooks/useStore';
import { todayStr, nextNDays, formatDate } from '@/lib/dates';
import TaskRow from '@/components/TaskRow';
import ProgressBar from '@/components/ProgressBar';

export default function SchedulePage({ store }: { store: Store }) {
  const { subjects, tasks, toggleTask, deleteTask, addTask } = store;
  const today = todayStr();
  const days = nextNDays(today, 8);
  const [addingDate, setAddingDate] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Schedule</h1>
      <p className="text-slate-500 mb-6">Today + next 7 days</p>

      <div className="space-y-6">
        {days.map((date) => {
          const dayTasks = tasks
            .filter((t) => t.date === date)
            .sort((a, b) => a.time.localeCompare(b.time));
          const done = dayTasks.filter((t) => t.done).length;
          const pct = dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0;
          const isToday = date === today;

          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <h2 className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {formatDate(date)}{isToday && ' · Today'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{done}/{dayTasks.length}</span>
                  <div className="w-16">
                    <ProgressBar value={pct} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {dayTasks.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 text-center text-sm text-slate-400">
                    No tasks scheduled
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      subjects={subjects}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      showDelete
                    />
                  ))
                )}
              </div>

              {addingDate === date ? (
                <AddTaskInline
                  store={store}
                  date={date}
                  onClose={() => setAddingDate(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingDate(date)}
                  className="flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddTaskInline({
  store,
  date,
  onClose,
}: {
  store: Store;
  date: string;
  onClose: () => void;
}) {
  const [subjectId, setSubjectId] = useState(store.subjects[0]?.id ?? '');
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    store.addTask({ date, subjectId, topic: topic.trim(), time, duration, done: false, isExtra: false, generated: false, topicId: '' });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-200 p-4 space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">New Task</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
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
