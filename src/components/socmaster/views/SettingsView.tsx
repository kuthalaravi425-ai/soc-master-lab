import React, { useState } from 'react';
import { Settings, RefreshCcw, Save, Check, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { LabEnvironmentVariables } from '../../../types/socMasterLab';

export const SettingsView: React.FC = () => {
  const { labVars, updateLabVar, resetLabVars, resetAllProgress } = useSocMasterLab();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#090D17] border border-slate-800 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Settings className="w-4 h-4" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            LAB ENVIRONMENT PARAMETERS
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Lab Environment IP & Port Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Configure your dedicated virtual machine IP addresses and network interfaces. All commands, configurations, and verification scripts across the platform will automatically interpolate your settings in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings Form */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">
                  SIEM Server IP (<span className="text-cyan-400">&lt;SIEM_IP&gt;</span>):
                </label>
                <input
                  type="text"
                  value={labVars.siemIp}
                  onChange={e => updateLabVar('siemIp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="192.168.1.50"
                />
                <span className="text-[10px] text-slate-500 font-sans block">Primary Ubuntu host IP running Elasticsearch & Suricata.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">
                  Kali Attacker IP (<span className="text-red-400">&lt;KALI_IP&gt;</span>):
                </label>
                <input
                  type="text"
                  value={labVars.kaliIp}
                  onChange={e => updateLabVar('kaliIp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="192.168.1.100"
                />
                <span className="text-[10px] text-slate-500 font-sans block">Kali Linux VM used for controlled threat simulations.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">
                  Windows Endpoint IP (<span className="text-purple-400">&lt;WINDOWS_IP&gt;</span>):
                </label>
                <input
                  type="text"
                  value={labVars.windowsIp}
                  onChange={e => updateLabVar('windowsIp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="192.168.1.75"
                />
                <span className="text-[10px] text-slate-500 font-sans block">Optional Windows victim workstation.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">
                  Suricata Network Interface (<span className="text-emerald-400">&lt;INTERFACE&gt;</span>):
                </label>
                <input
                  type="text"
                  value={labVars.suricataInterface}
                  onChange={e => updateLabVar('suricataInterface', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="eth0 / ens33 / enp0s3"
                />
                <span className="text-[10px] text-slate-500 font-sans block">Check with "ip link" (e.g. eth0, ens33, enp0s3).</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Elasticsearch Port:</label>
                <input
                  type="text"
                  value={labVars.elasticsearchPort}
                  onChange={e => updateLabVar('elasticsearchPort', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="9200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Logstash Beats Port:</label>
                <input
                  type="text"
                  value={labVars.logstashPort}
                  onChange={e => updateLabVar('logstashPort', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="5044"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Kibana Web Port:</label>
                <input
                  type="text"
                  value={labVars.kibanaPort}
                  onChange={e => updateLabVar('kibanaPort', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1019] border border-slate-700 text-white outline-none focus:border-cyan-500"
                  placeholder="5601"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={resetLabVars}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-950/40"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saved ? 'Saved to Browser!' : 'Save Variables'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Reset Data Panel */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#080B12] border border-red-500/20 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Danger Zone: Reset Progress</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Want to start the lab completely fresh? Clearing progress wipes all module completions, checklist checkboxes, and challenge answer validations from your browser localStorage.
          </p>

          <button
            onClick={resetAllProgress}
            className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Progress & Checklists</span>
          </button>
        </div>
      </div>
    </div>
  );
};
