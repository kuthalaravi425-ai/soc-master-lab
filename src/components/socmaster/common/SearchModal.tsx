import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, BookOpen, AlertTriangle, Terminal, Target, ArrowRight, Layers, FileText } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { ALL_CORE_MODULES } from '../../../data/modulesIndex';
import { SEARCHABLE_TROUBLESHOOTING_SCENARIOS } from '../../../data/troubleshootingData';
import { CONFIG_FILE_LIBRARY } from '../../../data/configFilesData';
import { PORT_MAP_ITEMS } from '../../../data/portMapData';
import { ModuleId, ViewMode } from '../../../types/socMasterLab';

interface SearchResultItem {
  id: string;
  type: 'module' | 'command' | 'error' | 'troubleshoot' | 'config' | 'port';
  title: string;
  subtitle: string;
  badge: string;
  view: ViewMode;
  moduleId?: ModuleId;
}

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setCurrentView, setActiveModuleId } = useSocMasterLab();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const results = useMemo((): SearchResultItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResultItem[] = [];

    // 1. Search Modules
    ALL_CORE_MODULES.forEach(mod => {
      if (
        mod.title.toLowerCase().includes(q) ||
        mod.tagline.toLowerCase().includes(q) ||
        mod.overview.whatIsIt.toLowerCase().includes(q)
      ) {
        items.push({
          id: `mod-${mod.id}`,
          type: 'module',
          title: `Module ${mod.moduleNumber}: ${mod.title}`,
          subtitle: mod.tagline,
          badge: mod.badge,
          view: 'module',
          moduleId: mod.id,
        });
      }

      // Search Commands in module
      mod.installationSteps.forEach(cmd => {
        if (
          cmd.command.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.whyThisCommand.toLowerCase().includes(q)
        ) {
          items.push({
            id: `cmd-${cmd.id}`,
            type: 'command',
            title: cmd.command,
            subtitle: `${cmd.description} (${mod.title})`,
            badge: 'Command',
            view: 'module',
            moduleId: mod.id,
          });
        }
      });

      // Search Common Errors in module
      mod.commonErrors.forEach(err => {
        if (
          err.title.toLowerCase().includes(q) ||
          err.symptom.toLowerCase().includes(q) ||
          err.whyItHappens.toLowerCase().includes(q)
        ) {
          items.push({
            id: `err-${err.id}`,
            type: 'error',
            title: err.title,
            subtitle: err.symptom,
            badge: 'Error Lab',
            view: 'module',
            moduleId: mod.id,
          });
        }
      });
    });

    // 2. Search Troubleshooting Scenarios
    SEARCHABLE_TROUBLESHOOTING_SCENARIOS.forEach(scen => {
      if (
        scen.title.toLowerCase().includes(q) ||
        scen.symptom.toLowerCase().includes(q) ||
        scen.rootCause.toLowerCase().includes(q)
      ) {
        items.push({
          id: `ts-${scen.id}`,
          type: 'troubleshoot',
          title: scen.title,
          subtitle: scen.symptom,
          badge: 'Troubleshooting',
          view: 'troubleshooting',
        });
      }
    });

    // 3. Search Config Files
    CONFIG_FILE_LIBRARY.forEach(cfg => {
      if (
        cfg.path.toLowerCase().includes(q) ||
        cfg.component.toLowerCase().includes(q) ||
        cfg.purpose.toLowerCase().includes(q)
      ) {
        items.push({
          id: `cfg-${cfg.path}`,
          type: 'config',
          title: cfg.path,
          subtitle: `${cfg.component} - ${cfg.purpose}`,
          badge: 'Config File',
          view: 'config-library',
        });
      }
    });

    // 4. Search Ports
    PORT_MAP_ITEMS.forEach(port => {
      const portStr = String(port.port).toLowerCase();
      if (
        portStr.includes(q) ||
        port.component.toLowerCase().includes(q) ||
        port.purpose.toLowerCase().includes(q)
      ) {
        items.push({
          id: `port-${port.port}`,
          type: 'port',
          title: `Port ${port.port} (${port.protocol}): ${port.component}`,
          subtitle: port.purpose,
          badge: 'Port Map',
          view: 'port-map',
        });
      }
    });

    return items.slice(0, 15);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.moduleId) {
      setActiveModuleId(item.moduleId);
    }
    setCurrentView(item.view);
    setIsSearchOpen(false);
    setQuery('');
  };

  const QUICK_SEARCHES = ['9200', '5044', '5601', 'elasticsearch.yml', 'filebeat.yml', 'Suricata', 'eve.json', 'Kibana', 'connection refused', 'systemctl', 'journalctl'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0B0F17] border border-slate-700 shadow-2xl overflow-hidden font-sans text-slate-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#080B12]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ports (9200, 5044), configs, commands, errors, eve.json..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none border-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2.5 bg-[#070A0F] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin text-xs">
          <span className="text-slate-500 shrink-0 font-medium">Quick:</span>
          {QUICK_SEARCHES.map((item, i) => (
            <button
              key={i}
              onClick={() => setQuery(item)}
              className="px-2 py-0.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 shrink-0 text-[11px] font-mono border border-slate-700/60 transition"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-800/50">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-700 mx-auto" />
              <p>Type keywords, port numbers, or configuration file paths to search.</p>
              <p className="text-[11px] text-slate-600">Searchable: 9200, 5044, 5601, elasticsearch.yml, eve.json, connection refused, journalctl</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500/50 mx-auto mb-2" />
              <p>No matches found for "{query}". Try checking port numbers or commands.</p>
            </div>
          ) : (
            results.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className="p-3 rounded-xl hover:bg-[#0E1422] transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-slate-400 group-hover:text-emerald-400 transition">
                    {item.type === 'module' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'command' && <Terminal className="w-4 h-4" />}
                    {item.type === 'error' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {item.type === 'troubleshoot' && <Layers className="w-4 h-4 text-cyan-400" />}
                    {item.type === 'config' && <FileText className="w-4 h-4 text-purple-400" />}
                    {item.type === 'port' && <Target className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate font-mono">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white transition shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
