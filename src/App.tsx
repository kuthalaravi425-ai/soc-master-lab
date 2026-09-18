import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { ShadowXLabControlPlane } from './pages/ShadowXLabControlPlane';
import { SocMasterLabApp } from './components/socmaster/SocMasterLabApp';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Cyber-Platform UI:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080A0E] text-slate-200 flex items-center justify-center p-6 font-mono text-xs">
          <div className="max-w-lg w-full bg-[#0B0E14] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-base font-bold text-white">Application Exception Caught</h2>
            </div>
            <p className="text-slate-300">
              The portal encountered a render error but recovered safely.
            </p>
            <pre className="p-3 bg-[#080A0E] rounded-xl border border-[#202736] text-amber-300 text-[11px] whitespace-pre-wrap break-all">
              {this.state.error?.message || "Unknown rendering exception"}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Web Console</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [platformMode, setPlatformMode] = useState<'socmaster' | 'enterprise'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'enterprise') return 'enterprise';
      const stored = localStorage.getItem('sxl_platform_mode');
      if (stored === 'enterprise') return 'enterprise';
    } catch {}
    return 'socmaster';
  });

  const handleSwitchToEnterprise = () => {
    setPlatformMode('enterprise');
    try {
      localStorage.setItem('sxl_platform_mode', 'enterprise');
    } catch {}
  };

  const handleSwitchToSocMaster = () => {
    setPlatformMode('socmaster');
    try {
      localStorage.setItem('sxl_platform_mode', 'socmaster');
    } catch {}
  };

  return (
    <ErrorBoundary>
      {platformMode === 'socmaster' ? (
        <SocMasterLabApp onSwitchToEnterprise={handleSwitchToEnterprise} />
      ) : (
        <div className="relative">
          {/* Top Banner allowing return to SOC Master Lab */}
          <div className="bg-[#0A0E18] border-b border-emerald-500/30 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>ShadowXLab Enterprise Appliance · Running Range Engines</span>
            </div>
            <button
              onClick={handleSwitchToSocMaster}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
            >
              <span>← Return to SOC Master Lab</span>
            </button>
          </div>
          <ShadowXLabControlPlane />
        </div>
      )}
    </ErrorBoundary>
  );
};
