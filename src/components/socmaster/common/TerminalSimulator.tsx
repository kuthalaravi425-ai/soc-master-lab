import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Trash2, Info, ChevronRight, CornerDownLeft } from 'lucide-react';
import { useSocMasterLab } from '../../../context/SocMasterLabContext';

interface CommandOutput {
  id: string;
  command: string;
  stdout: string;
  isError?: boolean;
}

export const TerminalSimulator: React.FC = () => {
  const { isTerminalModalOpen, setIsTerminalModalOpen, terminalInitialCommand, labVars, interpolate } = useSocMasterLab();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [executedCommands, setExecutedCommands] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isTerminalModalOpen) {
      if (terminalInitialCommand) {
        setInput(terminalInitialCommand);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isTerminalModalOpen, terminalInitialCommand]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isTerminalModalOpen) return null;

  const SUGGESTIONS = [
    'sudo systemctl status elasticsearch',
    'curl -k -u elastic:pass https://localhost:9200',
    'sudo ss -tulpn',
    'sudo systemctl status logstash',
    'sudo ss -tulpn | grep 5044',
    'sudo systemctl status kibana',
    'curl -I http://localhost:5601/api/status',
    'sudo filebeat test output',
    'sudo suricata -T -c /etc/suricata/suricata.yaml',
    'sudo tail -n 5 /var/log/suricata/eve.json',
    'sudo ufw status verbose',
    'df -h && free -h',
    'help',
    'clear',
  ];

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    setExecutedCommands(prev => [...prev, trimmed]);
    setCommandIndex(-1);

    if (trimmed === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (trimmed === 'help') {
      setHistory(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          command: trimmed,
          stdout: `Available Educational Simulated Commands:
  • Service checks:  sudo systemctl status (elasticsearch | logstash | kibana | filebeat | suricata)
  • Sockets:         sudo ss -tulpn, sudo ss -tulpn | grep (9200 | 5044 | 5601)
  • REST API:        curl -k -u elastic:pass https://localhost:9200, curl -I http://localhost:5601/api/status
  • Pipeline tests:  sudo filebeat test config, sudo filebeat test output
  • IDS inspection:  sudo suricata -T, sudo tail -n 5 /var/log/suricata/eve.json
  • Network & Host:  ip addr, ip route, df -h, free -h, java -version
  • Firewall:        sudo ufw status verbose
  • Screen:          clear`,
        },
      ]);
      setInput('');
      return;
    }

    let output = '';
    const cleanCmd = trimmed.toLowerCase();

    if (cleanCmd.includes('systemctl status elasticsearch')) {
      output = `● elasticsearch.service - Elasticsearch
     Loaded: loaded (/lib/systemd/system/elasticsearch.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:02:11 UTC; 18min ago
   Main PID: 3412 (java)
      Tasks: 65 (limit: 9485)
     Memory: 2.1G (heap: 1.2G)
        CPU: 24.12s
     CGroup: /system.slice/elasticsearch.service
             └─3412 /usr/share/elasticsearch/jdk/bin/java -Xms2g -Xmx2g ...`;
    } else if (cleanCmd.includes('systemctl status logstash')) {
      output = `● logstash.service - logstash
     Loaded: loaded (/lib/systemd/system/logstash.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:18:22 UTC; 12min ago
   Main PID: 4521 (java)
      Tasks: 42
     Memory: 1.1G`;
    } else if (cleanCmd.includes('systemctl status kibana')) {
      output = `● kibana.service - Kibana
     Loaded: loaded (/lib/systemd/system/kibana.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:30:15 UTC; 8min ago
   Main PID: 5612 (node)
      Tasks: 11
     Memory: 480M`;
    } else if (cleanCmd.includes('systemctl status filebeat')) {
      output = `● filebeat.service - Filebeat - lightweight shipper for logs
     Loaded: loaded (/lib/systemd/system/filebeat.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:42:10 UTC; 5min ago
   Main PID: 6114 (filebeat)
     Memory: 38M`;
    } else if (cleanCmd.includes('systemctl status suricata')) {
      output = `● suricata.service - Suricata IDS/IDPS daemon
     Loaded: loaded (/lib/systemd/system/suricata.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:53:20 UTC; 3min ago
   Main PID: 7421 (Suricata-Main)
     Memory: 412M`;
    } else if (cleanCmd.includes('localhost:9200') || cleanCmd.includes(':9200')) {
      output = `{\n  "name" : "soc-siem-node01",\n  "cluster_name" : "soc-master-lab",\n  "cluster_uuid" : "v8yq7g9sTaCG1b4oP9K_Aw",\n  "version" : {\n    "number" : "8.12.2",\n    "lucene_version" : "9.9.2"\n  },\n  "tagline" : "You Know, for Search"\n}`;
    } else if (cleanCmd.includes('localhost:5601') || cleanCmd.includes(':5601')) {
      output = `HTTP/1.1 302 Found\nlocation: /login?nextUrl=%2Fapi%2Fstatus\nkbn-name: kibana\ncontent-length: 0`;
    } else if (cleanCmd.includes('filebeat test output')) {
      output = `logstash: localhost:5044...\n  connection...\n    parse host... OK\n    dns lookup... OK\n    addresses: 127.0.0.1\n    telnet connect... OK\n  talk to host... OK`;
    } else if (cleanCmd.includes('filebeat test config')) {
      output = `Config OK`;
    } else if (cleanCmd.includes('suricata -t') || cleanCmd.includes('suricata -t -c')) {
      output = `18/9/2026 -- 14:52:01 - <Notice> - This is Suricata version 7.0.3 RELEASE running in SYSTEM mode\n18/9/2026 -- 14:52:05 - <Info> - 1 rule files processed. 42381 rules successfully loaded.\n18/9/2026 -- 14:52:06 - <Notice> - Configuration provided was successfully tested.`;
    } else if (cleanCmd.includes('ss -tulpn | grep 9200')) {
      output = `tcp   LISTEN 0      4096         0.0.0.0:9200       0.0.0.0:*    users:(("java",pid=3412,fd=346))`;
    } else if (cleanCmd.includes('ss -tulpn | grep 5044')) {
      output = `tcp   LISTEN 0      128          0.0.0.0:5044       0.0.0.0:*    users:(("java",pid=4521,fd=102))`;
    } else if (cleanCmd.includes('ss -tulpn | grep 5601')) {
      output = `tcp   LISTEN 0      511          0.0.0.0:5601       0.0.0.0:*    users:(("node",pid=5612,fd=18))`;
    } else if (cleanCmd.includes('ss -tulpn')) {
      output = `Netid  State   Local Address:Port   Peer Address:Port  Process
tcp    LISTEN  0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=842))
tcp    LISTEN  0.0.0.0:5044         0.0.0.0:*          users:(("java",pid=4521))
tcp    LISTEN  0.0.0.0:5601         0.0.0.0:*          users:(("node",pid=5612))
tcp    LISTEN  0.0.0.0:9200         0.0.0.0:*          users:(("java",pid=3412))`;
    } else if (cleanCmd.includes('ufw status')) {
      output = `Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp (SSH Remote Admin)  ALLOW IN    Anywhere
5601/tcp (Kibana Web UI)   ALLOW IN    Anywhere
5044/tcp (Logstash Beats)  ALLOW IN    Anywhere`;
    } else if (cleanCmd.includes('tail') && cleanCmd.includes('eve.json')) {
      output = `{"timestamp":"2026-09-18T14:58:12.102Z","flow_id":19842109,"event_type":"alert","src_ip":"${labVars.kaliIp}","dest_ip":"${labVars.siemIp}","dest_port":22,"proto":"TCP","alert":{"action":"allowed","signature":"ET SCAN Potential Nmap SYN Scan to Critical Ports","severity":2}}`;
    } else if (cleanCmd.includes('ip addr') || cleanCmd.includes('ip a')) {
      output = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    inet 127.0.0.1/8 scope host lo
2: ${labVars.suricataInterface}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    inet ${labVars.siemIp}/24 brd 192.168.1.255 scope global ${labVars.suricataInterface}`;
    } else if (cleanCmd.includes('ip route') || cleanCmd.includes('ip r')) {
      output = `default via 192.168.1.1 dev ${labVars.suricataInterface} proto static\n192.168.1.0/24 dev ${labVars.suricataInterface} proto kernel scope link src ${labVars.siemIp}`;
    } else if (cleanCmd.includes('df -h') || cleanCmd.includes('free -h')) {
      output = `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G  9.8G   38G  21% /\n               total        used        free      available\nMem:           7.7Gi       3.8Gi       2.4Gi       3.9Gi`;
    } else if (cleanCmd.includes('java -version')) {
      output = `openjdk version "17.0.10" 2024-01-16\nOpenJDK Runtime Environment (build 17.0.10+7-Ubuntu-122.04.1)\nOpenJDK 64-Bit Server VM (build 17.0.10+7-Ubuntu-122.04.1, mixed mode, sharing)`;
    } else if (cleanCmd.includes('nmap')) {
      output = `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for ${labVars.siemIp}\nPORT     STATE SERVICE\n22/tcp   open  ssh\n5044/tcp open  lumberjack\n5601/tcp open  esmagent\n9200/tcp open  wap-wsp\nNmap done: 1 IP address (1 host up) scanned in 0.38 seconds`;
    } else {
      output = `[Simulation Engine] Executed: "${trimmed}"\nCommand executed safely in simulation environment. Type "help" to see recognized commands.`;
    }

    setHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        command: trimmed,
        stdout: output,
      },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      if (executedCommands.length > 0) {
        const nextIdx = commandIndex === -1 ? executedCommands.length - 1 : Math.max(0, commandIndex - 1);
        setCommandIndex(nextIdx);
        setInput(executedCommands[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (commandIndex !== -1) {
        const nextIdx = commandIndex + 1;
        if (nextIdx >= executedCommands.length) {
          setCommandIndex(-1);
          setInput('');
        } else {
          setCommandIndex(nextIdx);
          setInput(executedCommands[nextIdx]);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`relative flex flex-col rounded-2xl bg-[#06080E] border border-slate-700 shadow-2xl overflow-hidden font-mono transition-all ${
          isFullScreen ? 'w-full h-full' : 'w-full max-w-4xl h-[650px]'
        }`}
      >
        {/* Terminal Titlebar */}
        <div className="px-4 py-2.5 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">ubuntu@siem-master-lab: ~ (Simulated Terminal)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistory([])}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Clear terminal screen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Toggle full screen"
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsTerminalModalOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs"
              title="Close terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Disclaimer Strip */}
        <div className="px-4 py-1.5 bg-amber-950/20 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300 font-sans">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Simulation Mode:</strong> This terminal executes inside your browser and does NOT modify your real host.
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Type "help" for commands</span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#090D15] border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 text-[11px] scrollbar-thin">
          <span className="text-slate-500 shrink-0 font-sans">Quick:</span>
          {SUGGESTIONS.slice(0, 6).map((cmd, i) => (
            <button
              key={i}
              onClick={() => executeCommand(cmd)}
              className="px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 border border-slate-700/60 transition"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Terminal Body */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 overflow-y-auto space-y-3 text-xs text-slate-300 bg-[#05070B] cursor-text"
        >
          <div className="text-slate-500">
            Welcome to the SOC Master Lab Interactive Terminal Simulator (Ubuntu 22.04 LTS).<br />
            Configured host IP: <span className="text-cyan-400">{labVars.siemIp}</span> | Attacker IP: <span className="text-red-400">{labVars.kaliIp}</span><br />
            Type <span className="text-emerald-400 font-bold">help</span> to view sample commands or click "Simulate" on any lesson command.
          </div>

          {history.map(item => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-cyan-400 font-bold">ubuntu@siem:~$</span>
                <span className="text-white font-semibold">{item.command}</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap font-mono pl-4 border-l border-slate-800 leading-relaxed text-[11px]">
                {item.stdout}
              </pre>
            </div>
          ))}

          {/* Active input row */}
          <div className="flex items-center gap-2 text-emerald-400 pt-1">
            <span className="text-cyan-400 font-bold shrink-0">ubuntu@siem:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none border-none font-mono text-xs caret-emerald-400"
              placeholder="Type command here (e.g. sudo systemctl status elasticsearch)..."
              autoFocus
            />
            <button
              onClick={() => executeCommand(input)}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Submit command"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
