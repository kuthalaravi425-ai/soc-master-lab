import React, { useState } from 'react';
import {
  Award,
  Share2,
  FileText,
  Copy,
  Check,
  Download,
  CheckCircle2,
  Shield,
  Layers,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';
import { ALL_CORE_MODULES } from '../../../data/modulesIndex';

export const PortfolioView: React.FC = () => {
  const {
    progress,
    overallPercentage,
    totalCompletedModulesCount,
    currentRank,
    labVars,
    interpolate,
  } = useSocMasterLab();

  const [copiedLinkedin, setCopiedLinkedin] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'linkedin' | 'readme'>('portfolio');

  const completedModulesList = ALL_CORE_MODULES.filter(m => progress.completedModules[m.id]);
  const lastCompletedMod = completedModulesList[completedModulesList.length - 1];

  const generateLinkedinPost = () => {
    const currentFocus = lastCompletedMod
      ? `Module ${lastCompletedMod.moduleNumber} (${lastCompletedMod.title})`
      : 'Building SIEM pipeline foundations';

    return `🔐 Building a SOC Detection Lab from Scratch

I'm building a hands-on enterprise security monitoring environment using:

• Elasticsearch
• Logstash
• Kibana
• Filebeat
• Suricata IDS
• Ubuntu Linux Server

The goal is not simply installing the tools. I'm building, testing, and troubleshooting the complete security telemetry pipeline:

Network Activity → Suricata IDS → eve.json → Filebeat → Logstash → Elasticsearch → Kibana → SOC Analyst Investigation

Progress Update:
✅ Completed ${totalCompletedModulesCount} / 10 Modules (${overallPercentage}% finished)
🎯 Currently Working On: ${currentFocus}
🏆 Current Certification Rank: ${currentRank}

Hands-on skills developed so far:
• Linux service management & socket auditing (ss -tulpn, systemd, journalctl)
• Logstash Grok pattern parsing & pipeline testing (--config.test_and_exit)
• Filebeat harvester offset tracking and backpressure handling
• Suricata network threat detection, rule tuning & eve.json analysis
• Kibana Query Language (KQL) threat hunting and visualization
• End-to-end incident triage: port scans, brute-force attacks, and web injections

#Cybersecurity #SOC #SIEM #BlueTeam #Suricata #ElasticStack #Linux #ThreatHunting #InfoSec`;
  };

  const generateProjectReadme = () => {
    return `# SOC Master Lab: Enterprise Security Monitoring & Threat Detection Platform

A complete, production-grade security operations center (SOC) monitoring and detection laboratory built from scratch on Ubuntu Server 22.04 LTS.

## 🏗️ End-to-End Telemetry Architecture

\`\`\`text
Network / Attack Traffic
          ↓
     Suricata IDS (AF_PACKET Promiscuous Sniffing)
          ↓
  /var/log/suricata/eve.json
          ↓
     Filebeat Agent (Registry Pointer & Lumberjack TCP)
          ↓
     Logstash Pipeline (TCP Port 5044 · Grok & JSON Filter)
          ↓
  Elasticsearch Cluster (HTTP REST 9200 · Inverted Indices)
          ↓
     Kibana UI (Port 5601 · Discover, Dashboards, KQL)
          ↓
   SOC Analyst Triage (Alert Validation & UFW Firewall Containment)
\`\`\`

---

## 🛠️ Technologies & Stack

* **Operating System**: Ubuntu Server 22.04 LTS
* **Packet Capture & IDS**: Suricata 7.x (AF_PACKET, Emerging Threats ET Open)
* **Log Harvesting**: Filebeat 8.x
* **ETL Pipeline**: Logstash 8.x (Java 17 JRE)
* **Search Engine**: Elasticsearch 8.x (Single-Node cluster)
* **Visualization Console**: Kibana 8.x (KQL, Dashboards)
* **Host Defense**: UFW Firewall, OpenSSH Hardening

---

## 🔌 Port & Service Matrix

| Component | Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **SSH** | 22 | TCP | Hardened Remote Host Administration |
| **Logstash Beats** | 5044 | TCP | Filebeat Ingestion Listener |
| **Kibana Web UI** | 5601 | HTTP | Web Analyst Dashboard Console |
| **Elasticsearch** | 9200 | HTTPS | Secure REST API & Document Search |
| **Elasticsearch Transport** | 9300 | TCP | Internal Node Clustering |
| **Suricata Sniffer** | N/A | Promiscuous | Raw Wire Inspection on \`${labVars.suricataInterface}\` |

---

## 🚨 Controlled Detection Scenarios

1. **Nmap SYN Stealth Port Scan**: Probing ports 21, 22, 80, 443, 3306, 9200; detected via Suricata SID 2009582.
2. **SSH Brute-Force Simulation**: Hydra automated password dictionary attack against port 22; correlated with \`/var/log/auth.log\`.
3. **Web Application SQL Injection**: Tautology \`' OR 1=1--\` payload decoded in HTTP URI query buffers.

---

## 🛡️ Security Hardening Implemented

* UFW default incoming deny policy active.
* Port 9200 strictly isolated from external networks.
* SSH root login disabled; key-based authentication enforced.
* Least privilege service accounts (\`kibana_system\`, \`elasticsearch\`, \`logstash\`).

---

## 📈 Author Progress & Portfolio Stats

* **Overall Modules Completed**: ${totalCompletedModulesCount} / 10 (${overallPercentage}%)
* **Current Qualification Level**: ${currentRank}
* **Challenges & Labs Verified**: ${Object.keys(progress.completedChallenges).length} Challenges Solved
* **Capstone Status**: ${progress.capstoneCompleted ? 'Completed & Incident Contained' : 'In Progress'}

---
*Built with SOC Master Lab Platform · Zero Synthetic Data · 100% Evidence-Based Verification*
`;
  };

  const handleCopyLinkedin = async () => {
    try {
      await navigator.clipboard.writeText(generateLinkedinPost());
      setCopiedLinkedin(true);
      setTimeout(() => setCopiedLinkedin(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCopyReadme = async () => {
    try {
      await navigator.clipboard.writeText(generateProjectReadme());
      setCopiedReadme(true);
      setTimeout(() => setCopiedReadme(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownloadReadme = () => {
    const element = document.createElement('a');
    const file = new Blob([generateProjectReadme()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const SKILLS = [
    'Linux System Administration (Ubuntu Server, systemd, journalctl)',
    'Network Socket Analysis & Port Auditing (ss -tulpn, netcat)',
    'Enterprise Log Aggregation & Shipper Queuing (Filebeat filestream)',
    'ETL Data Pipeline Engineering & Grok Transformation (Logstash)',
    'Distributed Search & Index Lifecycle Management (Elasticsearch)',
    'Network Intrusion Detection & Signature Tuning (Suricata IDS, EVE JSON)',
    'Security Information & Event Management (Kibana Discover, KQL)',
    'Adversary Emulation & Controlled Threat Detection (Nmap, SSH brute force)',
    'Incident Triage, Root Cause Isolation & Firewall Mitigation (UFW)',
  ];

  return (
    <div className="space-y-8 font-sans text-slate-200">
      {/* Header */}
      <div className="rounded-3xl bg-[#090D17] border border-purple-500/30 p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Award className="w-4 h-4" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
            PORTFOLIO & CAREER ASSETS
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          My SOC Lab: Professional Portfolio & Generators
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Showcase your hands-on engineering achievements. Export a complete GitHub README for your repository or generate a professional LinkedIn update highlighting your completed detection and troubleshooting labs.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 text-xs">
          {[
            { id: 'portfolio', label: '1. Portfolio Overview' },
            { id: 'linkedin', label: '2. Share My Progress (LinkedIn)' },
            { id: 'readme', label: '3. Generate GitHub README' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === t.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: PORTFOLIO OVERVIEW */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Candidate Rank</span>
              <div className="text-xl font-bold text-white font-mono">{currentRank}</div>
              <p className="text-[11px] text-purple-400">Level 3: SOC Detection</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Curriculum Progress</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">{overallPercentage}%</div>
              <p className="text-[11px] text-slate-400">{totalCompletedModulesCount} / 10 Modules Complete</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Hands-On Challenges</span>
              <div className="text-xl font-bold text-cyan-400 font-mono">
                {Object.keys(progress.completedChallenges).length} Solved
              </div>
              <p className="text-[11px] text-slate-400">Verified against live evidence</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Capstone Status</span>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {progress.capstoneCompleted ? 'COMPLETED' : `${progress.capstoneStageProgress} / 14 Stages`}
              </div>
              <p className="text-[11px] text-slate-400">{progress.capstoneCompleted ? 'Report Generated' : 'In Progress'}</p>
            </div>
          </div>

          {/* Skills Demonstrated */}
          <div className="p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Demonstrated Technical Competencies</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {SKILLS.map((skill, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="text-slate-300">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LINKEDIN SHARE GENERATOR */}
      {activeTab === 'linkedin' && (
        <div className="p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">LinkedIn Post Generator</span>
              <h3 className="font-bold text-base text-white">Dynamic Social Progress Update</h3>
              <p className="text-xs text-slate-400">Generated dynamically based on your actual completed modules.</p>
            </div>

            <button
              onClick={handleCopyLinkedin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-950/40"
            >
              {copiedLinkedin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLinkedin ? 'Post Copied to Clipboard!' : 'COPY LINKEDIN POST'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
            <strong>Privacy Note: </strong>This button copies the post to your clipboard. It does not automatically post anything to LinkedIn.
          </div>

          <pre className="p-5 rounded-2xl bg-[#05070B] border border-slate-800 text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
            {generateLinkedinPost()}
          </pre>
        </div>
      )}

      {/* VIEW 3: GITHUB README GENERATOR */}
      {activeTab === 'readme' && (
        <div className="p-6 rounded-3xl bg-[#080B12] border border-slate-800 space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Repository Asset</span>
              <h3 className="font-bold text-base text-white">Production GitHub README.md Generator</h3>
              <p className="text-xs text-slate-400">Exportable Markdown document documenting your complete SOC architecture.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReadme}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                {copiedReadme ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReadme ? 'Copied Markdown' : 'Copy README'}</span>
              </button>

              <button
                onClick={handleDownloadReadme}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-950/40"
              >
                <Download className="w-4 h-4" />
                <span>Download README.md</span>
              </button>
            </div>
          </div>

          <pre className="p-5 rounded-2xl bg-[#05070B] border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto scrollbar-thin">
            {generateProjectReadme()}
          </pre>
        </div>
      )}
    </div>
  );
};
