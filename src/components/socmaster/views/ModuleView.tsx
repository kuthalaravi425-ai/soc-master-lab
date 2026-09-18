import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Radio,
  Server,
  Layers,
  Award,
  Play,
  CheckSquare,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { getModuleById, ALL_CORE_MODULES } from '../../../data/modulesIndex';
import { CommandBlock } from '../common/CommandBlock';
import { ChallengeCard } from '../common/ChallengeCard';
import { QuizCard } from '../common/QuizCard';
import { Checklist } from '../common/Checklist';
import { ModuleId } from '../../../types/socMasterLab';

export const ModuleView: React.FC = () => {
  const {
    activeModuleId,
    setActiveModuleId,
    progress,
    markModuleCompleted,
    saveQuizScore,
    interpolate,
    setIsNanoModalOpen,
    openTerminalWithCommand,
  } = useSocMasterLab();

  const [activeSectionTab, setActiveSectionTab] = useState<'learn' | 'config' | 'errors' | 'labs' | 'challenges' | 'quiz' | 'interview'>('learn');

  const moduleData = getModuleById(activeModuleId) || ALL_CORE_MODULES[0];
  const isModuleCompleted = !!progress.completedModules[moduleData.id];

  const currentIdx = ALL_CORE_MODULES.findIndex(m => m.id === moduleData.id);
  const prevModule = currentIdx > 0 ? ALL_CORE_MODULES[currentIdx - 1] : null;
  const nextModule = currentIdx < ALL_CORE_MODULES.length - 1 ? ALL_CORE_MODULES[currentIdx + 1] : null;

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Module Header Bar */}
      <div className="rounded-3xl bg-[#090D16] border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              MODULE {moduleData.moduleNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300">
              {moduleData.level}
            </span>
            <span className="text-xs text-slate-500 font-mono">~{moduleData.estimatedMinutes} mins</span>
          </div>

          <button
            onClick={() => markModuleCompleted(moduleData.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
              isModuleCompleted
                ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isModuleCompleted ? 'Module Completed ✓' : 'Mark Complete'}</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{moduleData.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{moduleData.tagline}</p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-800/80 pt-3 text-xs font-medium scrollbar-thin">
          {[
            { id: 'learn', label: '1–4. Overview & Install', count: moduleData.installationSteps.length },
            { id: 'config', label: '5–8. Config & Services', count: moduleData.importantPorts.length },
            { id: 'errors', label: '9–12. Error Labs & Triage', count: moduleData.commonErrors.length },
            { id: 'labs', label: '13. Hands-On Labs', count: moduleData.handsOnLabs.length },
            { id: 'challenges', label: '14. Challenges', count: moduleData.challenges.length },
            { id: 'quiz', label: '15. Quiz Check', count: moduleData.quizQuestions.length },
            { id: 'interview', label: '16. Interview Prep', count: moduleData.interviewQuestions.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSectionTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                activeSectionTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: LEARN (What is it, Why, Architecture, Installation) */}
      {activeSectionTab === 'learn' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* 1. What is it & 2. Why do we need it */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">01 · Concept</span>
              <h3 className="font-bold text-base text-white">What is it?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{moduleData.overview.whatIsIt}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">02 · Rationale</span>
              <h3 className="font-bold text-base text-white">Why do we need it?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{moduleData.overview.whyDoWeNeedIt}</p>
            </div>
          </div>

          {/* 3. Architecture & Data Flow Role */}
          <div className="p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">03 · Pipeline Placement</span>
                <h3 className="font-bold text-base text-white">Architecture & Pipeline Role</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950/60 border border-purple-500/30 text-purple-300">
                {moduleData.overview.architectureRole.split('.')[0]}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{moduleData.overview.architectureRole}</p>

            {moduleData.overview.diagramText && (
              <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
                {interpolate(moduleData.overview.diagramText)}
              </pre>
            )}
          </div>

          {/* 4. Prerequisites Checklist */}
          <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">04 · Requirements</span>
            <h3 className="font-bold text-base text-white">Module Prerequisites</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {moduleData.prerequisites.map((prereq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#070A0F] border border-slate-800/80 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">{interpolate(prereq)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Step-by-Step Installation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">05 · Implementation</span>
                <h3 className="font-bold text-lg text-white">Step-by-Step Installation Commands</h3>
                <p className="text-xs text-slate-400">Execute these commands in your Ubuntu Server terminal session.</p>
              </div>
              <button
                onClick={() => openTerminalWithCommand(moduleData.installationSteps[0]?.command)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Test in Terminal</span>
              </button>
            </div>

            <div className="space-y-3">
              {moduleData.installationSteps.map(cmd => (
                <CommandBlock
                  key={cmd.id}
                  command={cmd.command}
                  description={cmd.description}
                  whyThisCommand={cmd.whyThisCommand}
                  expectedOutput={cmd.expectedOutput}
                  whatOutputMeans={cmd.whatOutputMeans}
                  commonMistake={cmd.commonMistake}
                  troubleshooting={cmd.troubleshooting}
                  requiresSudo={cmd.requiresSudo}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIG & SERVICES (Configuration, Ports, Service Management, Verification) */}
      {activeSectionTab === 'config' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Configuration File Section */}
          <div className="p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">06 · Configuration Library</span>
                <h3 className="font-bold text-base text-white">{moduleData.configurationFile.path}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{moduleData.configurationFile.purpose}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNanoModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-600/30 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Nano Guide</span>
                </button>
              </div>
            </div>

            {/* Nano Open Command Block */}
            <CommandBlock
              command={moduleData.configurationFile.nanoCommand}
              description={`Open configuration file in Nano editor`}
              whyThisCommand={`Nano is the default terminal text editor on Ubuntu Server. Use Ctrl+O to save and Ctrl+X to exit.`}
              requiresSudo={true}
            />

            {/* Parameter Definitions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Essential Parameters Explained:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {moduleData.configurationFile.parameters.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0C1019] border border-slate-800 space-y-1">
                    <div className="font-mono font-bold text-cyan-400 text-[11px]">{p.key}</div>
                    <div className="text-slate-300">{p.purpose}</div>
                    <div className="text-[11px] font-mono text-emerald-400">Default: {interpolate(p.safeDefault)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Snippet */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">
                Safe Configuration Snippet:
              </div>
              <pre className="p-4 rounded-xl bg-[#05070B] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                {interpolate(moduleData.configurationFile.safeSnippet)}
              </pre>
            </div>
          </div>

          {/* Important Ports */}
          <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-4">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">07 · Socket Matrix</span>
            <h3 className="font-bold text-base text-white">Important Network Ports & Protocols</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moduleData.importantPorts.map((port, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{port.component}</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                      {port.protocol} {interpolate(String(port.port))}
                    </span>
                  </div>
                  <p className="text-slate-400">{port.purpose}</p>
                  <div className="pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-500">
                    Verify: <code className="text-emerald-400">{interpolate(port.verificationCommand)}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Management */}
          <div className="p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-4">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">08 · Daemon Control</span>
            <h3 className="font-bold text-base text-white">Service Management (systemd)</h3>
            <p className="text-xs text-slate-300">{moduleData.serviceManagement.explanation}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Start', cmd: moduleData.serviceManagement.startCommand },
                { label: 'Stop', cmd: moduleData.serviceManagement.stopCommand },
                { label: 'Restart', cmd: moduleData.serviceManagement.restartCommand },
                { label: 'Enable on Boot', cmd: moduleData.serviceManagement.enableCommand },
                { label: 'Check Status', cmd: moduleData.serviceManagement.statusCommand },
                { label: 'View Logs', cmd: moduleData.serviceManagement.logsCommand },
              ].map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{s.label}</span>
                  <code className="block font-mono text-[11px] text-emerald-400 truncate">{s.cmd}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">09 · Health Verification</span>
              <h3 className="font-bold text-lg text-white">Verification & Sockets Inspection</h3>
            </div>
            {moduleData.verificationSteps.map(cmd => (
              <CommandBlock
                key={cmd.id}
                command={cmd.command}
                description={cmd.description}
                whyThisCommand={cmd.whyThisCommand}
                expectedOutput={cmd.expectedOutput}
                whatOutputMeans={cmd.whatOutputMeans}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ERRORS & TROUBLESHOOTING */}
      {activeSectionTab === 'errors' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm text-white block mb-1">Interactive Error Diagnostic Labs</span>
              Every enterprise deployment will experience configuration mistakes, permission locks, and port collisions. Instead of guessing, diagnose the evidence.
            </div>
          </div>

          <div className="space-y-4">
            {moduleData.commonErrors.map((err, idx) => (
              <div key={err.id || idx} className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-red-950/60 text-red-400 border border-red-500/30 flex items-center justify-center text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-base text-white">{err.title}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                    Troubleshooting Lab
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-300 font-mono">
                  <strong>Symptom: </strong>{err.symptom}
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <span className="text-slate-500 font-bold block uppercase text-[10px] font-mono">Why it happens:</span>
                  <p>{err.whyItHappens}</p>
                </div>

                {/* Diagnostic Command */}
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px] font-mono mb-1">Diagnostic Command:</span>
                  <CommandBlock
                    command={err.diagnosticCommand}
                    description="Run this command to reproduce or identify the fault"
                    expectedOutput={err.expectedErrorOutput}
                    whatOutputMeans="Confirms the exact failure mechanism in system logs."
                  />
                </div>

                {/* Fix Explanation & Command */}
                <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">Resolution & Fix:</div>
                  <p className="text-slate-300">{err.fixExplanation}</p>
                  {err.fixCommand && (
                    <code className="block p-2 rounded bg-black/50 text-emerald-300 font-mono text-[11px] border border-slate-800">
                      {interpolate(err.fixCommand)}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HANDS-ON LABS */}
      {activeSectionTab === 'labs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">13 · Practical Exercises</span>
            <h3 className="font-bold text-xl text-white">Hands-On Practice Labs</h3>
            <p className="text-xs text-slate-400">Complete these structured exercises to gain muscle memory.</p>
          </div>

          <div className="space-y-6">
            {moduleData.handsOnLabs.map(lab => (
              <div key={lab.id} className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold">
                      LAB {lab.number}
                    </span>
                    <h4 className="font-bold text-base text-white">{lab.title}</h4>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-[#080B12] p-3.5 rounded-xl border border-slate-800/80">
                  <strong className="text-slate-400 block mb-0.5">Objective:</strong>
                  {interpolate(lab.objective)}
                </div>

                <div className="space-y-3">
                  {lab.steps.map(step => (
                    <div key={step.stepNumber} className="space-y-2 pl-2">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-cyan-400">
                          {step.stepNumber}
                        </span>
                        <span>{step.instruction}</span>
                      </div>

                      {step.command && (
                        <CommandBlock
                          command={step.command}
                          whyThisCommand={step.why}
                          expectedOutput={step.expectedResult}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-[#080B12] border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-300">Expected Result: </span>
                    <span>{lab.expectedVerification}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CHALLENGES */}
      {activeSectionTab === 'challenges' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">14 · Challenge Arena</span>
            <h3 className="font-bold text-xl text-white">Module Challenges</h3>
            <p className="text-xs text-slate-400">Solve real scenarios by finding listening ports, configuring paths, and verifying health.</p>
          </div>

          <div className="space-y-4">
            {moduleData.challenges.map(chal => (
              <ChallengeCard key={chal.id} challenge={chal} moduleId={moduleData.id} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: QUIZ & KNOWLEDGE CHECK */}
      {activeSectionTab === 'quiz' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">15 · Evaluation</span>
            <h3 className="font-bold text-xl text-white">Module Comprehension Quiz</h3>
          </div>

          <QuizCard
            questions={moduleData.quizQuestions}
            moduleId={moduleData.id}
            onComplete={score => saveQuizScore(moduleData.id, score)}
          />
        </div>
      )}

      {/* TAB 7: INTERVIEW QUESTIONS & CHECKLIST */}
      {activeSectionTab === 'interview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">16 · Career Preparation</span>
              <h3 className="font-bold text-xl text-white">SOC Analyst Interview Questions</h3>
              <p className="text-xs text-slate-400">How to explain this tool and its operational troubleshooting in real job interviews.</p>
            </div>

            <div className="space-y-4">
              {moduleData.interviewQuestions.map((q, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-3">
                  <div className="font-bold text-sm text-white flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <span>{q.question}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080B12] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <div className="font-bold text-cyan-400">Model Answer:</div>
                    <p>{q.modelAnswer}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-mono text-slate-500">Key Points:</span>
                    {q.keyPoints.map((kp, kIdx) => (
                      <span key={kIdx} className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60">
                        {kp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Checklist */}
          <Checklist items={moduleData.checklist} moduleId={moduleData.id} />
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {prevModule ? (
          <button
            onClick={() => setActiveModuleId(prevModule.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Unit {prevModule.moduleNumber}: {prevModule.title.split(' ')[0]}</span>
          </button>
        ) : <div />}

        <button
          onClick={() => markModuleCompleted(moduleData.id, true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50"
        >
          Complete Module {moduleData.moduleNumber}
        </button>

        {nextModule ? (
          <button
            onClick={() => setActiveModuleId(nextModule.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            <span>Unit {nextModule.moduleNumber}: {nextModule.title.split(' ')[0]}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
};
