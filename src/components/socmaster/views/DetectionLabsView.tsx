import React, { useState } from 'react';
import {
  Flame,
  Shield,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  FileCode,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { DETECTION_LABS_SCENARIOS } from '../../../data/detectionLabsData';
import { CommandBlock } from '../common/CommandBlock';

export const DetectionLabsView: React.FC = () => {
  const { interpolate, openTerminalWithCommand, markModuleCompleted } = useSocMasterLab();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DETECTION_LABS_SCENARIOS[0].id);
  const [activeTab, setActiveTab] = useState<'attack' | 'signature' | 'eve' | 'kql' | 'triage'>('attack');

  const currentScenario = DETECTION_LABS_SCENARIOS.find(s => s.id === selectedScenarioId) || DETECTION_LABS_SCENARIOS[0];

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#0B0D16] border border-red-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-500/30">
              MODULE 08 · DETECTION LABS
            </span>
          </div>

          <span className="px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>AUTHORIZED LAB ENVIRONMENTS ONLY</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Adversary Emulation & Signature Triage Labs
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Execute controlled reconnaissance, credential spraying, and web exploitation from your Kali Linux machine. Inspect how Suricata translates raw packets into eve.json telemetry and write high-precision KQL queries in Kibana.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DETECTION_LABS_SCENARIOS.map(scen => {
          const isSelected = scen.id === currentScenario.id;
          return (
            <button
              key={scen.id}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                isSelected
                  ? 'bg-[#101422] border-red-500/60 shadow-lg shadow-red-950/30 translate-y-[-2px]'
                  : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{scen.category}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    scen.severity === 'CRITICAL'
                      ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                      : scen.severity === 'HIGH'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                      : 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40'
                  }`}
                >
                  {scen.severity}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{scen.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">{scen.objective}</p>
            </button>
          );
        })}
      </div>

      {/* Main Scenario Workspace */}
      <div className="p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">SCENARIO {currentScenario.number}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{interpolate(currentScenario.targetEnvironment)}</span>
            </div>
            <h2 className="font-bold text-xl text-white mt-1">{currentScenario.title}</h2>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs">
            {[
              { id: 'attack', label: '1. Emulate Attack' },
              { id: 'signature', label: '2. Suricata Rule' },
              { id: 'eve', label: '3. eve.json Output' },
              { id: 'kql', label: '4. Kibana KQL' },
              { id: 'triage', label: '5. Triage & Contain' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === t.id
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Attack Emulation Tab */}
        {activeTab === 'attack' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-xl bg-[#0C1019] border border-slate-800 text-xs text-slate-300">
              <strong className="text-slate-200 block mb-1">Adversary Tactic & Objective:</strong>
              {currentScenario.objective}
            </div>

            <div>
              <span className="text-xs font-mono text-red-400 font-bold uppercase">Execute from Kali Terminal:</span>
              <CommandBlock
                command={currentScenario.kaliAttackerCommand}
                description="Controlled attack emulation command"
                whyThisCommand={currentScenario.attackerExplanation}
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300">
              <strong>SOC Analyst Safety Warning: </strong>
              Never execute scan or dictionary scripts against external unauthorized infrastructure. Only run these tests against your dedicated SIEM server IP ({interpolate('<SIEM_IP>')}).
            </div>
          </div>
        )}

        {/* Suricata Signature Tab */}
        {activeTab === 'signature' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Signature Definition</span>
                <div className="font-mono text-sm font-bold text-white">SID: {currentScenario.suricataSignature.sid}</div>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {currentScenario.suricataSignature.rule}
            </pre>

            <div className="p-4 rounded-xl bg-[#0C1019] border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">Rule Logic Breakdown:</span>
              <p className="leading-relaxed">{currentScenario.suricataSignature.explanation}</p>
            </div>
          </div>
        )}

        {/* EVE JSON Output Tab */}
        {activeTab === 'eve' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Raw Append in /var/log/suricata/eve.json</span>
              <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                {interpolate(JSON.stringify(currentScenario.eveJsonSample, null, 2))}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">Key JSON Fields:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {currentScenario.jsonExplanation.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#0C1019] border border-slate-800 space-y-1">
                    <code className="font-mono font-bold text-cyan-400 text-[11px]">{f.field}</code>
                    <p className="text-slate-300">{interpolate(f.meaning)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kibana KQL Query Tab */}
        {activeTab === 'kql' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">Kibana Query Language (KQL) Expression</span>
              <div className="mt-2 p-3.5 rounded-xl bg-[#05070B] border border-purple-500/40 text-purple-300 font-mono text-sm font-bold flex items-center justify-between">
                <code>{interpolate(currentScenario.kqlQuery)}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(interpolate(currentScenario.kqlQuery))}
                  className="px-3 py-1 rounded bg-purple-950 text-purple-300 text-xs font-mono hover:bg-purple-900 transition"
                >
                  Copy KQL
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0C1019] border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white block">How to triage this in Kibana:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Open Kibana at <code className="text-cyan-300">http://{interpolate('<SIEM_IP>')}:5601</code></li>
                <li>Navigate to <strong>Discover</strong> and select the <strong>soc-*</strong> Data View.</li>
                <li>Paste the KQL query into the search bar and adjust the time range to "Last 15 minutes".</li>
                <li>Add columns for <code className="text-slate-200">source.ip</code>, <code className="text-slate-200">destination.port</code>, and <code className="text-slate-200">suricata.alert.signature</code>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Triage & Containment Tab */}
        {activeTab === 'triage' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">SOC Analyst Triage Questions:</h4>
              {currentScenario.investigationQuestions.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0C1019] border border-slate-800 space-y-1.5 text-xs">
                  <div className="font-bold text-white">{q.question}</div>
                  <div className="text-emerald-400 font-mono font-medium">Answer: {interpolate(q.answer)}</div>
                  <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{q.socTip}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-200 space-y-1">
              <span className="font-bold text-red-400 block text-sm">Immediate Containment Recommendation:</span>
              <p className="leading-relaxed">{interpolate(currentScenario.containmentRecommendation)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => markModuleCompleted('detection-labs', true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/50"
        >
          Mark Detection Labs Completed ✓
        </button>
      </div>
    </div>
  );
};
