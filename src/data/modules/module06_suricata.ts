import { ModuleData } from '../../types/socMasterLab';

export const module06Suricata: ModuleData = {
  id: 'suricata',
  moduleNumber: '06',
  title: 'Suricata Network Threat Detection Engine',
  tagline: 'Install and tune the multi-threaded Network IDS engine, configure rule sets, and generate structured eve.json telemetry.',
  badge: 'Network IDS',
  level: 'Level 3: SOC Detection',
  estimatedMinutes: 60,
  overview: {
    whatIsIt:
      'Suricata is a high-performance, open-source Network Threat Detection, Intrusion Detection System (IDS), Intrusion Prevention System (IPS), and Network Security Monitoring (NSM) engine developed by the Open Information Security Foundation (OISF).',
    whyDoWeNeedIt:
      'Host logs alone (like syslog or Windows event logs) can be tampered with by an attacker who gains root. Suricata inspects raw network packets flowing across the wire in real time. It detects port scans, exploit payloads, malware command-and-control beacons, and TLS anomalies directly off the network interface before or during host compromise.',
    problemSolved:
      'Provides unalterable network visibility; generates rich Extensible Event Format (EVE) JSON logs for every network flow, HTTP transaction, DNS query, and triggered signature alert.',
    architectureRole:
      'Sits at the very front edge of the SOC pipeline, listening on the network interface (e.g., eth0 or ens33) in promiscuous mode. When suspicious traffic triggers a rule signature, Suricata writes a structured JSON record into /var/log/suricata/eve.json, which Filebeat immediately harvests.',
    diagramText: `[Network Traffic: Kali / External / Workstation]
                   │
                   ▼ (Raw Ethernet Packets on Promiscuous Interface: <INTERFACE>)
┌────────────────────────────────────────────────────────┐
│                  SURICATA IDS ENGINE                   │
│                                                        │
│  ├── Multi-Threaded Packet Capture (AF_PACKET)         │
│  ├── Protocol Parsers: IP / TCP / UDP / HTTP / TLS     │
│  ├── Signature Engine: Emerging Threats (ET Open Rules)│
│  └── Output Generator: EVE JSON (Extensible Event)     │
└────────────────────────────────────────────────────────┘
                   │
                   ▼ (Appends structured event lines)
[/var/log/suricata/eve.json] ──► [Filebeat] ──► [Logstash] ──► [Elasticsearch]`,
  },
  prerequisites: [
    'Completed Module 01 (Host networking, primary interface identified via "ip addr")',
    'Root or sudo privileges for raw socket promiscuous capture',
    'At least 2 GB RAM and 2 vCPUs dedicated to packet capture threads',
    'Internet connectivity to download Emerging Threats rule sets via suricata-update',
  ],
  importantPorts: [
    {
      component: 'Suricata Packet Sniffer',
      port: 'N/A (Raw Promiscuous Socket)',
      protocol: 'TCP',
      purpose: 'Does not listen on an open TCP port; instead binds to raw kernel AF_PACKET socket to sniff all wire traffic',
      configFile: '/etc/suricata/suricata.yaml',
      verificationCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
      troubleshootingCommands: [
        'sudo tail -f /var/log/suricata/eve.json',
        'sudo journalctl -u suricata -n 50 --no-pager',
      ],
      relatedComponents: ['Network Interface (<INTERFACE>)', 'eve.json', 'Filebeat'],
    },
  ],
  configurationFile: {
    path: '/etc/suricata/suricata.yaml',
    component: 'Suricata Core Engine Configuration',
    purpose: 'Defines protected home networks (HOME_NET), network capture interface, log outputs (eve-log), and rule file locations',
    whatItControls: 'vars.address-groups.HOME_NET, af-packet interface name, eve-log JSON types (alert, http, dns, tls), and default-rule-path',
    parameters: [
      { key: 'vars.address-groups.HOME_NET', value: '[192.168.1.0/24]', purpose: 'Subnet considered internal/protected. Alerts trigger on traffic crossing HOME_NET boundaries.', safeDefault: '[<SIEM_IP>/24]' },
      { key: 'vars.address-groups.EXTERNAL_NET', value: '!$HOME_NET', purpose: 'Everything outside HOME_NET', safeDefault: '!$HOME_NET' },
      { key: 'af-packet[0].interface', value: 'eth0', purpose: 'Physical/virtual network interface Suricata monitors', safeDefault: '<INTERFACE>' },
      { key: 'default-rule-path', value: '/var/lib/suricata/rules', purpose: 'Directory containing downloaded rule files', safeDefault: '/var/lib/suricata/rules' },
      { key: 'outputs[1].eve-log.enabled', value: 'yes', purpose: 'Enables structured EVE JSON output', safeDefault: 'yes' },
    ],
    safeSnippet: `# ========================= Suricata Core Configuration =========================
vars:
  address-groups:
    HOME_NET: "[<SIEM_IP>/24, 192.168.1.0/24]"
    EXTERNAL_NET: "!$HOME_NET"

default-rule-path: /var/lib/suricata/rules
rule-files:
  - suricata.rules

# Multi-queue raw packet capture
af-packet:
  - interface: <INTERFACE>
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes

# EVE JSON Logging Engine
outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: /var/log/suricata/eve.json
      types:
        - alert:
            payload: yes
            metadata: yes
        - http:
            extended: yes
        - dns
        - tls`,
    nanoCommand: 'sudo nano /etc/suricata/suricata.yaml',
    validationCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
    commonErrors: [
      'Specifying the wrong interface (e.g. eth0 instead of ens33) results in zero packet capture.',
      'Setting HOME_NET to "any" causes rules that distinguish inbound vs outbound to fail.',
      'Missing closing bracket in YAML causes suricata -T to abort.',
    ],
  },
  serviceManagement: {
    serviceName: 'suricata',
    startCommand: 'sudo systemctl start suricata',
    stopCommand: 'sudo systemctl stop suricata',
    restartCommand: 'sudo systemctl restart suricata',
    enableCommand: 'sudo systemctl enable suricata',
    statusCommand: 'sudo systemctl status suricata',
    logsCommand: 'sudo journalctl -u suricata -n 50 --no-pager',
    explanation:
      'Suricata manages high-speed packet capture worker threads. Whenever rules are updated via suricata-update or suricata.yaml is edited, test first with "suricata -T" before issuing "sudo systemctl restart suricata".',
  },
  installationSteps: [
    {
      id: 'sur-inst-1',
      command: 'sudo add-apt-repository -y ppa:oisf/suricata-stable && sudo apt update',
      description: 'Add the official OISF Suricata Stable PPA repository',
      whyThisCommand:
        'Ubuntu default universe repos contain older Suricata versions. The OISF stable PPA provides the latest 7.x release with optimized multithreading and current protocol decoders.',
      expectedOutput: `Repository: 'deb https://ppa.launchpadcontent.net/oisf/suricata-stable/ubuntu jammy main'
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 https://ppa.launchpadcontent.net/oisf/suricata-stable/ubuntu jammy InRelease [18.0 kB]
Reading package lists... Done`,
      whatOutputMeans: 'OISF official repository registered and indexed.',
      requiresSudo: true,
    },
    {
      id: 'sur-inst-2',
      command: 'sudo apt install -y suricata jq',
      description: 'Install Suricata engine and jq JSON command line parser',
      whyThisCommand:
        'Installs the Suricata binary, default configuration files, and "jq" which is invaluable for inspecting eve.json in the terminal.',
      expectedOutput: `Reading package lists... Done
The following NEW packages will be installed:
  suricata suricata-update jq
Unpacking suricata ...
Setting up suricata ...`,
      whatOutputMeans: 'Suricata and jq installed.',
      requiresSudo: true,
    },
    {
      id: 'sur-inst-3',
      command: 'sudo suricata-update',
      description: 'Download the latest Emerging Threats (ET Open) threat signatures',
      whyThisCommand:
        'Suricata requires up-to-date threat signatures to detect modern CVE exploits, cobalt strike beacons, malware user-agents, and port scans.',
      expectedOutput: `18/9/2026 -- 14:50:12 - <Info> -- Fetching https://rules.emergingthreats.net/open/suricata-7.0.3/emerging.rules.tar.gz...
18/9/2026 -- 14:50:15 - <Info> -- Done.
18/9/2026 -- 14:50:16 - <Info> -- Loading /var/lib/suricata/rules/suricata.rules: 42381 rules loaded.
18/9/2026 -- 14:50:18 - <Info> -- Writing rules to /var/lib/suricata/rules/suricata.rules: 42381 rules written.`,
      whatOutputMeans: 'Over 40,000 community threat rules downloaded and written to disk.',
      commonMistake: 'Running suricata-update without internet or behind an unconfigured proxy.',
      troubleshooting: 'Check DNS and outbound HTTPS connectivity.',
      requiresSudo: true,
    },
    {
      id: 'sur-inst-4',
      command: 'sudo nano /etc/suricata/suricata.yaml',
      description: 'Set HOME_NET and configure your actual network interface in af-packet',
      whyThisCommand:
        'Suricata must know your local subnet and which interface to attach its sniffing socket to.',
      expectedOutput: `(Nano editor opens /etc/suricata/suricata.yaml)`,
      whatOutputMeans: 'Configure HOME_NET to [<SIEM_IP>/24] and af-packet interface to <INTERFACE>.',
      commonMistake: 'Typing an interface that does not exist in "ip addr".',
      troubleshooting: 'Run "ip link" to verify exact interface spelling.',
      requiresSudo: true,
    },
    {
      id: 'sur-inst-5',
      command: 'sudo suricata -T -c /etc/suricata/suricata.yaml -v',
      description: 'Execute Suricata configuration and signature engine test mode',
      whyThisCommand:
        'Validates YAML syntax, verifies all 40,000+ rules compile cleanly, and confirms interface settings without dropping into background daemon mode.',
      expectedOutput: `18/9/2026 -- 14:52:01 - <Notice> - This is Suricata version 7.0.3 RELEASE running in SYSTEM mode
18/9/2026 -- 14:52:05 - <Info> - 1 rule files processed. 42381 rules successfully loaded.
18/9/2026 -- 14:52:06 - <Notice> - Configuration provided was successfully tested.`,
      whatOutputMeans: 'Suricata passed all syntax, interface, and rule checks! Safe to start.',
      commonMistake: 'Starting the service when suricata -T reports fatal errors.',
      troubleshooting: 'Read the specific error line output by suricata -T.',
      requiresSudo: true,
    },
    {
      id: 'sur-inst-6',
      command: 'sudo systemctl enable suricata && sudo systemctl restart suricata',
      description: 'Enable Suricata on system boot and start packet inspection',
      whyThisCommand:
        'Attaches the packet capture engine to your network interface in promiscuous mode.',
      expectedOutput: `Created symlink /etc/systemd/system/multi-user.target.wants/suricata.service → /lib/systemd/system/suricata.service.`,
      whatOutputMeans: 'Suricata is actively inspecting live wire traffic.',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'sur-v-1',
      command: 'sudo systemctl status suricata',
      description: 'Verify systemd status is active (running)',
      whyThisCommand: 'Validates worker threads are active and capturing.',
      expectedOutput: `● suricata.service - Suricata IDS/IDPS daemon
     Loaded: loaded (/lib/systemd/system/suricata.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:53:20 UTC; 40s ago
   Main PID: 7421 (Suricata-Main)`,
      whatOutputMeans: 'Suricata engine is running.',
    },
    {
      id: 'sur-v-2',
      command: 'sudo tail -n 10 /var/log/suricata/suricata.log',
      description: 'Inspect engine log to confirm interface bound and threads running',
      whyThisCommand: 'Checks internal packet acquisition metrics and interface link status.',
      expectedOutput: `[7421] <Info> - all 4 packet processing threads, 2 management threads initialized, engine started.`,
      whatOutputMeans: 'Packet processing threads are online.',
    },
    {
      id: 'sur-v-3',
      command: 'sudo test -f /var/log/suricata/eve.json && echo "eve.json exists and is ready"',
      description: 'Confirm eve.json output file exists on disk',
      whyThisCommand: 'Filebeat needs this file path to harvest security alerts.',
      expectedOutput: `eve.json exists and is ready`,
      whatOutputMeans: 'Log file initialized.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/suricata/',
    inspectionCommands: [
      {
        id: 'sur-log-1',
        command: 'sudo tail -f /var/log/suricata/eve.json | jq .',
        description: 'Live-stream formatted JSON events as they trigger in real time',
        whyThisCommand: 'Enables analysts to watch packet flows, DNS lookups, and alerts fire instantly.',
      },
      {
        id: 'sur-log-2',
        command: 'sudo cat /var/log/suricata/fast.log',
        description: 'View legacy single-line alert summaries',
        whyThisCommand: 'Quick, human-readable alert log showing timestamp, signature, and IPs.',
      },
      {
        id: 'sur-log-3',
        command: 'sudo tail -n 50 /var/log/suricata/suricata.log',
        description: 'View internal engine diagnostic and performance logs',
        whyThisCommand: 'Checks packet drop ratios, invalid checksums, and memory usage.',
      },
    ],
    keyLogPatterns: [
      { pattern: '"event_type":"alert"', meaning: 'A packet triggered a security signature rule.' },
      { pattern: '"event_type":"http"', meaning: 'An HTTP web request was decoded.' },
      { pattern: '"event_type":"dns"', meaning: 'A DNS query/response was observed on the wire.' },
    ],
  },
  commonErrors: [
    {
      id: 'sur-err-1',
      title: 'Error 1 — Configuration Test Failure (suricata -T Failure)',
      symptom: 'suricata -T fails with: "<Error> - [ERRCODE: SC_ERR_INVALID_YAML_CONF(14)] - Failed to parse configuration file".',
      whyItHappens: 'YAML indentation error or misplaced colon in /etc/suricata/suricata.yaml.',
      howToIdentify: 'Run suricata -T with verbose flag.',
      diagnosticCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml -v',
      expectedErrorOutput: '<Error> - Failed to parse configuration file: mapping values are not allowed here in line 45, column 15',
      fixExplanation: 'Open /etc/suricata/suricata.yaml, locate the line reported, and fix the YAML indentation.',
      fixCommand: 'sudo nano /etc/suricata/suricata.yaml',
      verificationCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
      verificationOutput: 'Configuration provided was successfully tested.',
    },
    {
      id: 'sur-err-2',
      title: 'Error 2 — Wrong Interface Specified (No Packets Captured)',
      symptom: 'Suricata runs, but eve.json is 0 bytes and no alerts are ever generated despite network attacks.',
      whyItHappens: 'af-packet is configured for "eth0" but the system interface is actually "ens33" or "enp0s3".',
      howToIdentify: 'Compare configured interface against ip link output.',
      diagnosticCommand: 'ip -brief link show && grep -A 5 "af-packet:" /etc/suricata/suricata.yaml',
      expectedErrorOutput: 'Config shows "interface: eth0" but ip link shows only "ens33".',
      fixExplanation: 'Update /etc/suricata/suricata.yaml with the exact interface name shown in ip link.',
      fixCommand: 'sudo sed -i \'s/interface: eth0/interface: <INTERFACE>/\' /etc/suricata/suricata.yaml && sudo systemctl restart suricata',
      verificationCommand: 'sudo tail -n 20 /var/log/suricata/suricata.log',
      verificationOutput: 'af-packet: <INTERFACE>: opening interface',
    },
    {
      id: 'sur-err-3',
      title: 'Error 3 — Missing Rule Files (Rule Loading Abort)',
      symptom: 'Suricata log shows: "Unable to open rule file /var/lib/suricata/rules/suricata.rules: No such file".',
      whyItHappens: 'suricata-update was never run after initial package installation.',
      howToIdentify: 'Check if rule file exists.',
      diagnosticCommand: 'ls -lh /var/lib/suricata/rules/suricata.rules',
      expectedErrorOutput: 'ls: cannot access \'/var/lib/suricata/rules/suricata.rules\': No such file or directory',
      fixExplanation: 'Execute suricata-update to fetch community rule sets.',
      fixCommand: 'sudo suricata-update',
      verificationCommand: 'ls -lh /var/lib/suricata/rules/suricata.rules',
      verificationOutput: '-rw-r--r-- 1 root root ... suricata.rules',
    },
    {
      id: 'sur-err-4',
      title: 'Error 4 — Permission Problems on /var/log/suricata/',
      symptom: 'Filebeat or analyst cannot read eve.json: "Permission denied".',
      whyItHappens: 'Suricata default umask wrote /var/log/suricata with 0700 permissions owned by root.',
      howToIdentify: 'Check directory permissions.',
      diagnosticCommand: 'ls -ld /var/log/suricata && ls -l /var/log/suricata/eve.json',
      expectedErrorOutput: 'drwx------ 2 root root 4096 /var/log/suricata',
      fixExplanation: 'Add read permissions for group and others so Filebeat can harvest events.',
      fixCommand: 'sudo chmod 755 /var/log/suricata && sudo chmod 644 /var/log/suricata/eve.json',
      verificationCommand: 'ls -ld /var/log/suricata',
      verificationOutput: 'drwxr-xr-x',
    },
    {
      id: 'sur-err-5',
      title: 'Error 5 — Rule Update HTTPS Connection Failure',
      symptom: 'suricata-update fails with: "URLError: <urlopen error [Errno -3] Temporary failure in name resolution>".',
      whyItHappens: 'DNS resolution failure prevents downloading rule tarballs.',
      howToIdentify: 'Test DNS lookup for rules.emergingthreats.net.',
      diagnosticCommand: 'ping -c 2 rules.emergingthreats.net',
      expectedErrorOutput: 'ping: rules.emergingthreats.net: Name or service not known',
      fixExplanation: 'Check /etc/resolv.conf and add a reliable nameserver like 1.1.1.1 or 8.8.8.8.',
      fixCommand: 'echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf',
      verificationCommand: 'sudo suricata-update',
      verificationOutput: 'Done. 42381 rules written.',
    },
    {
      id: 'sur-err-6',
      title: 'Error 6 — Promiscuous Mode Kernel Capture Drops',
      symptom: 'Suricata logs high packet drop rates in /var/log/suricata/suricata.log.',
      whyItHappens: 'Interface buffer rings are too small for high-traffic throughput.',
      howToIdentify: 'Inspect packet drop metrics in stats.log.',
      diagnosticCommand: 'sudo grep -i "drop" /var/log/suricata/stats.log | tail -n 5',
      expectedErrorOutput: 'capture.kernel_drops | Total | 14820',
      fixExplanation: 'Enable ring buffer offloading and increase ring buffer sizes with ethtool.',
      fixCommand: 'sudo ethtool -K <INTERFACE> rx off tx off tso off gso off gro off',
      verificationCommand: 'sudo ethtool -k <INTERFACE> | grep -E "generic-receive-offload"',
      verificationOutput: 'generic-receive-offload: off',
    },
    {
      id: 'sur-err-7',
      title: 'Error 7 — Custom Rule Syntax Error',
      symptom: 'suricata -T reports: "error parsing signature: unknown keyword \'clss-type\'".',
      whyItHappens: 'Typo in a custom rule definition in /etc/suricata/rules/local.rules.',
      howToIdentify: 'Inspect suricata -T output.',
      diagnosticCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml 2>&1 | grep -i "error parsing signature"',
      expectedErrorOutput: 'error parsing signature: unknown keyword \'clss-type\' at /etc/suricata/rules/local.rules:1',
      fixExplanation: 'Correct the spelling to "classtype" in your local rule.',
      fixCommand: 'sudo sed -i \'s/clss-type/classtype/g\' /etc/suricata/rules/local.rules',
      verificationCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
      verificationOutput: 'Configuration provided was successfully tested.',
    },
    {
      id: 'sur-err-8',
      title: 'Error 8 — Corrupted eve.json Lockfile or Descriptor',
      symptom: 'Suricata crashes with "Failed to open output file: /var/log/suricata/eve.json".',
      whyItHappens: 'Disk filled up or another process locked the file descriptor.',
      howToIdentify: 'Check disk space and open handles.',
      diagnosticCommand: 'sudo lsof /var/log/suricata/eve.json',
      expectedErrorOutput: 'Lists conflicting process or indicates disk quota exceeded.',
      fixExplanation: 'Rotate the log or create a fresh eve.json with proper permissions.',
      fixCommand: 'sudo mv /var/log/suricata/eve.json /var/log/suricata/eve.json.bak && sudo touch /var/log/suricata/eve.json && sudo chmod 644 /var/log/suricata/eve.json && sudo systemctl restart suricata',
      verificationCommand: 'sudo systemctl status suricata',
      verificationOutput: 'Active: active (running)',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-6-1',
      number: '6.1',
      title: 'Write a Custom ICMP Detection Signature',
      objective: 'Create a local rule in /etc/suricata/rules/local.rules to detect ping requests.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Create local rule file with an ICMP detection signature.',
          command: `sudo mkdir -p /etc/suricata/rules && echo 'alert icmp any any -> $HOME_NET any (msg:"SOC LAB - Inbound ICMP Ping Echo Request Detected"; itype:8; sid:1000001; rev:1;)' | sudo tee /etc/suricata/rules/local.rules`,
          why: 'Defines a custom signature matching ICMP type 8 (echo request).',
          expectedResult: 'Rule written to local.rules.',
        },
        {
          stepNumber: 2,
          instruction: 'Include local.rules in /etc/suricata/suricata.yaml under rule-files.',
          command: 'grep "local.rules" /etc/suricata/suricata.yaml || echo "  - /etc/suricata/rules/local.rules" | sudo tee -a /etc/suricata/suricata.yaml',
          why: 'Tells Suricata to load our custom rule alongside Emerging Threats.',
          expectedResult: 'Rule added to configuration.',
        },
        {
          stepNumber: 3,
          instruction: 'Test configuration and restart Suricata.',
          command: 'sudo suricata -T -c /etc/suricata/suricata.yaml && sudo systemctl restart suricata',
          why: 'Loads the new signature into the live inspection engine.',
          expectedResult: 'Configuration tested OK and service restarted.',
        },
      ],
      verificationPrompt: 'Did suricata -T confirm the custom rule loaded without errors?',
      expectedVerification: 'Configuration provided was successfully tested.',
    },
    {
      id: 'lab-6-2',
      number: '6.2',
      title: 'Generate an Alert and Inspect eve.json Live',
      objective: 'Send an ICMP ping from Kali and watch the resulting alert trigger in eve.json.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'In one terminal on SIEM, tail eve.json filtered for alerts.',
          command: 'sudo tail -f /var/log/suricata/eve.json | jq \'select(.event_type=="alert")\'',
          why: 'Streams real-time alerts as they trigger.',
          expectedResult: 'Awaiting events...',
        },
        {
          stepNumber: 2,
          instruction: 'From Kali (or your workstation), ping the SIEM server IP.',
          command: 'ping -c 3 <SIEM_IP>',
          why: 'Generates ICMP type 8 packets across the network wire.',
          expectedResult: '3 packets transmitted, 3 received.',
        },
        {
          stepNumber: 3,
          instruction: 'Inspect the captured event in eve.json on the SIEM server.',
          command: 'sudo grep "1000001" /var/log/suricata/eve.json | tail -n 1 | jq .',
          why: 'Examines the exact fields parsed by Suricata.',
          expectedResult: 'JSON object displaying signature "SOC LAB - Inbound ICMP Ping Echo Request Detected".',
        },
      ],
      verificationPrompt: 'Did eve.json record the ICMP alert with sid:1000001?',
      expectedVerification: 'Yes, alert JSON with signature and source/destination IP logged.',
    },
  ],
  challenges: [
    {
      id: 'chal-6-1',
      title: 'Suricata Configuration Test Command',
      scenario: 'You edited /etc/suricata/suricata.yaml and need to test it before restarting the daemon.',
      question: 'What is the exact Suricata flag used to test configuration files (-T)?',
      hint: 'Combine: sudo suricata -T -c <path>',
      acceptedAnswers: ['suricata -T', 'sudo suricata -T', 'sudo suricata -T -c /etc/suricata/suricata.yaml', 'suricata -t'],
      correctExplanation: '"sudo suricata -T -c /etc/suricata/suricata.yaml" tests syntax and signature compilation.',
      troubleshootingTip: 'Use -T whenever modifying rules.',
      commandSuggestion: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
    },
    {
      id: 'chal-6-2',
      title: 'Primary Suricata JSON Telemetry Log',
      scenario: 'You are configuring Filebeat to ingest Suricata logs.',
      question: 'What is the full absolute file path to Suricata\'s primary EVE JSON log file?',
      hint: 'Located in /var/log/suricata/...',
      acceptedAnswers: ['/var/log/suricata/eve.json', 'eve.json', '/var/log/suricata/eve.json '],
      correctExplanation: '/var/log/suricata/eve.json contains all alert, flow, DNS, and HTTP JSON records generated by Suricata.',
      troubleshootingTip: 'Tailed by Filebeat to feed the pipeline.',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-6-1',
      question: 'What is the primary difference between an Intrusion Detection System (IDS) and an Intrusion Prevention System (IPS)?',
      options: [
        'An IDS operates on Windows; an IPS operates on Linux.',
        'An IDS monitors and alerts on network traffic passively without dropping packets; an IPS sits inline and actively drops or blocks malicious packets in real time.',
        'An IDS uses machine learning; an IPS uses signatures.',
        'An IDS detects hardware failures; an IPS detects software bugs.',
      ],
      correctIndex: 1,
      explanation: 'IDS is passive (sniffs a tap or span port and generates alerts without impacting network flow). IPS is active/inline (packets pass through Suricata queues like NFQUEUE, allowing it to drop packets).',
    },
    {
      id: 'quiz-6-2',
      question: 'What is the purpose of the "HOME_NET" variable in /etc/suricata/suricata.yaml?',
      options: [
        'It specifies the home folder path of the root user.',
        'It defines the protected internal IP ranges of your organization, enabling signatures to distinguish between inbound attacks, outbound exfiltration, and internal lateral movement.',
        'It sets the default web page for Kibana.',
        'It configures DHCP leases.',
      ],
      correctIndex: 1,
      explanation: 'HOME_NET tells the signature engine which IPs belong to your internal infrastructure. A signature like "alert tcp $EXTERNAL_NET any -> $HOME_NET 22" will only trigger when an external host targets your internal server.',
    },
  ],
  interviewQuestions: [
    {
      question: 'Explain the structure of a Suricata rule signature.',
      modelAnswer:
        'A Suricata rule consists of two parts: 1) The Rule Header: action (alert, drop, pass), protocol (tcp, udp, icmp, http), source IP/port ($EXTERNAL_NET any), direction arrow (->), and destination IP/port ($HOME_NET 80). 2) The Rule Options (inside parentheses): metadata key-value pairs such as msg ("Descriptive alert text"), sid (unique Signature ID), rev (revision number), classtype (attack classification), content (byte or string patterns to search for in payload), and nocase/depth/offset modifiers.',
      keyPoints: ['Header: action, protocol, source, direction, destination', 'Options: msg, sid, rev, classtype', 'Payload matching: content, pcre, flow, threshold'],
    },
    {
      question: 'Why is EVE JSON preferred over fast.log for modern SIEM ingestion?',
      modelAnswer:
        'fast.log is a legacy flat-text log format designed for human reading in a terminal. It requires brittle regex parsing to extract fields and drops critical metadata. In contrast, eve.json (Extensible Event Format) outputs fully structured, machine-readable JSON for every event. It natively preserves nested objects for IP addresses, TCP flags, application layer payloads (HTTP headers, DNS queries, TLS SNI certificates), flow metrics, and packet payloads, allowing direct schema-less ingestion into Elasticsearch without grok failures.',
      keyPoints: ['fast.log is unstructured flat text', 'eve.json is machine-readable JSON', 'Includes rich L7 application metadata (HTTP, DNS, TLS)', 'Direct compatibility with Filebeat and Elastic Common Schema (ECS)'],
    },
  ],
  checklist: [
    { id: 'chk-6-1', label: 'Suricata package and jq installed', verifyCommand: 'dpkg -l | grep suricata' },
    { id: 'chk-6-2', label: 'Emerging Threats signatures updated with suricata-update', verifyCommand: 'test -f /var/lib/suricata/rules/suricata.rules && echo "RULES_LOADED"' },
    { id: 'chk-6-3', label: 'HOME_NET and active interface configured in suricata.yaml', verifyCommand: 'sudo grep -E "HOME_NET|interface:" /etc/suricata/suricata.yaml' },
    { id: 'chk-6-4', label: 'Configuration test passed with "suricata -T"', verifyCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml' },
    { id: 'chk-6-5', label: 'Suricata service active (running)', verifyCommand: 'sudo systemctl is-active suricata' },
    { id: 'chk-6-6', label: 'eve.json log generated and verified with jq', verifyCommand: 'sudo test -s /var/log/suricata/eve.json && echo "EVE_OK"' },
  ],
};
