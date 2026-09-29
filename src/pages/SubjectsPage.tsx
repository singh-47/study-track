import { useState } from 'react';
import { ChevronLeft, Circle, Clock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import type { Store } from '@/hooks/useStore';
import type { Subject, TopicStatus } from '@/types';
import * as Icons from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { subjectProgress } from '@/lib/progress';

const STATUS_STYLES: Record<TopicStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-500', icon: <Circle className="w-3.5 h-3.5" /> },
  'in-progress': { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-600', icon: <Clock className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-600', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const NEXT_STATUS: Record<TopicStatus, TopicStatus> = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
};

export default function SubjectsPage({ store }: { store: Store }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { subjects, toggleSubjectSelection, setTopicStatus } = store;

  const selectedSubject = subjects.find((s) => s.id === selectedId);

  const handleCycleTopic = (subjectId: string, topicId: string, current: TopicStatus) => {
    const newStatus = NEXT_STATUS[current];
    setTopicStatus(subjectId, topicId, newStatus);
  };

  if (selectedSubject) {
    return <SubjectDetail subject={selectedSubject} onBack={() => setSelectedId(null)} onCycleTopic={handleCycleTopic} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Subjects</h1>
      <p className="text-slate-500 mb-6">
        {subjects.filter((s) => s.selected).length} of {subjects.length} subjects selected
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          const pct = subjectProgress(subject);
          const done = subject.topics.filter((t) => t.status === 'completed').length;
          const inProgress = subject.topics.filter((t) => t.status === 'in-progress').length;
          const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon] ?? Icons.BookOpen;

          return (
            <div
              key={subject.id}
              className={`bg-white rounded-xl border p-4 transition-all ${subject.selected ? 'border-slate-200 hover:border-blue-300 hover:shadow-sm' : 'border-slate-100 opacity-60'}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${subject.selected ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  <IconComp className={`w-5 h-5 ${subject.selected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 leading-snug">{subject.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {done}/{subject.topics.length} topics{inProgress > 0 ? ` · ${inProgress} in progress` : ''}
                  </p>
                </div>
                <button
                  onClick={() => toggleSubjectSelection(subject.id)}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${subject.selected ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
                  aria-label={subject.selected ? 'Deselect subject' : 'Select subject'}
                >
                  {subject.selected ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={() => setSelectedId(subject.id)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <ProgressBar value={pct} />
                  <span className="text-xs font-medium text-slate-500 flex-shrink-0">{pct}%</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubjectDetail({
  subject,
  onBack,
  onCycleTopic,
}: {
  subject: Subject;
  onBack: () => void;
  onCycleTopic: (subjectId: string, topicId: string, current: TopicStatus) => void;
}) {
  const pct = subjectProgress(subject);
  const done = subject.topics.filter((t) => t.status === 'completed').length;
  const inProgress = subject.topics.filter((t) => t.status === 'in-progress').length;
  const pending = subject.topics.filter((t) => t.status === 'pending').length;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Subjects
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{subject.name}</h1>
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        <span className="text-green-600">{done} completed</span>
        <span className="text-amber-600">{inProgress} in progress</span>
        <span className="text-slate-400">{pending} pending</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <ProgressBar value={pct} className="flex-1" />
        <span className="text-sm font-semibold text-slate-700">{pct}%</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {subject.topics.map((topic) => {
          const style = STATUS_STYLES[topic.status];
          return (
            <div key={topic.id} className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => onCycleTopic(subject.id, topic.id, topic.status)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} transition-colors hover:opacity-80`}
              >
                {style.icon}
                {style.label}
              </button>
              <span className="text-sm text-slate-700 flex-1">{topic.name}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {topic.estimatedHours}h
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
