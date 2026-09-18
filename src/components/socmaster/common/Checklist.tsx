import React from 'react';
import { CheckSquare, Square, CheckCircle2, Copy, Check } from 'lucide-react';
import { ChecklistItem } from '../../../types/socMasterLab';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

interface ChecklistProps {
  items: ChecklistItem[];
  moduleId: string;
}

export const Checklist: React.FC<ChecklistProps> = ({ items, moduleId }) => {
  const { progress, toggleChecklistItem, interpolate } = useSocMasterLab();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const completedCount = items.filter(item => progress.checklistProgress[item.id]).length;
  const isAllDone = completedCount === items.length && items.length > 0;

  const handleCopyCmd = async (id: string, cmd: string) => {
    try {
      await navigator.clipboard.writeText(interpolate(cmd));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-800 bg-[#0B0F17] p-6 shadow-xl space-y-4 font-sans text-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Module Completion Checklist</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verify each requirement on your real Linux host before marking this module complete.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080B12] border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">Verified:</span>
          <span className={`font-bold ${isAllDone ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {completedCount} / {items.length}
          </span>
          {isAllDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1" />}
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const isChecked = !!progress.checklistProgress[item.id];
          return (
            <div
              key={item.id || idx}
              onClick={() => toggleChecklistItem(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isChecked
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : 'bg-[#080B12] border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="shrink-0 text-slate-400 hover:text-emerald-400 transition"
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div className="text-xs">
                  <div className={`font-medium ${isChecked ? 'text-emerald-300 font-semibold' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  {item.description && <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>}
                </div>
              </div>

              {item.verifyCommand && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-[11px]"
                >
                  <code className="px-2 py-1 rounded bg-black/40 text-slate-400 border border-slate-800 truncate max-w-[220px]">
                    {interpolate(item.verifyCommand)}
                  </code>
                  <button
                    onClick={() => handleCopyCmd(item.id, item.verifyCommand!)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy verification command"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
