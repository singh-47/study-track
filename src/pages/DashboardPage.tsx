import { Clock, Target, BookCheck, CalendarClock, TrendingUp } from 'lucide-react';
import type { Store } from '@/hooks/useStore';
import { todayStr, daysBetween } from '@/lib/dates';
import ProgressBar from '@/components/ProgressBar';
import {
  overallProgress,
  subjectProgress,
  completedTopics,
  totalTopics,
  totalStudyMinutes,
} from '@/lib/progress';

export default function DashboardPage({ store }: { store: Store }) {
  const { subjects, tasks, settings } = store;
  const today = todayStr();
  const daysLeft = daysBetween(today, settings.examDate);
  const selectedSubjects = subjects.filter((s) => s.selected);
  const overall = overallProgress(selectedSubjects);
  const completed = completedTopics(selectedSubjects);
  const total = totalTopics(selectedSubjects);
  const studyMinutes = totalStudyMinutes(tasks);
  const studyHours = Math.floor(studyMinutes / 60);
  const studyMins = studyMinutes % 60;

  const stats = [
    { label: 'Overall Progress', value: `${overall}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Topics Completed', value: `${completed}/${total}`, icon: BookCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Study Hours', value: `${studyHours}h ${studyMins}m`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Days Remaining', value: `${daysLeft}`, icon: CalendarClock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">Your study overview at a glance</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-700">Overall Progress</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${(overall / 100) * 213.6} 213.6`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800">
              {overall}%
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">
              You've completed <span className="font-semibold text-slate-800">{completed}</span> out of{' '}
              <span className="font-semibold text-slate-800">{total}</span> topics across all subjects.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {daysLeft} days until the GATE 2027 exam
            </p>
          </div>
        </div>
      </div>

      {/* Subject-wise progress */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Subject-wise Progress</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          {selectedSubjects.map((subject) => {
            const pct = subjectProgress(subject);
            const done = subject.topics.filter((t) => t.status === 'completed').length;
            return (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{subject.name}</span>
                  <span className="text-xs text-slate-400">
                    {done}/{subject.topics.length} · {pct}%
                  </span>
                </div>
                <ProgressBar value={pct} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
