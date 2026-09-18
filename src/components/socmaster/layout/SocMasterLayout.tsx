import React, { useState } from 'react';
import {
  Search,
  Terminal,
  FileText,
  Settings,
  Layers,
  Shield,
  Menu,
  ChevronRight,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { SocMasterSidebar } from './SocMasterSidebar';
import { DashboardView } from '../views/DashboardView';
import { ModuleView } from '../views/ModuleView';
import { DetectionLabsView } from '../views/DetectionLabsView';
import { TroubleshootingCenterView } from '../views/TroubleshootingCenterView';
import { FinalCapstoneView } from '../views/FinalCapstoneView';
import { EventTraceView } from '../views/EventTraceView';
import { PortMapView } from '../views/PortMapView';
import { ConfigLibraryView } from '../views/ConfigLibraryView';
import { LogExplorerView } from '../views/LogExplorerView';
import { InterviewPrepView } from '../views/InterviewPrepView';
import { PortfolioView } from '../views/PortfolioView';
import { SettingsView } from '../views/SettingsView';
import { SearchModal } from '../common/SearchModal';
import { NanoGuideModal } from '../common/NanoGuideModal';
import { TerminalSimulator } from '../common/TerminalSimulator';

interface SocMasterLayoutProps {
  onSwitchToEnterprise?: () => void;
}

export const SocMasterLayout: React.FC<SocMasterLayoutProps> = ({ onSwitchToEnterprise }) => {
  const {
    currentView,
    setCurrentView,
    activeModuleId,
    setIsSearchOpen,
    setIsNanoModalOpen,
    openTerminalWithCommand,
    labVars,
  } = useSocMasterLab();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'module':
        return `Module: ${activeModuleId.toUpperCase()}`;
      case 'detection-labs':
        return '08 Detection Labs';
      case 'troubleshooting':
        return '09 Troubleshooting Center';
      case 'capstone':
        return '10 Final SOC Capstone Challenge';
      case 'event-trace':
        return 'Trace 1 Event Pipeline';
      case 'port-map':
        return 'Port & Service Map';
      case 'config-library':
        return 'Configuration File Library';
      case 'log-explorer':
        return 'Log & EVE JSON Explorer';
      case 'interview-prep':
        return 'SOC Interview Mode';
      case 'portfolio':
        return 'Portfolio & README Generator';
      case 'settings':
        return 'Lab Environment Settings';
      default:
        return 'Console';
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-200 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
      {/* Sidebar */}
      <SocMasterSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#070A0F]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>SOC Master Lab</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-400 font-mono truncate">{getBreadcrumbTitle()}</span>
          </div>

          {/* Quick Action Strip */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-[#0e1422] border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition"
              title="Search documentation, ports, configs (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* Terminal Simulator Button */}
            <button
              onClick={() => openTerminalWithCommand()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              title="Launch interactive simulated terminal"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminal</span>
            </button>

            {/* Nano Guide Button */}
            <button
              onClick={() => setIsNanoModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              title="Open Nano Editor Guide"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Nano Guide</span>
            </button>

            {/* Configured SIEM IP Pill */}
            <div
              onClick={() => setCurrentView('settings')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0B0F17] border border-slate-800 text-slate-400 text-[11px] font-mono cursor-pointer hover:border-slate-700 transition"
              title="Click to edit lab environment variables"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>{labVars.siemIp}</span>
            </div>

            {/* Optional Switcher back to Enterprise Control Plane */}
            {onSwitchToEnterprise && (
              <button
                onClick={onSwitchToEnterprise}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition"
                title="Switch to ShadowXLab Cyber-Range Control Plane"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Range Appliance</span>
              </button>
            )}
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'module' && <ModuleView />}
          {currentView === 'detection-labs' && <DetectionLabsView />}
          {currentView === 'troubleshooting' && <TroubleshootingCenterView />}
          {currentView === 'capstone' && <FinalCapstoneView />}
          {currentView === 'event-trace' && <EventTraceView />}
          {currentView === 'port-map' && <PortMapView />}
          {currentView === 'config-library' && <ConfigLibraryView />}
          {currentView === 'log-explorer' && <LogExplorerView />}
          {currentView === 'interview-prep' && <InterviewPrepView />}
          {currentView === 'portfolio' && <PortfolioView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <SearchModal />
      <NanoGuideModal />
      <TerminalSimulator />
    </div>
  );
};
