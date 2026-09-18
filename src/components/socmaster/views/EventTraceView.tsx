import React, { useState } from 'react';
import { Layers, ArrowDown, Terminal, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { END_TO_END_EVENT_TRACE, EventTraceStep } from '../../../data/eventTraceData';

export const EventTraceView: React.FC = () => {
  const { interpolate, openTerminalWithCommand } = useSocMasterLab();
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  const currentStep = END_TO_END_EVENT_TRACE[selectedStepIdx];

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#090D17] border border-cyan-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            DEEP DIVE · END-TO-END DATA FLOW
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Trace One Event Through the Entire Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          From a single raw Ethernet frame generated on Kali Linux, down through Suricata's kernel packet queue, onto eve.json disk buffers, through Filebeat Lumberjack streams, Logstash Grok pipelines, and into Elasticsearch Lucene indices before rendering on a Kibana analyst screen.
        </p>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {END_TO_END_EVENT_TRACE.map((step, idx) => {
          const isSelected = idx === selectedStepIdx;
          return (
            <button
              key={step.stepNumber}
              onClick={() => setSelectedStepIdx(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-[#101726] border-cyan-500 shadow-lg shadow-cyan-950/40 translate-y-[-2px]'
                  : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">0{step.stepNumber}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
              </div>
              <div className="font-bold text-xs text-white truncate">{step.component.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-500 truncate">{step.stageName.split(' ')[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Card */}
      <div className="p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              STAGE 0{currentStep.stepNumber} · {currentStep.component}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">{currentStep.stageName}</h2>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700/60">
            Port/Protocol: <span className="text-emerald-400 font-bold">{interpolate(currentStep.portOrProto)}</span>
          </div>
        </div>

        {/* Input vs Output Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase font-mono text-[10px]">Data Ingest / Input:</span>
            <p className="text-slate-200 leading-relaxed font-mono text-[11px]">{interpolate(currentStep.input)}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase font-mono text-[10px]">Transformed Output:</span>
            <p className="text-emerald-300 leading-relaxed font-mono text-[11px]">{interpolate(currentStep.output)}</p>
          </div>
        </div>

        {/* Technical Attributes Table */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
            <span className="text-slate-500 block text-[10px]">File Handle / Socket:</span>
            <span className="text-amber-400 font-semibold truncate block mt-0.5">{currentStep.fileOrSocket}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
            <span className="text-slate-500 block text-[10px]">OS Process / Thread:</span>
            <span className="text-cyan-400 font-semibold truncate block mt-0.5">{currentStep.processName}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Verification Command:</span>
            <span className="text-emerald-400 font-semibold truncate block mt-0.5">{interpolate(currentStep.verificationMethod)}</span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800/90 text-xs text-slate-300 space-y-2">
          <span className="font-bold text-white block text-sm">Under the Hood:</span>
          <p className="leading-relaxed">{interpolate(currentStep.explanation)}</p>
        </div>

        {/* Code Snippet & Simulator Trigger */}
        {currentStep.codeSnippet && (
          <div className="p-4 rounded-2xl bg-[#05070B] border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
            <code className="text-emerald-300 truncate">{interpolate(currentStep.codeSnippet)}</code>
            <button
              onClick={() => openTerminalWithCommand(interpolate(currentStep.codeSnippet!))}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-semibold text-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
