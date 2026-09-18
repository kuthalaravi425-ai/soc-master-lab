import React, { useState } from 'react';
import {
  Target,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Terminal,
  Play,
  ArrowRight,
  ArrowLeft,
  Download,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { CAPSTONE_STAGES, CAPSTONE_INCIDENT_SUMMARY } from '../../../data/capstoneChallengeData';
import { CommandBlock } from '../common/CommandBlock';

export const FinalCapstoneView: React.FC = () => {
  const {
    progress,
    setCapstoneStage,
    setCapstoneCompleted,
    interpolate,
    openTerminalWithCommand,
  } = useSocMasterLab();

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [stageStatus, setStageStatus] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [copiedReport, setCopiedReport] = useState(false);

  const currentStage = CAPSTONE_STAGES[activeStageIdx];
  const isLastStage = activeStageIdx === CAPSTONE_STAGES.length - 1;
  const isCurrentStageDone = stageStatus[currentStage.stageNumber] === 'correct';

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (userInputs[currentStage.stageNumber] || '').trim().toLowerCase();
    if (!input) return;

    const accepted = [
      currentStage.acceptedAnswer,
      ...(currentStage.acceptedAlternatives || []),
    ].map(a => interpolate(a).trim().toLowerCase());

    const isMatch = accepted.some(a => input === a || input.includes(a));

    if (isMatch) {
      setStageStatus(prev => ({ ...prev, [currentStage.stageNumber]: 'correct' }));
      setCapstoneStage(currentStage.stageNumber + 1);
      if (isLastStage) {
        setCapstoneCompleted(true);
      }
    } else {
      setStageStatus(prev => ({ ...prev, [currentStage.stageNumber]: 'incorrect' }));
    }
  };

  const completedCount = Object.values(stageStatus).filter(s => s === 'correct').length;

  const generateReportText = () => {
    return `======================================================================
SOC INCIDENT TRIAGE REPORT — ${CAPSTONE_INCIDENT_SUMMARY.incidentId}
======================================================================
Incident Title : ${CAPSTONE_INCIDENT_SUMMARY.title}
Severity       : ${CAPSTONE_INCIDENT_SUMMARY.severity} | TLP: ${CAPSTONE_INCIDENT_SUMMARY.tlp}
Impacted Host  : ${interpolate(CAPSTONE_INCIDENT_SUMMARY.impactedHost)}
Threat Actor   : ${interpolate(CAPSTONE_INCIDENT_SUMMARY.threatActor)}
Date / Time    : ${new Date().toISOString()}

EXECUTIVE SUMMARY:
${interpolate(CAPSTONE_INCIDENT_SUMMARY.brief)}

INVESTIGATION EVIDENCE & CORRELATION:
• Inbound Probe Protocol: TCP SYN Stealth Scan
• Detection Engine      : Suricata IDS via Kernel AF_PACKET
• Triggered Signature   : ET SCAN Potential Nmap SYN Scan to Critical Ports (SID: 2009582)
• Telemetry Pipeline    : eve.json -> Filebeat -> Logstash (5044) -> Elasticsearch (9200)
• Destination Ports     : 22 (SSH), 5044, 5601, 9200
• Post-Exploit Auth Log : SSH connection closed [preauth] (Zero credential breach)

CONTAINMENT ACTION TAKEN:
• Attacking IP blocked on SIEM Host Firewall via:
  "sudo ufw insert 1 deny from ${interpolate('<KALI_IP>')}"
• Host baseline verified. All 5 SIEM services operating in healthy state.

STATUS: RESOLVED & CONTAINED
Analyst: SOC Master Lab Certified Investigator
======================================================================`;
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (e) {
      console.error('Failed to copy report', e);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Capstone Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#140C20] via-[#0D0B18] to-[#0A0C16] border border-purple-500/40 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
              MODULE 10 · CAPSTONE INCIDENT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
              Progress: {completedCount} / {CAPSTONE_STAGES.length} Stages
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          🚨 SOC Master Capstone Challenge
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          A multi-stage incident triage scenario. Follow the live evidence, corroborate Suricata alerts, verify Filebeat harvesting, formulate Kibana queries, identify threat vectors, and generate an official SOC Incident Summary.
        </p>

        {/* Stage Timeline Stepper */}
        <div className="pt-2 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-[700px]">
            {CAPSTONE_STAGES.map((s, idx) => {
              const isDone = stageStatus[s.stageNumber] === 'correct';
              const isActive = idx === activeStageIdx;
              return (
                <button
                  key={s.stageNumber}
                  onClick={() => setActiveStageIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950/50'
                      : isDone
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#0A0E18] text-slate-500 border border-slate-800'
                  }`}
                >
                  <span>{s.stageNumber}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Stage Workbench */}
      <div className="p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider">
              STAGE {currentStage.stageNumber} OF {CAPSTONE_STAGES.length}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">{currentStage.title}</h2>
          </div>

          {isCurrentStageDone && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>STAGE VALIDATED</span>
            </span>
          )}
        </div>

        {/* Objective & Task */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase font-mono text-[10px]">Stage Objective:</span>
            <p className="text-slate-200 leading-relaxed">{interpolate(currentStage.objective)}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase font-mono text-[10px]">Analyst Investigation Task:</span>
            <p className="text-slate-200 leading-relaxed">{interpolate(currentStage.analystTask)}</p>
          </div>
        </div>

        {/* Command to Run */}
        {currentStage.commandToRun && (
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Evidence Command:</span>
            <CommandBlock
              command={currentStage.commandToRun}
              description="Execute to observe or discover stage evidence"
              expectedOutput={currentStage.simulatedResult}
              whatOutputMeans="Displays raw data matching the current stage investigation."
            />
          </div>
        )}

        {/* Challenge Question & Input */}
        <div className="p-5 rounded-2xl bg-[#0B0F17] border border-purple-500/30 space-y-4">
          <div className="text-sm font-semibold text-white flex items-start gap-2">
            <Target className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <span>{interpolate(currentStage.challengeQuestion)}</span>
          </div>

          <form onSubmit={handleSubmitAnswer} className="flex items-center gap-2">
            <input
              type="text"
              value={userInputs[currentStage.stageNumber] || ''}
              onChange={e => setUserInputs({ ...userInputs, [currentStage.stageNumber]: e.target.value })}
              placeholder="Enter your investigation finding or answer..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#070A10] border border-slate-700 text-xs font-mono text-white outline-none focus:border-purple-500 transition"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-950/50 cursor-pointer"
            >
              Verify Finding
            </button>
          </form>

          {/* Validation Feedback */}
          {stageStatus[currentStage.stageNumber] && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                isCurrentStageDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {isCurrentStageDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Correct Analysis! Stage requirement satisfied.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Not quite matching the expected finding. Check the evidence snippet.</span>
                  </>
                )}
              </div>
              <div className="text-slate-300 text-[11px] pt-1">
                <strong>SOC Insight: </strong>{interpolate(currentStage.socInsight)}
              </div>
            </div>
          )}

          {/* Hint Toggle */}
          <div>
            {!showHint[currentStage.stageNumber] ? (
              <button
                type="button"
                onClick={() => setShowHint(prev => ({ ...prev, [currentStage.stageNumber]: true }))}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Show Investigation Hint</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#0E1320] border border-slate-800 text-xs text-amber-300 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Hint: </span>
                  <span>{interpolate(currentStage.hint)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={activeStageIdx === 0}
            onClick={() => setActiveStageIdx(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Stage</span>
          </button>

          <button
            disabled={activeStageIdx === CAPSTONE_STAGES.length - 1}
            onClick={() => setActiveStageIdx(prev => Math.min(CAPSTONE_STAGES.length - 1, prev + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-md shadow-purple-950/40"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Incident Summary & Export Panel */}
      {completedCount >= 10 && (
        <div className="p-6 rounded-3xl bg-[#090D17] border border-emerald-500/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Generated SOC Incident Triage Summary</h3>
            </div>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Report Copied!' : 'Copy Incident Report'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
            {generateReportText()}
          </pre>
        </div>
      )}
    </div>
  );
};
