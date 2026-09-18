import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Radio,
  Layers,
  Database,
  LayoutDashboard,
  UserCheck,
  ArrowDown,
  Info,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

interface NodeDetail {
  id: string;
  name: string;
  role: string;
  port: string;
  configFile: string;
  primaryLog: string;
  verificationCmd: string;
  explanation: string;
  flowDirection: string;
}

const NODES: NodeDetail[] = [
  {
    id: 'suricata',
    name: 'Suricata IDS Engine',
    role: 'Network Threat Detection & Packet Inspection',
    port: 'Promiscuous (Kernel AF_PACKET)',
    configFile: '/etc/suricata/suricata.yaml',
    primaryLog: '/var/log/suricata/eve.json',
    verificationCmd: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
    explanation:
      'Sniffs raw network wire packets on <INTERFACE> in promiscuous mode. Compares packet headers and payload contents against 40,000+ Emerging Threats rules. Generates structured JSON alert records.',
    flowDirection: 'Passes JSON alert strings down to disk file eve.json',
  },
  {
    id: 'eve',
    name: 'eve.json Storage Buffer',
    role: 'Local On-Disk Extensible Event File',
    port: 'Filesystem I/O',
    configFile: 'Managed by Suricata outputs[0].eve-log',
    primaryLog: '/var/log/suricata/eve.json',
    verificationCmd: 'sudo tail -f /var/log/suricata/eve.json | jq .',
    explanation:
      'An append-only log file on the local Linux server filesystem. Each line is an autonomous, complete JSON object preserving L3/L4/L7 protocol fields, timestamps, and threat signatures.',
    flowDirection: 'Harvested by Filebeat via Linux inotify events',
  },
  {
    id: 'filebeat',
    name: 'Filebeat Log Shipper',
    role: 'Lightweight Golang Agent & Registry Pointer',
    port: 'Egress TCP 5044',
    configFile: '/etc/filebeat/filebeat.yml',
    primaryLog: '/var/log/filebeat/filebeat',
    verificationCmd: 'sudo filebeat test output',
    explanation:
      'Reads new byte offsets from eve.json, retains an exact line pointer in /var/lib/filebeat/registry, and forwards batches across the network using the compressed Lumberjack TCP protocol.',
    flowDirection: 'Transmits streaming batches to Logstash Beats port 5044',
  },
  {
    id: 'logstash',
    name: 'Logstash Pipeline Engine',
    role: 'Centralized ETL Transformation & Schema Enrichment',
    port: 'TCP 5044 (Ingest) / TCP 9200 (Output)',
    configFile: '/etc/logstash/conf.d/01-beats.conf',
    primaryLog: '/var/log/logstash/logstash-plain.log',
    verificationCmd: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
    explanation:
      'Receives Beats streams on TCP port 5044, parses raw JSON strings into first-class fields, adds SOC metadata tags, and batches bulk writes into Elasticsearch via HTTP REST API.',
    flowDirection: 'Issues bulk HTTP POST write requests to Elasticsearch on port 9200',
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch Search Node',
    role: 'Distributed Inverted Index & Hot Security Storage',
    port: 'HTTPS 9200 (REST) / TCP 9300 (Transport)',
    configFile: '/etc/elasticsearch/elasticsearch.yml',
    primaryLog: '/var/log/elasticsearch/soc-master-lab.log',
    verificationCmd: 'curl -k -u elastic:pass https://localhost:9200/_cluster/health',
    explanation:
      'Stores documents in daily indices (soc-telemetry-YYYY.MM.DD), creates Lucene inverted indices for sub-second full-text searches, and enforces role-based access control.',
    flowDirection: 'Serves query results to Kibana via authenticated REST APIs',
  },
  {
    id: 'kibana',
    name: 'Kibana UI & Visual Analytics',
    role: 'Analyst Web Interface & Threat Dashboard',
    port: 'HTTP 5601',
    configFile: '/etc/kibana/kibana.yml',
    primaryLog: '/var/log/kibana/kibana.log',
    verificationCmd: 'curl -I http://localhost:5601/api/status',
    explanation:
      'Renders responsive graphical dashboards, histogram timelines, threat maps, and the KQL search bar for real-time security telemetry investigations.',
    flowDirection: 'Presents visual threat data to the human SOC analyst',
  },
  {
    id: 'analyst',
    name: 'SOC Analyst / Incident Responder',
    role: 'Alert Triage, Correlation, Containment & Documentation',
    port: 'Browser Client',
    configFile: 'SOP Runbooks & MITRE ATT&CK Matrix',
    primaryLog: 'Incident Triage Ticket (Jira/TheHive)',
    verificationCmd: 'Review alert timeline and verify IP containment',
    explanation:
      'Validates whether alerts are True Positives or False Positives, reconstructs the adversary attack narrative, identifies attacker source IPs, and issues mitigation blocks.',
    flowDirection: 'Executes containment (e.g. UFW firewall block) and writes incident reports',
  },
];

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('suricata');
  const { interpolate, setCurrentView, setActiveModuleId } = useSocMasterLab();

  const selectedNode = NODES.find(n => n.id === selectedNodeId) || NODES[0];

  const handleOpenModule = (modId: string) => {
    setActiveModuleId(modId as any);
    setCurrentView('module');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#080B12] p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Interactive SOC Telemetry Pipeline</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on any pipeline component below to inspect its operational role, ports, configuration files, and data flow.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F1420] border border-slate-800 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Pipeline: Suricata → eve.json → Filebeat → Logstash → ES → Kibana</span>
        </div>
      </div>

      {/* Visual Pipeline Nodes Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 mb-6">
        {NODES.map((node, index) => {
          const isSelected = node.id === selectedNodeId;
          return (
            <div key={node.id} className="relative flex flex-col items-center">
              <button
                onClick={() => setSelectedNodeId(node.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-[#101827] border-emerald-500 shadow-lg shadow-emerald-950/40 translate-y-[-2px]'
                    : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 hover:bg-[#0e1422]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">0{index + 1}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                </div>
                <div className="font-bold text-xs text-white truncate mb-1">{node.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 truncate">{node.role.split(' ')[0]}</div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 font-semibold truncate">
                  {node.port.split(' ')[0]}
                </div>
              </button>

              {index < NODES.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspector Drawer */}
      <div className="p-5 rounded-xl bg-[#0B0F17] border border-slate-800 animate-in fade-in duration-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                COMPONENT INSPECTOR
              </span>
              <h4 className="font-bold text-base text-white">{selectedNode.name}</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedNode.role}</p>
          </div>

          <div className="flex items-center gap-2">
            {selectedNode.id !== 'analyst' && selectedNode.id !== 'eve' && (
              <button
                onClick={() => handleOpenModule(selectedNode.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/30"
              >
                <span>Open Module Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 font-mono text-[11px] block uppercase font-bold">Operational Purpose:</span>
              <p className="text-slate-300 mt-1 leading-relaxed">{interpolate(selectedNode.explanation)}</p>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[11px] block uppercase font-bold">Downstream Data Flow:</span>
              <p className="text-emerald-400 mt-1 font-semibold">{interpolate(selectedNode.flowDirection)}</p>
            </div>
          </div>

          <div className="space-y-2.5 bg-[#070A0F] p-3.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">Port / Socket:</span>
              <span className="text-cyan-400 font-semibold">{interpolate(selectedNode.port)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Configuration File:</span>
              <span className="text-amber-400 font-semibold">{selectedNode.configFile}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Primary Log Location:</span>
              <span className="text-slate-300">{selectedNode.primaryLog}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Health Verification Command:</span>
              <code className="text-emerald-400 font-semibold">{interpolate(selectedNode.verificationCmd)}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
