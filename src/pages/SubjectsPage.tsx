import { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Store } from '@/hooks/useStore';
import type { Priority, Subject, TopicStatus } from '@/types';
import * as Icons from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { subjectProgress } from '@/lib/progress';
import * as syllabus from '@/lib/syllabus';

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

const STATUS_STYLES: Record<TopicStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  'not-started': { label: 'Not Started', bg: 'bg-slate-100', text: 'text-slate-500', icon: <Circle className="w-3.5 h-3.5" /> },
  'in-progress': { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-600', icon: <Clock className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-600', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const NEXT_STATUS: Record<TopicStatus, TopicStatus> = {
  'not-started': 'in-progress',
  'in-progress': 'completed',
  completed: 'not-started',
};

export default function SubjectsPage({ store }: { store: Store }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { subjects, setSubjects, toggleSubjectSelection, setTopicStatus } = store;

  const selectedSubject = subjects.find((s) => s.id === selectedId);

  const handleCycleTopic = (subjectId: string, topicId: string, current: TopicStatus) => {
    const newStatus = NEXT_STATUS[current];
    setTopicStatus(subjectId, topicId, newStatus);
  };

  if (selectedSubject) {
    return (
      <SubjectDetail
        subject={selectedSubject}
        subjects={subjects}
        onChange={setSubjects}
        onBack={() => setSelectedId(null)}
        onCycleTopic={handleCycleTopic}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Subjects</h1>
      <p className="text-slate-500 mb-6">
        {subjects.filter((s) => s.enabled).length} of {subjects.length} subjects selected
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {syllabus.sortByOrder(subjects).map((subject) => {
          const pct = subjectProgress(subject);
          const done = subject.topics.filter((t) => t.status === 'completed').length;
          const inProgress = subject.topics.filter((t) => t.status === 'in-progress').length;
          const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[subject.icon] ?? Icons.BookOpen;

          return (
            <div
              key={subject.id}
              className={`bg-white rounded-xl border p-4 transition-all ${subject.enabled ? 'border-slate-200 hover:border-blue-300 hover:shadow-sm' : 'border-slate-100 opacity-60'}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${subject.enabled ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  <IconComp className={`w-5 h-5 ${subject.enabled ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 leading-snug">{subject.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {done}/{subject.topics.length} topics{inProgress > 0 ? ` · ${inProgress} in progress` : ''}
                  </p>
                </div>
                <button
                  onClick={() => toggleSubjectSelection(subject.id)}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${subject.enabled ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
                  aria-label={subject.enabled ? 'Deselect subject' : 'Select subject'}
                >
                  {subject.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
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

      <AddRow
        placeholder="New subject name"
        onAdd={(name) => setSubjects(syllabus.addSubject(subjects, name))}
        className="mt-4"
      />
    </div>
  );
}

function SubjectDetail({
  subject,
  subjects,
  onChange,
  onBack,
  onCycleTopic,
}: {
  subject: Subject;
  subjects: Subject[];
  onChange: (s: Subject[]) => void;
  onBack: () => void;
  onCycleTopic: (subjectId: string, topicId: string, current: TopicStatus) => void;
}) {
  const pct = subjectProgress(subject);
  const done = subject.topics.filter((t) => t.status === 'completed').length;
  const inProgress = subject.topics.filter((t) => t.status === 'in-progress').length;
  const notStarted = subject.topics.filter((t) => t.status === 'not-started').length;
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);

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
        <span className="text-slate-400">{notStarted} not started</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <ProgressBar value={pct} className="flex-1" />
        <span className="text-sm font-semibold text-slate-700">{pct}%</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {subject.topics.map((topic, i) => {
          const style = STATUS_STYLES[topic.status];
          const open = openTopicId === topic.id;
          const iconBtn = 'p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent';
          return (
            <div key={topic.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onCycleTopic(subject.id, topic.id, topic.status)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} transition-colors hover:opacity-80`}
                >
                  {style.icon}
                  {style.label}
                </button>
                <button
                  onClick={() => setOpenTopicId(open ? null : topic.id)}
                  className={iconBtn}
                  aria-label={open ? 'Hide subtopics' : 'Show subtopics'}
                >
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <InlineEdit
                  value={topic.name}
                  onSave={(name) => onChange(syllabus.updateTopic(subjects, subject.id, topic.id, { name }))}
                  className="text-sm text-slate-700 flex-1 min-w-[10rem]"
                />
                {topic.subtopics.length > 0 && (
                  <span className="text-xs text-slate-400">{topic.subtopics.length} subtopics</span>
                )}
                <select
                  value={topic.priority}
                  onChange={(e) =>
                    onChange(
                      syllabus.updateTopic(subjects, subject.id, topic.id, { priority: e.target.value as Priority })
                    )
                  }
                  className="text-xs border border-slate-200 rounded-md px-1.5 py-1 text-slate-600 bg-white"
                  aria-label="Priority"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input
                    key={topic.estimatedHours}
                    type="number"
                    min={0.5}
                    step={0.5}
                    defaultValue={topic.estimatedHours}
                    onBlur={(e) => {
                      const hours = Number(e.target.value);
                      if (hours > 0 && hours !== topic.estimatedHours) {
                        onChange(syllabus.updateTopic(subjects, subject.id, topic.id, { estimatedHours: hours }));
                      } else {
                        e.target.value = String(topic.estimatedHours);
                      }
                    }}
                    className="w-14 border border-slate-200 rounded-md px-1.5 py-1 text-slate-600"
                    aria-label="Estimated hours"
                  />
                  h
                </label>
                <button
                  onClick={() => onChange(syllabus.moveTopic(subjects, subject.id, topic.id, -1))}
                  disabled={i === 0}
                  className={iconBtn}
                  aria-label="Move topic up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onChange(syllabus.moveTopic(subjects, subject.id, topic.id, 1))}
                  disabled={i === subject.topics.length - 1}
                  className={iconBtn}
                  aria-label="Move topic down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete topic "${topic.name}"?`)) {
                      onChange(syllabus.deleteTopic(subjects, subject.id, topic.id));
                    }
                  }}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                  aria-label="Delete topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {open && (
                <div className="mt-2 ml-10 space-y-1">
                  {topic.subtopics.map((st) => (
                    <div key={st.id} className="flex items-center gap-2">
                      <Circle className="w-1.5 h-1.5 text-slate-300 fill-current flex-shrink-0" />
                      <InlineEdit
                        value={st.name}
                        onSave={(name) =>
                          onChange(syllabus.updateSubtopic(subjects, subject.id, topic.id, st.id, name))
                        }
                        className="text-sm text-slate-600 flex-1"
                      />
                      <button
                        onClick={() => onChange(syllabus.deleteSubtopic(subjects, subject.id, topic.id, st.id))}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        aria-label="Delete subtopic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <AddRow
                    placeholder="New subtopic"
                    onAdd={(name) => onChange(syllabus.addSubtopic(subjects, subject.id, topic.id, name))}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddRow
        placeholder="New topic name"
        onAdd={(name) => onChange(syllabus.addTopic(subjects, subject.id, name))}
        className="mt-4"
      />
    </div>
  );
}

function InlineEdit({
  value,
  onSave,
  className = '',
}: {
  value: string;
  onSave: (value: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    const commit = (text: string) => {
      const name = text.trim();
      if (name && name !== value) onSave(name);
      setEditing(false);
    };
    return (
      <input
        autoFocus
        defaultValue={value}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(e.currentTarget.value);
          if (e.key === 'Escape') setEditing(false);
        }}
        className={`${className} border border-blue-300 rounded-md px-2 py-0.5 outline-none`}
      />
    );
  }

  return (
    <span className={`${className} group flex items-center gap-1`}>
      <span>{value}</span>
      <button
        onClick={() => setEditing(true)}
        className="p-0.5 rounded text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Edit name"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

function AddRow({
  placeholder,
  onAdd,
  className = '',
}: {
  placeholder: string;
  onAdd: (name: string) => void;
  className?: string;
}) {
  const [text, setText] = useState('');
  const submit = () => {
    const name = text.trim();
    if (!name) return;
    onAdd(name);
    setText('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={`flex items-center gap-2 ${className}`}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-blue-300"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
      >
        <Plus className="w-4 h-4" /> Add
      </button>
    </form>
  );
}
