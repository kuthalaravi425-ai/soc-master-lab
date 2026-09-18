import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../../../types/socMasterLab';

interface QuizCardProps {
  questions: QuizQuestion[];
  moduleId: string;
  onComplete?: (score: number) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ questions, moduleId, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
    const s = calculateScore();
    if (onComplete) {
      onComplete(s);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;
  const score = calculateScore();

  return (
    <div className="my-6 rounded-2xl border border-slate-800 bg-[#0B0F17] p-6 shadow-xl space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <span>Knowledge Verification Check</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test your comprehension of this module's core mechanisms and operational principles.
          </p>
        </div>

        {showResults && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono">
              Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isUserCorrect = selectedAnswers[qIdx] === q.correctIndex;
          return (
            <div key={q.id || qIdx} className="p-4 rounded-xl bg-[#080B12] border border-slate-800/80 space-y-3">
              <div className="flex items-start gap-2.5 text-sm font-semibold text-slate-200">
                <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono text-cyan-400 shrink-0 mt-0.5">
                  Q{qIdx + 1}
                </span>
                <span>{q.question}</span>
              </div>

              <div className="space-y-2 pt-1 pl-8">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  const isCorrect = q.correctIndex === optIdx;

                  let btnStyle = 'border-slate-800 bg-[#0B0F17] hover:border-slate-700 text-slate-300';
                  if (isSelected && !showResults) {
                    btnStyle = 'border-purple-500 bg-purple-950/20 text-white font-medium';
                  } else if (showResults) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-red-500 bg-red-950/30 text-red-300 line-through';
                    } else {
                      btnStyle = 'border-slate-800/60 opacity-50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={showResults}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-400 shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {showResults && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {showResults && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div
                  className={`p-3 rounded-xl border text-xs ml-8 mt-2 flex items-start gap-2 ${
                    isUserCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                      : 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                  }`}
                >
                  {isUserCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">{isUserCorrect ? 'Correct!' : 'Review Concept:'} </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showResults && (
        <div className="flex justify-end pt-2">
          <button
            disabled={!allAnswered}
            onClick={handleCheckAnswers}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              allAnswered
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Verify Knowledge Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
