import React from 'react';
import {
  LayoutDashboard,
  Terminal,
  Database,
  Layers,
  Radio,
  Shield,
  CheckCircle2,
  Flame,
  Wrench,
  Target,
  Award,
  Settings,
  FileText,
  Search,
  BookOpen,
  FileCode,
  Zap,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { ModuleId, ViewMode } from '../../../types/socMasterLab';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const SocMasterSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const {
    currentView,
    setCurrentView,
    activeModuleId,
    setActiveModuleId,
    progress,
    totalCompletedModulesCount,
    overallPercentage,
    currentRank,
    setIsSearchOpen,
    setIsNanoModalOpen,
    openTerminalWithCommand,
  } = useSocMasterLab();

  const handleModuleClick = (modId: ModuleId) => {
    setActiveModuleId(modId);
    setCurrentView('module');
  };

  const CORE_MODULES: { id: ModuleId; num: string; label: string; icon: React.ReactNode }[] = [
    { id: 'prerequisites', num: '01', label: 'Prerequisites', icon: <Terminal className="w-4 h-4" /> },
    { id: 'elasticsearch', num: '02', label: 'Elasticsearch', icon: <Database className="w-4 h-4" /> },
    { id: 'logstash', num: '03', label: 'Logstash', icon: <Layers className="w-4 h-4" /> },
    { id: 'kibana', num: '04', label: 'Kibana', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'filebeat', num: '05', label: 'Filebeat', icon: <Radio className="w-4 h-4" /> },
    { id: 'suricata', num: '06', label: 'Suricata IDS', icon: <Shield className="w-4 h-4" /> },
    { id: 'harden-verify', num: '07', label: 'Harden & Verify', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const LAB_CENTERS = [
    { id: 'detection-labs' as ViewMode, num: '08', label: 'Detection Labs', icon: <Flame className="w-4 h-4 text-red-400" /> },
    { id: 'troubleshooting' as ViewMode, num: '09', label: 'Troubleshooting Center', icon: <Wrench className="w-4 h-4 text-cyan-400" /> },
    { id: 'capstone' as ViewMode, num: '10', label: 'Final SOC Challenge', icon: <Target className="w-4 h-4 text-purple-400" /> },
  ];

  const DEEP_DIVE_TOOLS = [
    { id: 'event-trace' as ViewMode, label: 'Trace 1 Event Pipeline', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'port-map' as ViewMode, label: 'Port & Service Map', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'config-library' as ViewMode, label: 'Configuration Files', icon: <FileText className="w-4 h-4 text-purple-400" /> },
    { id: 'log-explorer' as ViewMode, label: 'Log Explorer (eve.json)', icon: <FileCode className="w-4 h-4 text-emerald-400" /> },
    { id: 'interview-prep' as ViewMode, label: 'SOC Interview Mode', icon: <Award className="w-4 h-4 text-cyan-400" /> },
    { id: 'portfolio' as ViewMode, label: 'Portfolio & README', icon: <BookOpen className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-[#070A0F] border-r border-slate-800 z-40 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#090D15]">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-emerald-950/40 shrink-0">
            SOC
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-bold text-sm tracking-tight truncate group-hover:text-emerald-400 transition">
                SOC MASTER LAB
              </div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider truncate">
                Enterprise SIEM Range
              </div>
            </div>
          )}
        </button>

        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin text-xs">
        {/* Main Dashboard Link */}
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
              currentView === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* Section: 01 to 07 Core Modules */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              Core Modules (01–07)
            </div>
          )}
          <div className="space-y-1">
            {CORE_MODULES.map(m => {
              const isSelected = currentView === 'module' && activeModuleId === m.id;
              const isDone = !!progress.completedModules[m.id];
              return (
                <button
                  key={m.id}
                  onClick={() => handleModuleClick(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={`${m.num} ${m.label}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0">{m.icon}</span>
                    {!collapsed && (
                      <span className="truncate">
                        <span className="font-mono text-[10px] text-slate-500 mr-1.5">{m.num}</span>
                        {m.label}
                      </span>
                    )}
                  </div>
                  {!collapsed && isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: 08 to 10 Detection & Labs */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              Advanced Labs (08–10)
            </div>
          )}
          <div className="space-y-1">
            {LAB_CENTERS.map(l => {
              const isSelected = currentView === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setCurrentView(l.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl transition ${
                    isSelected
                      ? 'bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={`${l.num} ${l.label}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0">{l.icon}</span>
                    {!collapsed && (
                      <span className="truncate">
                        <span className="font-mono text-[10px] text-slate-500 mr-1.5">{l.num}</span>
                        {l.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Architecture & Tools */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              Investigation Utilities
            </div>
          )}
          <div className="space-y-1">
            {DEEP_DIVE_TOOLS.map(t => {
              const isSelected = currentView === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setCurrentView(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition ${
                    isSelected
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={t.label}
                >
                  <span className="shrink-0">{t.icon}</span>
                  {!collapsed && <span className="truncate">{t.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-slate-800 bg-[#080B12] space-y-2 shrink-0">
        {!collapsed && (
          <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">{currentRank}</span>
              <span className="font-bold text-emerald-400">{overallPercentage}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition ${
              currentView === 'settings' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Lab Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            {!collapsed && <span>Settings</span>}
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => openTerminalWithCommand()}
            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition"
            title="Simulated Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
