import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import type { Task, Subject } from '@/types';

interface TaskRowProps {
  task: Task;
  subjects: Subject[];
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function TaskRow({ task, subjects, onToggle, onDelete, showDelete = false }: TaskRowProps) {
  const subject = subjects.find((s) => s.id === task.subjectId);
  const subjectName = subject?.name ?? 'Unknown';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        task.done
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0"
        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.done ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-slate-300 hover:text-blue-400" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              task.done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {subjectName}
          </span>
          {task.isExtra && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Extra
            </span>
          )}
        </div>
        <p className={`text-sm mt-1 ${task.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {task.topic}
        </p>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span>{task.time}</span>
        <span className="mx-1">·</span>
        <span>{task.duration}m</span>
      </div>

      {showDelete && onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
