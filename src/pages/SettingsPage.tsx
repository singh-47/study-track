import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import type { Store } from '@/hooks/useStore';
import type { Settings as SettingsType } from '@/types';

export default function SettingsPage({ store }: { store: Store }) {
  const { settings, setSettings, subjects, toggleSubjectSelection } = store;
  const [form, setForm] = useState<SettingsType>(settings);
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<SettingsType>) => {
    setForm({ ...form, ...patch });
    setSaved(false);
  };

  const handleSave = () => {
    const selectedIds = subjects.filter((s) => s.selected).map((s) => s.id);
    setSettings({ ...form, selectedSubjects: selectedIds });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const moveSubject = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= form.subjectOrder.length) return;
    const order = [...form.subjectOrder];
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    update({ subjectOrder: order });
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Settings</h1>
      <p className="text-slate-500 mb-6">Configure your study plan</p>

      {/* Date settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Study Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Study Start Date</label>
            <input
              type="date"
              value={form.studyStartDate}
              onChange={(e) => update({ studyStartDate: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Exam Date</label>
            <input
              type="date"
              value={form.examDate}
              onChange={(e) => update({ examDate: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Study hours */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Daily Study Hours</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Day Study Hours (from 2:00 PM)</label>
            <input
              type="number"
              min={0}
              max={6}
              value={form.dayStudyHours}
              onChange={(e) => update({ dayStudyHours: Math.min(6, Math.max(0, Number(e.target.value))) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Night Study Hours (from 8:00 PM)</label>
            <input
              type="number"
              min={0}
              max={4}
              value={form.nightStudyHours}
              onChange={(e) => update({ nightStudyHours: Math.min(4, Math.max(0, Number(e.target.value))) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Total: {form.dayStudyHours + form.nightStudyHours} hours per day
        </p>
      </div>

      {/* Subject selection & order */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Subject Selection & Order</h2>
          <span className="text-xs text-slate-400">
            {subjects.filter((s) => s.selected).length} selected
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Toggle subjects on/off for your preparation. Use arrows to set study priority order.
        </p>
        <div className="space-y-2">
          {form.subjectOrder.map((subjectId, index) => {
            const subject = subjects.find((s) => s.id === subjectId);
            if (!subject) return null;
            return (
              <div
                key={subjectId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                  subject.selected ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <button
                  onClick={() => toggleSubjectSelection(subject.id)}
                  className={`relative w-6 h-6 rounded-md border-2 flex-shrink-0 transition-colors flex items-center justify-center ${
                    subject.selected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-300 hover:border-blue-400'
                  }`}
                  aria-label={subject.selected ? 'Deselect' : 'Select'}
                >
                  {subject.selected && <Check className="w-4 h-4 text-white" />}
                </button>
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-700 flex-1">{subject.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveSubject(index, -1)}
                    disabled={index === 0}
                    className="w-7 h-7 rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 flex items-center justify-center text-sm"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSubject(index, 1)}
                    disabled={index === form.subjectOrder.length - 1}
                    className="w-7 h-7 rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 flex items-center justify-center text-sm"
                  >
                    ↓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
          saved
            ? 'bg-green-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Save Settings
          </>
        )}
      </button>
    </div>
  );
}
