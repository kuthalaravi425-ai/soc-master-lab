import React, { useState } from 'react';
import { FileText, Copy, Check, Terminal, ExternalLink, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { CONFIG_FILE_LIBRARY } from '../../../data/configFilesData';
import { ConfigFileDef } from '../../../types/socMasterLab';
import { CommandBlock } from '../common/CommandBlock';

export const ConfigLibraryView: React.FC = () => {
  const { interpolate, setIsNanoModalOpen, openTerminalWithCommand } = useSocMasterLab();
  const [selectedConfig, setSelectedConfig] = useState<ConfigFileDef>(CONFIG_FILE_LIBRARY[0]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(interpolate(selectedConfig.safeSnippet));
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#090D17] border border-purple-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
              DAEMON CONFIGURATION LIBRARY
            </span>
          </div>

          <button
            onClick={() => setIsNanoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-600/30 transition"
          >
            <span>Open Nano Cheatsheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Validated Configuration File Blueprints
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Production-safe configuration examples with zero secrets or hardcoded passwords. Each configuration has been verified for syntax, network interface binding, and logging accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Config Files List */}
        <div className="lg:col-span-4 space-y-2">
          {CONFIG_FILE_LIBRARY.map(cfg => {
            const isSelected = selectedConfig.path === cfg.path;
            return (
              <button
                key={cfg.path}
                onClick={() => setSelectedConfig(cfg)}
                className={`w-full p-4 rounded-2xl border text-left transition space-y-1 ${
                  isSelected
                    ? 'bg-[#101726] border-purple-500 shadow-md'
                    : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{cfg.component}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
                </div>
                <div className="font-bold text-xs text-white font-mono truncate">{cfg.path}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{cfg.purpose}</div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Config Inspector */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{selectedConfig.component}</span>
              <h2 className="font-bold text-lg text-white font-mono">{selectedConfig.path}</h2>
            </div>

            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-950/40"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copied Blueprint!' : 'Copy Safe Configuration'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-300">
            <span className="text-slate-500 font-bold uppercase font-mono text-[10px] block mb-1">What it Controls:</span>
            <p className="leading-relaxed">{selectedConfig.whatItControls}</p>
          </div>

          {/* Edit Command */}
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Open in Nano:</span>
            <CommandBlock
              command={selectedConfig.nanoCommand}
              description="Open this file on your Linux host"
              requiresSudo={true}
            />
          </div>

          {/* Safe Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Safe Configuration Template:</span>
              <span className="text-[11px] font-mono text-slate-500">Dynamic placeholders active</span>
            </div>
            <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
              {interpolate(selectedConfig.safeSnippet)}
            </pre>
          </div>

          {/* Parameter Explanations */}
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold uppercase block mb-2">Key Parameter Reference:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedConfig.parameters.map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                  <code className="font-mono text-cyan-300 text-[11px] font-bold block">{p.key}</code>
                  <p className="text-slate-300">{p.purpose}</p>
                  <span className="text-[10px] font-mono text-emerald-400 block">Default: {interpolate(p.safeDefault)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
