import React from 'react';
import { X, FileText, Keyboard, AlertCircle } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

export const NanoGuideModal: React.FC = () => {
  const { isNanoModalOpen, setIsNanoModalOpen } = useSocMasterLab();

  if (!isNanoModalOpen) return null;

  const SHORTCUTS = [
    { key: 'CTRL + O', action: 'Write Out (Save file to disk)', note: 'Press Enter immediately afterward to confirm the filename.' },
    { key: 'ENTER', action: 'Confirm Filename', note: 'Confirms the destination file path shown at the bottom prompt.' },
    { key: 'CTRL + X', action: 'Exit Nano', note: 'If unsaved modifications exist, prompts [Y]es or [N]o before exiting.' },
    { key: 'CTRL + W', action: 'Where Is (Search text)', note: 'Opens search bar. Type string and press Enter to jump to matches.' },
    { key: 'CTRL + K', action: 'Cut Current Line', note: 'Removes the line under cursor and stores it in Nano\'s cut buffer.' },
    { key: 'CTRL + U', action: 'Uncut (Paste Line)', note: 'Pastes previously cut lines back into the document at cursor.' },
    { key: 'ALT + 6 (or M-6)', action: 'Copy Selected Text', note: 'Copies the highlighted block to the clipboard buffer.' },
    { key: 'CTRL + C', action: 'Show Current Cursor Position', note: 'Displays line number and character column on bottom bar.' },
    { key: 'CTRL + _ (or Alt+G)', action: 'Go to Line Number', note: 'Prompts for line number to jump directly to errors.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0C1019] border border-slate-700 shadow-2xl overflow-hidden font-sans text-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F1626] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">GNU Nano Quick Reference Guide</h3>
              <p className="text-xs text-slate-400">Essential shortcuts for editing Linux SIEM configuration files</p>
            </div>
          </div>
          <button
            onClick={() => setIsNanoModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Crucial YAML Rule: </span>
              In YAML configuration files (Elasticsearch, Filebeat, Suricata), <strong>NEVER press TAB</strong>. Nano by default inserts real tab characters which immediately break YAML parsers. Always press the Spacebar twice for indentation!
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#080B12] overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0E1422] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Shortcut</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Notes & Tips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {SHORTCUTS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-4 font-bold text-cyan-400 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80">
                        {item.key}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-white">
                      {item.action}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400">
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <span>Terminal Compatibility Notice:</span>
            </div>
            <p>
              Keyboard shortcuts can vary slightly depending on your terminal emulator (e.g. Windows Terminal, PuTTY, macOS Terminal, VS Code). If <code className="text-cyan-300">Alt+6</code> is captured by your OS window manager, use the right mouse button to copy and paste text.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0E1422] border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsNanoModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-950/40"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
