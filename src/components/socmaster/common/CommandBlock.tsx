import React, { useState } from 'react';
import { Copy, Check, Terminal, HelpCircle, AlertTriangle, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

interface CommandBlockProps {
  command: string;
  description?: string;
  whyThisCommand?: string;
  expectedOutput?: string;
  whatOutputMeans?: string;
  commonMistake?: string;
  troubleshooting?: string;
  requiresSudo?: boolean;
}

export const CommandBlock: React.FC<CommandBlockProps> = ({
  command,
  description,
  whyThisCommand,
  expectedOutput,
  whatOutputMeans,
  commonMistake,
  troubleshooting,
  requiresSudo,
}) => {
  const { interpolate, openTerminalWithCommand } = useSocMasterLab();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const finalCommand = interpolate(command);
  const finalExpectedOutput = expectedOutput ? interpolate(expectedOutput) : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSimulate = () => {
    openTerminalWithCommand(finalCommand);
  };

  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-[#0B0F17] overflow-hidden shadow-lg transition-all hover:border-slate-700">
      {/* Header bar */}
      {description && (
        <div className="px-4 py-2.5 bg-[#0e1422] border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{description}</span>
          </div>
          {requiresSudo && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
              SUDO
            </span>
          )}
        </div>
      )}

      {/* Command prompt row */}
      <div className="p-3.5 flex items-center justify-between gap-3 bg-[#080B11] font-mono text-sm">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-thin text-emerald-400 select-all flex-1 py-1">
          <span className="text-slate-600 select-none">$</span>
          <code className="text-emerald-300 font-semibold">{finalCommand}</code>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSimulate}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold transition"
            title="Execute in simulated terminal"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              copied
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Why this command? & Explanations */}
      {whyThisCommand && (
        <div className="px-4 py-2.5 bg-[#0C121D] border-t border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300">Why this command? </span>
            <span>{whyThisCommand}</span>
          </div>
        </div>
      )}

      {/* Expected output toggle */}
      {(finalExpectedOutput || whatOutputMeans || commonMistake) && (
        <div className="border-t border-slate-800/80">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-2 bg-[#090D15] hover:bg-[#0c121e] flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Expected Output & Analysis</span>
            </span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="p-4 bg-[#06080E] space-y-3 text-xs">
              {finalExpectedOutput && (
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1 font-bold uppercase tracking-wider">
                    Expected Terminal Output:
                  </div>
                  <pre className="p-3 bg-[#0B0F17] rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {finalExpectedOutput}
                  </pre>
                </div>
              )}

              {whatOutputMeans && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                  <span className="font-bold">What this output means: </span>
                  {whatOutputMeans}
                </div>
              )}

              {commonMistake && (
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Common Mistake: </span>
                    <span>{commonMistake}</span>
                  </div>
                </div>
              )}

              {troubleshooting && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="font-bold text-slate-200">Troubleshooting tip: </span>
                  {troubleshooting}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
