import React, { useState } from 'react';
import { Target, Lightbulb, CheckCircle2, AlertTriangle, ArrowRight, Play } from 'lucide-react';
import { Challenge } from '../../../types/socMasterLab';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

interface ChallengeCardProps {
  challenge: Challenge;
  moduleId: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, moduleId }) => {
  const { progress, markChallengeCompleted, openTerminalWithCommand, interpolate } = useSocMasterLab();
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const isAlreadyCompleted = progress.completedChallenges[challenge.id];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const cleanInput = userAnswer.trim().toLowerCase();
    const matches = challenge.acceptedAnswers.some(ans => {
      const interpolatedAns = interpolate(ans).trim().toLowerCase();
      return cleanInput === interpolatedAns || cleanInput.includes(interpolatedAns);
    });

    setSubmitted(true);
    if (matches) {
      setIsCorrect(true);
      markChallengeCompleted(challenge.id);
    } else {
      setIsCorrect(false);
    }
  };

  const handleSimulateTip = () => {
    if (challenge.commandSuggestion) {
      openTerminalWithCommand(interpolate(challenge.commandSuggestion));
    }
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-800 bg-[#0A0D15] p-6 shadow-xl space-y-4 font-sans text-slate-200">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">Hands-On Challenge</div>
            <h4 className="font-bold text-base text-white">{challenge.title}</h4>
          </div>
        </div>

        {(isAlreadyCompleted || isCorrect) && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SOLVED</span>
          </span>
        )}
      </div>

      <div className="text-xs text-slate-300 leading-relaxed bg-[#070A10] p-3.5 rounded-xl border border-slate-800/80">
        <p className="font-medium text-slate-400 mb-1">Scenario:</p>
        <p>{interpolate(challenge.scenario)}</p>
      </div>

      <div className="text-sm font-semibold text-white">
        {interpolate(challenge.question)}
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userAnswer}
            disabled={isAlreadyCompleted && !submitted}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Type your answer or verification command..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#070A10] border border-slate-700 text-white font-mono text-xs outline-none focus:border-red-500 transition"
          />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-950/40 cursor-pointer"
          >
            Submit Answer
          </button>
        </div>
      </form>

      {/* Result feedback */}
      {submitted && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-150 ${
            isCorrect
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Correct! Challenge Accomplished.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Not quite. Check your command or parameters.</span>
              </>
            )}
          </div>

          <p className="leading-relaxed">
            {isCorrect ? challenge.correctExplanation : challenge.troubleshootingTip}
          </p>

          {!isCorrect && challenge.commandSuggestion && (
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleSimulateTip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test in Terminal: {interpolate(challenge.commandSuggestion)}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hint reveal */}
      <div className="pt-1">
        {!showHint ? (
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Reveal Hint</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-[#0E1320] border border-slate-800 text-xs text-amber-300/90 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Investigation Hint: </span>
              <span>{challenge.hint}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
