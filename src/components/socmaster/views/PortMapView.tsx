import React, { useState } from 'react';
import { Target, Search, CheckCircle2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { PORT_MAP_ITEMS } from '../../../data/portMapData';
import { PortDef } from '../../../types/socMasterLab';

export const PortMapView: React.FC = () => {
  const { interpolate, openTerminalWithCommand } = useSocMasterLab();
  const [selectedPort, setSelectedPort] = useState<PortDef>(PORT_MAP_ITEMS[1]);
  const [search, setSearch] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredPorts = PORT_MAP_ITEMS.filter(
    p =>
      String(p.port).includes(search) ||
      p.component.toLowerCase().includes(search.toLowerCase()) ||
      p.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(interpolate(cmd));
      setCopiedCmd(cmd);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#090D17] border border-cyan-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Target className="w-4 h-4" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            NETWORK MATRIX · PORTS & SERVICES
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Port & Service Architecture Map
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Interactive matrix of all listening daemons, administration sockets, protocol bindings, and verification commands across the SIEM appliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Port Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-2xl bg-[#080B12] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Active Sockets Table</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter ports (e.g. 9200, 5044, ssh)..."
                className="px-3 py-1 rounded-lg bg-[#0C1019] border border-slate-800 text-xs font-mono text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0C1019] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Port</th>
                    <th className="py-2.5 px-3">Proto</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredPorts.map(p => {
                    const isSelected = selectedPort.port === p.port;
                    return (
                      <tr
                        key={String(p.port)}
                        onClick={() => setSelectedPort(p)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-cyan-950/30 text-white font-bold' : 'hover:bg-slate-800/30 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 text-cyan-400 font-bold whitespace-nowrap">
                          {interpolate(String(p.port))}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{p.protocol}</td>
                        <td className="py-3 px-3 font-sans text-white">{p.component}</td>
                        <td className="py-3 px-3 font-sans text-slate-400 truncate max-w-[200px]">{p.purpose}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Selected Port Deep Inspector */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#080B12] border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Selected Port Inspector</div>
              <h3 className="font-bold text-lg text-white">
                Port {interpolate(String(selectedPort.port))} ({selectedPort.protocol})
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-slate-800 text-slate-300">
              {selectedPort.component}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-mono text-[10px] font-bold uppercase block">Purpose & Role:</span>
              <p className="text-slate-200 mt-1 leading-relaxed">{selectedPort.purpose}</p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] font-bold uppercase block">Configuration File:</span>
              <code className="text-amber-400 font-mono text-[11px] block mt-1">{selectedPort.configFile}</code>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] font-bold uppercase block">Verification Command:</span>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#05070B] border border-slate-800 mt-1 font-mono text-[11px]">
                <code className="text-emerald-400 truncate">{interpolate(selectedPort.verificationCommand)}</code>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(selectedPort.verificationCommand)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    {copiedCmd === selectedPort.verificationCommand ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => openTerminalWithCommand(interpolate(selectedPort.verificationCommand))}
                    className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>

            {selectedPort.troubleshootingCommands.length > 0 && (
              <div>
                <span className="text-slate-500 font-mono text-[10px] font-bold uppercase block mb-1">
                  Troubleshooting Commands:
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedPort.troubleshootingCommands.map((tc, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#0B0F17] border border-slate-800 text-slate-300 flex items-center justify-between">
                      <code className="text-slate-300 truncate">{interpolate(tc)}</code>
                      <button
                        onClick={() => openTerminalWithCommand(interpolate(tc))}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                      >
                        Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
