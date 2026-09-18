import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  ArrowRight,
  Shield,
  HelpCircle,
  Play,
  Cpu,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import {
  TROUBLESHOOTING_PHILOSOPHY_STEPS,
  DIAGNOSTIC_WORKFLOW,
  SEARCHABLE_TROUBLESHOOTING_SCENARIOS,
} from '../../../data/troubleshootingData';
import { CommandBlock } from '../common/CommandBlock';

export const TroubleshootingCenterView: React.FC = () => {
  const { interpolate, openTerminalWithCommand, markModuleCompleted } = useSocMasterLab();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SEARCHABLE_TROUBLESHOOTING_SCENARIOS[0].id);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'philosophy' | 'workflow'>('scenarios');

  const filteredScenarios = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCHABLE_TROUBLESHOOTING_SCENARIOS;
    return SEARCHABLE_TROUBLESHOOTING_SCENARIOS.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.component.toLowerCase().includes(q) ||
        s.symptom.toLowerCase().includes(q) ||
        s.rootCause.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentScenario =
    filteredScenarios.find(s => s.id === selectedScenarioId) ||
    filteredScenarios[0] ||
    SEARCHABLE_TROUBLESHOOTING_SCENARIOS[0];

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#090D17] border border-cyan-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              MODULE 09 · TROUBLESHOOTING CENTER
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">12 Searchable Incident Runbooks</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          🔧 Enterprise SOC Troubleshooting Center
        </h1>
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 font-medium">
          <strong>Core Diagnostic Principle: </strong>"Don't randomly reinstall the software. Follow the evidence."
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 pt-2 text-xs">
          {[
            { id: 'scenarios', label: '1. Searchable Problem Library' },
            { id: 'workflow', label: '2. 7-Stage Diagnostic Workflow' },
            { id: 'philosophy', label: '3. 10-Step Philosophy' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === t.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: SEARCHABLE PROBLEM SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Left Column: Problem Search & List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search error (e.g. 5044, connection refused, watermark)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080B12] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredScenarios.map(scen => {
                const isSelected = scen.id === currentScenario.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition space-y-1.5 ${
                      isSelected
                        ? 'bg-[#101726] border-cyan-500 shadow-md'
                        : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">{scen.component}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                    </div>
                    <div className="font-bold text-xs text-white line-clamp-1">{scen.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{scen.symptom}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep-Dive Resolution Workbench */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-400 border border-slate-700/60">
                  {currentScenario.component}
                </span>
                <span className="text-xs text-slate-500 font-mono">Triage Runbook</span>
              </div>
              <h2 className="font-bold text-lg text-white mt-1">{currentScenario.title}</h2>
            </div>

            {/* Symptom & Root Cause */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 font-mono">
                <strong>Symptom: </strong>{currentScenario.symptom}
              </div>

              <div className="p-3.5 rounded-xl bg-[#0C1019] border border-slate-800 text-slate-300 space-y-1">
                <strong className="text-white block font-sans">Root Cause Analysis:</strong>
                <p className="leading-relaxed">{currentScenario.rootCause}</p>
              </div>
            </div>

            {/* Diagnostic Command */}
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Evidence Identification Command:</span>
              <CommandBlock
                command={currentScenario.detectionCommand}
                description="Run to identify the exact fault"
                expectedOutput={currentScenario.expectedErrorSnippet}
                whatOutputMeans="Exposes the underlying error reason in system logs."
              />
            </div>

            {/* Step-by-Step Resolution */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Step-by-Step Resolution:</span>
              <div className="space-y-2 text-xs">
                {currentScenario.stepByStepResolution.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0C1019] border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 font-mono leading-relaxed">{interpolate(step)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Command */}
            <div>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">Verification & Health Confirmation:</span>
              <CommandBlock
                command={currentScenario.verifyFixCommand}
                description="Validate that the fix restored service health"
                expectedOutput={currentScenario.expectedFixOutput}
                whatOutputMeans="Confirms service has returned to green operational status."
              />
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
              <strong>Future Prevention Tip: </strong>{currentScenario.preventionTip}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 7-STAGE DIAGNOSTIC WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-bold text-lg text-white">The 7-Stage SOC Diagnostic Workflow</h3>
            <p className="text-xs text-slate-400">Always step through these 7 verification questions sequentially whenever a tool breaks.</p>
          </div>

          <div className="space-y-3">
            {DIAGNOSTIC_WORKFLOW.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">{item.stage}</div>
                    <div className="text-slate-400">{item.question}</div>
                  </div>
                </div>

                <div className="font-mono text-cyan-300 bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  <code>{item.command}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: 10-STEP PHILOSOPHY */}
      {activeTab === 'philosophy' && (
        <div className="p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-bold text-lg text-white">The 10-Step Troubleshooting Philosophy</h3>
            <p className="text-xs text-slate-400">Adopt the mindset of a senior security engineer and systems administrator.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {TROUBLESHOOTING_PHILOSOPHY_STEPS.map(p => (
              <div key={p.step} className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[10px] font-mono font-bold">
                    {p.step}
                  </span>
                  <h4 className="font-bold text-white text-xs">{p.title}</h4>
                </div>
                <p className="text-slate-400 leading-relaxed pl-7">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => markModuleCompleted('troubleshooting', true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50"
        >
          Mark Troubleshooting Center Completed ✓
        </button>
      </div>
    </div>
  );
};
