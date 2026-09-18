import React, { useState } from 'react';
import { Award, HelpCircle, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { SOC_INTERVIEW_QUESTIONS, InterviewQuestionItem } from '../../../data/interviewQuestionsData';

export const InterviewPrepView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(SOC_INTERVIEW_QUESTIONS[0].id);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#090D17] border border-cyan-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Award className="w-4 h-4" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            CAREER BENCH · INTERVIEW PREPARATION
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SOC Analyst & SIEM Engineering Interview Bank
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Master real-world technical and troubleshooting questions asked by SOC managers and incident response leads. Understand the interviewer's intent, review production model answers, and avoid common candidate pitfalls.
        </p>
      </div>

      {/* Questions Accordion */}
      <div className="space-y-4">
        {SOC_INTERVIEW_QUESTIONS.map(q => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-800 bg-[#080B12] overflow-hidden transition-all shadow-lg"
            >
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-[#0c121e] transition"
              >
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    {q.category}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1">{q.question}</h3>
                </div>

                <div className="p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-[#0B0F17] border-t border-slate-800/80 space-y-4 text-xs animate-in fade-in duration-150">
                  {/* Interviewer Intent */}
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300">
                    <strong className="text-white block mb-0.5 font-sans">Why the Interviewer Asks This:</strong>
                    <p className="leading-relaxed">{q.interviewerIntent}</p>
                  </div>

                  {/* Model Answer */}
                  <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2">
                    <span className="font-bold text-emerald-400 text-sm block">Strong Candidate Model Answer:</span>
                    <p className="text-slate-300 leading-relaxed text-xs">{q.strongAnswer}</p>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Critical Concepts to Mention:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.keyPoints.map((kp, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-[#070A0F] border border-slate-800 text-slate-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Pitfall */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Common Mistake to Avoid: </span>
                      <span>{q.candidateMistakeToAvoid}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
