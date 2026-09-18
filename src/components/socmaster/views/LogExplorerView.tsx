import React, { useState } from 'react';
import { FileCode, Search, HelpCircle, Check, Copy, Info } from 'lucide-react';
import { SAMPLE_LOGS, LogSample } from '../../../data/logExplorerData';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

export const LogExplorerView: React.FC = () => {
  const { interpolate } = useSocMasterLab();
  const [selectedLog, setSelectedLog] = useState<LogSample>(SAMPLE_LOGS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedLog.jsonContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#090D17] border border-cyan-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FileCode className="w-4 h-4" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            TELEMETRY ANALYSIS · LOG EXPLORER
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Security Log & EVE JSON Field Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Inspect authentic JSON payloads generated across the SIEM pipeline with interactive field-by-field explanations. Understand what every key, flag, and timestamp represents in a modern security investigation.
        </p>
      </div>

      {/* Log Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLE_LOGS.map(log => {
          const isSelected = selectedLog.id === log.id;
          return (
            <button
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className={`p-4 rounded-2xl border text-left transition space-y-1 ${
                isSelected
                  ? 'bg-[#101726] border-cyan-500 shadow-md'
                  : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
              }`}
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{log.category}</span>
              <h4 className="font-bold text-xs text-white truncate">{log.title}</h4>
              <p className="text-[11px] text-slate-500 font-mono truncate">{log.sourceFile}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Log Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw JSON View */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Raw Telemetry</span>
              <h3 className="font-bold text-sm text-white font-mono">{selectedLog.sourceFile}</h3>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed max-h-[500px] scrollbar-thin">
            {JSON.stringify(selectedLog.jsonContent, null, 2)}
          </pre>
        </div>

        {/* Right: Explain this JSON */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Field Explainer</span>
              <h3 className="font-bold text-base text-white">Explain this JSON Schema</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded font-mono text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30">
              {selectedLog.fieldExplanations.length} Key Fields
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {selectedLog.fieldExplanations.map((f, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <code className="font-mono font-bold text-cyan-400 text-[11px]">{f.field}</code>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                    {f.type}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{f.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
