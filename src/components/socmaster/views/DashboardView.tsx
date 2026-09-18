import React from 'react';
import {
  Shield,
  Layers,
  Terminal,
  Server,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Award,
  BookOpen,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { ALL_CORE_MODULES } from '../../../data/modulesIndex';
import { ArchitectureDiagram } from '../common/ArchitectureDiagram';
import { ModuleId } from '../../../types/socMasterLab';

export const DashboardView: React.FC = () => {
  const {
    setCurrentView,
    setActiveModuleId,
    progress,
    overallPercentage,
    totalCompletedModulesCount,
    currentRank,
    openTerminalWithCommand,
    labVars,
  } = useSocMasterLab();

  const handleOpenModule = (id: ModuleId) => {
    setActiveModuleId(id);
    setCurrentView('module');
  };

  const COMPONENT_STATUSES = [
    {
      name: 'Suricata IDS',
      type: 'Packet Sniffer',
      port: 'Kernel AF_PACKET',
      status: progress.completedModules['suricata'] ? 'Verified' : 'Ready to Configure',
      isHealthy: !!progress.completedModules['suricata'],
      moduleId: 'suricata' as ModuleId,
    },
    {
      name: 'Filebeat',
      type: 'Log Shipper',
      port: 'Egress TCP 5044',
      status: progress.completedModules['filebeat'] ? 'Verified' : 'Ready to Configure',
      isHealthy: !!progress.completedModules['filebeat'],
      moduleId: 'filebeat' as ModuleId,
    },
    {
      name: 'Logstash',
      type: 'ETL Pipeline',
      port: 'TCP 5044 / 9200',
      status: progress.completedModules['logstash'] ? 'Verified' : 'Ready to Configure',
      isHealthy: !!progress.completedModules['logstash'],
      moduleId: 'logstash' as ModuleId,
    },
    {
      name: 'Elasticsearch',
      type: 'Search & Analytics',
      port: 'HTTPS 9200',
      status: progress.completedModules['elasticsearch'] ? 'Verified' : 'Ready to Configure',
      isHealthy: !!progress.completedModules['elasticsearch'],
      moduleId: 'elasticsearch' as ModuleId,
    },
    {
      name: 'Kibana',
      type: 'Web Interface',
      port: 'HTTP 5601',
      status: progress.completedModules['kibana'] ? 'Verified' : 'Ready to Configure',
      isHealthy: !!progress.completedModules['kibana'],
      moduleId: 'kibana' as ModuleId,
    },
  ];

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0E1424] to-[#0A0D18] border border-slate-800 p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                SOC MASTER LAB · ENTERPRISE EDITION
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Build • Configure • Detect • Troubleshoot • Investigate
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Build a Complete Security Monitoring & Detection Lab
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Step-by-step interactive blueprint: Deploy Ubuntu Server, tune Elasticsearch, configure Logstash pipelines, build Kibana dashboards, harvest logs with Filebeat, and detect live intrusions with Suricata IDS.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleOpenModule('prerequisites')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950/50"
              >
                <span>Start Module 01: Prerequisites</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openTerminalWithCommand('sudo systemctl status elasticsearch')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Open Terminal Simulator</span>
              </button>

              <button
                onClick={() => setCurrentView('event-trace')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Trace 1 Event Pipeline</span>
              </button>
            </div>
          </div>

          {/* Progress Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-[#080B12] border border-slate-800/90 shadow-xl space-y-4 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Overall Lab Progress</span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{currentRank}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">{overallPercentage}% Completed</span>
                <span className="text-slate-400">{totalCompletedModulesCount} / 10 Modules</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
              <div className="p-2 rounded-xl bg-[#0B0F17] border border-slate-800/60">
                <div className="text-cyan-400 font-bold text-sm">{Object.keys(progress.completedChallenges).length}</div>
                <div className="text-[10px] text-slate-500">Challenges Solved</div>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0F17] border border-slate-800/60">
                <div className="text-emerald-400 font-bold text-sm">
                  {Object.values(progress.checklistProgress).filter(Boolean).length}
                </div>
                <div className="text-[10px] text-slate-500">Checklist Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Status Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>SIEM Core Services Status Matrix</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Host: {labVars.siemIp}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COMPONENT_STATUSES.map((comp, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenModule(comp.moduleId)}
              className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 hover:bg-[#0e1422] transition cursor-pointer space-y-2 group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                  {comp.name}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    comp.isHealthy ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-600'
                  }`}
                />
              </div>

              <div className="text-[11px] text-slate-400">{comp.type}</div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-400 font-semibold">{comp.port}</span>
                <span
                  className={`text-[10px] font-bold ${
                    comp.isHealthy ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {comp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Architecture Diagram */}
      <ArchitectureDiagram />

      {/* 10 Curriculum Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Curriculum & Hands-On Modules</h2>
            <p className="text-xs text-slate-400">Complete each module in sequence from host foundations to incident investigation.</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">10 Comprehensive Units</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CORE_MODULES.map(mod => {
            const isCompleted = !!progress.completedModules[mod.id];
            const checklistDone = mod.checklist.filter(c => progress.checklistProgress[c.id]).length;

            return (
              <div
                key={mod.id}
                onClick={() => handleOpenModule(mod.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isCompleted
                    ? 'bg-[#0A101C] border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700/60">
                      UNIT {mod.moduleNumber}
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        ~{mod.estimatedMinutes} mins
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">
                    Tasks: <strong className="text-slate-300">{checklistDone}/{mod.checklist.length}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                    <span>Enter Unit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Module 08 Detection Labs Card */}
          <div
            onClick={() => setCurrentView('detection-labs')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
              progress.completedModules['detection-labs']
                ? 'bg-[#0A101C] border-emerald-500/40'
                : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                  UNIT 08
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium">Controlled Labs</span>
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-red-400 transition">
                08 Detection Labs
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                Nmap port scan detection, SSH brute force spraying, and web injection attacks analyzed with KQL.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-red-400">3 Live Scenarios</span>
              <span className="text-red-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Start Attacks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 09 Troubleshooting Center Card */}
          <div
            onClick={() => setCurrentView('troubleshooting')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
              progress.completedModules['troubleshooting']
                ? 'bg-[#0A101C] border-emerald-500/40'
                : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                  UNIT 09
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-medium">Diagnostic Core</span>
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition">
                09 Troubleshooting Center
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                "Don't reinstall. Diagnose." 10-step philosophy and 12 searchable real-world error fixes.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400">12 Scenarios</span>
              <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Diagnostic Tree</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Module 10 Final Capstone Card */}
          <div
            onClick={() => setCurrentView('capstone')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
              progress.capstoneCompleted
                ? 'bg-[#0A101C] border-emerald-500/40'
                : 'bg-gradient-to-br from-[#120B1A] to-[#0B0F17] border-purple-500/30 hover:border-purple-500/60'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950/60 text-purple-400 border border-purple-500/30">
                  UNIT 10 · CAPSTONE
                </span>
                {progress.capstoneCompleted && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">CERTIFIED</span>
                )}
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition">
                10 Final SOC Challenge
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                End-to-end multi-stage incident triage: detect, harvest, index, query, correlate timeline, and report.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400">14-Step Incident</span>
              <span className="text-purple-400 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Enter Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
