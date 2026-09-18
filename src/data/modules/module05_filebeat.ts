import { ModuleData } from '../../types/socMasterLab';

export const module05Filebeat: ModuleData = {
  id: 'filebeat',
  moduleNumber: '05',
  title: 'Filebeat Lightweight Log Shipper',
  tagline: 'Configure the lightning-fast Golang agent that harvests Suricata eve.json alerts and streams them into the ingest pipeline.',
  badge: 'Log Shipper',
  level: 'Level 2: SIEM Stack',
  estimatedMinutes: 45,
  overview: {
    whatIsIt:
      'Filebeat is an ultra-lightweight, open-source shipper for log files written in Go. Installed directly on the host or edge endpoints, Filebeat monitors specified log files (like /var/log/suricata/eve.json), tracks file pointers (in its data registry), and reliably forwards new events.',
    whyDoWeNeedIt:
      'Log generation tools (like Suricata or Linux syslog) write events to disk files. If a parser crashes or the network drops, writing directly over the network causes packet loss. Filebeat tail-reads the files on disk, retains an exact offset pointer, and guarantees at-least-once delivery with automatic backoff when downstream processors are busy.',
    problemSolved:
      'Prevents log loss during network interruptions; consumes minuscule CPU/memory compared to Java agents (<50MB RAM); handles log rotations automatically; and supports both direct Elasticsearch indexing and intermediate Logstash routing.',
    architectureRole:
      'Acts as the log harvester on the server, tailing /var/log/suricata/eve.json and pushing JSON batches over TCP port 5044 to Logstash (or directly to port 9200 of Elasticsearch).',
    diagramText: `[Suricata IDS Engine]
         │ (Appends raw JSON alerts)
         ▼
[/var/log/suricata/eve.json on Disk]
         │
         ▼ (Tails via inotify & maintains registry offset)
┌────────────────────────────────────────────────────────┐
│                     FILEBEAT AGENT                     │
│                                                        │
│  [Input: filestream]                                   │
│    paths: ["/var/log/suricata/eve.json"]               │
│                                                        │
│  [Output Choice A: Logstash]                           │
│    hosts: ["<SIEM_IP>:5044"]                           │
│                                                        │
│  [Output Choice B: Elasticsearch Direct]               │
│    hosts: ["<SIEM_IP>:9200"]                           │
└────────────────────────────────────────────────────────┘
         │
         ▼ (TCP Port 5044 or HTTP 9200)
[Logstash / Elasticsearch]`,
  },
  prerequisites: [
    'Completed Module 02 (Elasticsearch running) or Module 03 (Logstash listening on 5044)',
    'Suricata installed (or ready to monitor /var/log/suricata/eve.json)',
    'Root or sudo privileges to read /var/log/ files',
  ],
  importantPorts: [
    {
      component: 'Filebeat Egress Connection',
      port: 5044,
      protocol: 'TCP',
      purpose: 'Outbound TCP client connection to Logstash Beats receiver (or 9200 to Elasticsearch)',
      configFile: '/etc/filebeat/filebeat.yml',
      verificationCommand: 'sudo filebeat test output',
      troubleshootingCommands: [
        'nc -zv localhost 5044',
        'sudo journalctl -u filebeat -n 50 --no-pager',
      ],
      relatedComponents: ['Logstash', 'Elasticsearch'],
    },
  ],
  configurationFile: {
    path: '/etc/filebeat/filebeat.yml',
    component: 'Filebeat Main Agent Configuration',
    purpose: 'Defines input log harvesters, target file paths, and output destinations (Logstash or Elasticsearch)',
    whatItControls: 'File paths to tail, multiline rules, encoding, output.logstash or output.elasticsearch blocks',
    parameters: [
      { key: 'filebeat.inputs.type', value: 'filestream', purpose: 'Modern high-performance file harvester engine (replaces legacy "log" type)', safeDefault: 'filestream' },
      { key: 'filebeat.inputs.paths', value: '["/var/log/suricata/eve.json"]', purpose: 'Array of file glob paths to tail', safeDefault: '["/var/log/suricata/eve.json"]' },
      { key: 'output.logstash.hosts', value: '["localhost:5044"]', purpose: 'Destination Logstash server host:port', safeDefault: '["localhost:5044"]' },
      { key: 'output.elasticsearch.hosts', value: '["http://localhost:9200"]', purpose: 'Alternative direct Elasticsearch endpoint', safeDefault: '["http://localhost:9200"]' },
    ],
    safeSnippet: `# ============================== Filebeat Configuration ==============================
filebeat.inputs:
- type: filestream
  id: suricata-eve-stream
  enabled: true
  paths:
    - /var/log/suricata/eve.json
  # Tag incoming events for identification in SIEM
  fields:
    log_type: suricata
  fields_under_root: true

# ------------------------------ Logstash Output ------------------------------
output.logstash:
  hosts: ["localhost:5044"]

# --------------------------- Elasticsearch Output ----------------------------
# (Leave commented out when routing through Logstash)
# output.elasticsearch:
#   hosts: ["http://localhost:9200"]
#   username: "elastic"
#   password: "YOUR_PASSWORD"`,
    nanoCommand: 'sudo nano /etc/filebeat/filebeat.yml',
    validationCommand: 'sudo filebeat test config',
    commonErrors: [
      'YAML Indentation Error: Having both output.logstash and output.elasticsearch enabled simultaneously causes Filebeat to refuse to start (only ONE output may be active).',
      'Using TAB characters instead of two spaces breaks YAML parser.',
      'Permission denied when reading /var/log/suricata/eve.json if file permissions are 0600.',
    ],
  },
  serviceManagement: {
    serviceName: 'filebeat',
    startCommand: 'sudo systemctl start filebeat',
    stopCommand: 'sudo systemctl stop filebeat',
    restartCommand: 'sudo systemctl restart filebeat',
    enableCommand: 'sudo systemctl enable filebeat',
    statusCommand: 'sudo systemctl status filebeat',
    logsCommand: 'sudo journalctl -u filebeat -n 50 --no-pager',
    explanation:
      'Filebeat is a lightweight compiled binary that boots in under 1 second. Always use "filebeat test config" and "filebeat test output" before restarting the service to ensure zero downtime.',
  },
  installationSteps: [
    {
      id: 'fb-inst-1',
      command: 'sudo apt update && sudo apt install -y filebeat',
      description: 'Install Filebeat from the Elastic repository',
      whyThisCommand:
        'Installs the Filebeat binary into /usr/share/filebeat and configuration into /etc/filebeat.',
      expectedOutput: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  filebeat
Unpacking filebeat (8.12.2) ...
Setting up filebeat (8.12.2) ...`,
      whatOutputMeans: 'Filebeat package installed.',
      requiresSudo: true,
    },
    {
      id: 'fb-inst-2',
      command: 'sudo nano /etc/filebeat/filebeat.yml',
      description: 'Configure input filestream for Suricata eve.json and route to Logstash 5044',
      whyThisCommand:
        'Instructs Filebeat which log files on disk to harvest and where to forward the packets.',
      expectedOutput: `(Nano editor opens /etc/filebeat/filebeat.yml)`,
      whatOutputMeans: 'Ready to edit inputs and output blocks.',
      commonMistake: 'Leaving output.elasticsearch uncommented while also configuring output.logstash.',
      troubleshooting: 'Ensure only one output block is uncommented.',
      requiresSudo: true,
    },
    {
      id: 'fb-inst-3',
      command: 'sudo filebeat test config',
      description: 'Validate YAML syntax and structure of filebeat.yml',
      whyThisCommand:
        'Scans the file for tabs, mismatched indentations, or unknown configuration keys.',
      expectedOutput: `Config OK`,
      whatOutputMeans: 'Configuration syntax is completely valid.',
      commonMistake: 'Ignoring warnings about multiple outputs.',
      troubleshooting: 'Check for trailing tabs or missing colons.',
      requiresSudo: true,
    },
    {
      id: 'fb-inst-4',
      command: 'sudo filebeat test output',
      description: 'Test TCP connection and handshake with downstream destination',
      whyThisCommand:
        'Connects to Logstash (port 5044) or Elasticsearch (port 9200) to confirm the destination server is ready to accept events.',
      expectedOutput: `logstash: localhost:5044...
  connection...
    parse host... OK
    dns lookup... OK
    addresses: 127.0.0.1
    telnet connect... OK
  talk to host... OK`,
      whatOutputMeans: 'Logstash on port 5044 accepted the connection and responded to the Beats protocol handshake.',
      commonMistake: 'Running test output before starting Logstash.',
      troubleshooting: 'Verify Logstash is active and listening on port 5044.',
      requiresSudo: true,
    },
    {
      id: 'fb-inst-5',
      command: 'sudo systemctl enable filebeat && sudo systemctl start filebeat',
      description: 'Enable Filebeat on boot and start shipping',
      whyThisCommand:
        'Starts the harvesting engine. Filebeat begins tailing eve.json and streams events into Logstash.',
      expectedOutput: `Created symlink /etc/systemd/system/multi-user.target.wants/filebeat.service → /lib/systemd/system/filebeat.service.`,
      whatOutputMeans: 'Filebeat service is active and harvesting logs.',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'fb-v-1',
      command: 'sudo systemctl status filebeat',
      description: 'Verify systemd status is active (running)',
      whyThisCommand: 'Confirms the Go binary is active in memory.',
      expectedOutput: `● filebeat.service - Filebeat - lightweight shipper for logs
     Loaded: loaded (/lib/systemd/system/filebeat.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:42:10 UTC; 32s ago
   Main PID: 6114 (filebeat)`,
      whatOutputMeans: 'Filebeat is running.',
    },
    {
      id: 'fb-v-2',
      command: 'sudo journalctl -u filebeat -n 25 --no-pager | grep -i "harvester\\|published"',
      description: 'Inspect logs to verify Filebeat started a harvester on eve.json',
      whyThisCommand: 'Proves Filebeat has acquired a file descriptor on /var/log/suricata/eve.json.',
      expectedOutput: `INFO [harvester] log/harvester.go:302 Harvester started for file: /var/log/suricata/eve.json
INFO [publisher_pipeline_output] pipeline/output.go:154 Connecting to backoff(async(tcp://localhost:5044))`,
      whatOutputMeans: 'Harvester is actively tailing the file and streaming to port 5044.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/filebeat/filebeat',
    inspectionCommands: [
      {
        id: 'fb-log-1',
        command: 'sudo journalctl -u filebeat -n 50 --no-pager',
        description: 'Read recent Filebeat log messages',
        whyThisCommand: 'Shows event publishing rates, registry checkpoints, and backoff states.',
      },
    ],
    keyLogPatterns: [
      { pattern: 'Harvester started for file', meaning: 'Filebeat successfully opened the target log file.' },
      { pattern: 'Non-zero metrics in the last 30s', meaning: 'Events are being actively ingested and published.' },
      { pattern: 'Failed to connect to backoff', meaning: 'Downstream Logstash/ES server is unreachable.' },
    ],
  },
  commonErrors: [
    {
      id: 'fb-err-1',
      title: 'Error 1 — YAML Indentation & Multi-Output Conflict',
      symptom: 'Filebeat fails: "Exiting: error initializing publisher: more than one output configured".',
      whyItHappens: 'Both output.logstash and output.elasticsearch were left uncommented in filebeat.yml.',
      howToIdentify: 'Run filebeat test config.',
      diagnosticCommand: 'sudo filebeat test config',
      expectedErrorOutput: 'error unpacking config data: more than one the following outputs were configured: elasticsearch, logstash',
      fixExplanation: 'Comment out the output.elasticsearch section completely so only output.logstash remains active.',
      fixCommand: 'sudo sed -i \'/output.elasticsearch:/,/^[^ ]/ s/^/#/\' /etc/filebeat/filebeat.yml',
      verificationCommand: 'sudo filebeat test config',
      verificationOutput: 'Config OK',
    },
    {
      id: 'fb-err-2',
      title: 'Error 2 — Cannot Connect to Logstash (Connection Refused on 5044)',
      symptom: 'filebeat test output fails with "dial tcp 127.0.0.1:5044: connect: connection refused".',
      whyItHappens: 'Logstash service is stopped or port 5044 is not listening.',
      howToIdentify: 'Test port 5044 with netcat.',
      diagnosticCommand: 'nc -zv localhost 5044',
      expectedErrorOutput: 'nc: connect to localhost (127.0.0.1) port 5044 (tcp) failed: Connection refused',
      fixExplanation: 'Verify Logstash is running: "sudo systemctl start logstash".',
      fixCommand: 'sudo systemctl start logstash && sudo systemctl status logstash',
      verificationCommand: 'sudo filebeat test output',
      verificationOutput: 'talk to host... OK',
    },
    {
      id: 'fb-err-3',
      title: 'Error 3 — Cannot Connect to Elasticsearch (Direct Mode)',
      symptom: 'filebeat test output fails with "dial tcp 127.0.0.1:9200: connect: connection refused".',
      whyItHappens: 'When configured for direct ES shipping, Elasticsearch is down or port 9200 is blocked.',
      howToIdentify: 'Run test output against Elasticsearch.',
      diagnosticCommand: 'sudo filebeat test output',
      expectedErrorOutput: 'elasticsearch: http://localhost:9200... Connection refused',
      fixExplanation: 'Start Elasticsearch service: "sudo systemctl start elasticsearch".',
      fixCommand: 'sudo systemctl start elasticsearch',
      verificationCommand: 'sudo filebeat test output',
      verificationOutput: 'talk to host... OK',
    },
    {
      id: 'fb-err-4',
      title: 'Error 4 — 401 Unauthorized Credentials on Elasticsearch Output',
      symptom: 'filebeat test output returns: "Cannot index event status: 401 Unauthorized".',
      whyItHappens: 'Wrong username or password specified in output.elasticsearch.',
      howToIdentify: 'Inspect HTTP code in filebeat test output.',
      diagnosticCommand: 'sudo filebeat test output',
      expectedErrorOutput: '401 Unauthorized: security_exception',
      fixExplanation: 'Update the password field in filebeat.yml with the valid elastic password.',
      fixCommand: 'sudo nano /etc/filebeat/filebeat.yml',
      verificationCommand: 'sudo filebeat test output',
      verificationOutput: 'talk to host... OK',
    },
    {
      id: 'fb-err-5',
      title: 'Error 5 — Filebeat Service Crash (Permission Denied on Registry)',
      symptom: 'Filebeat service exits with status 1 and journalctl reports: "open /var/lib/filebeat/registry: permission denied".',
      whyItHappens: 'Filebeat was run manually as an unprivileged user, creating root-owned or corrupted registry lockfiles.',
      howToIdentify: 'Check ownership of /var/lib/filebeat.',
      diagnosticCommand: 'ls -ld /var/lib/filebeat',
      expectedErrorOutput: 'drwxr-xr-x 2 user user ... /var/lib/filebeat',
      fixExplanation: 'Reset ownership of /var/lib/filebeat to root:root.',
      fixCommand: 'sudo chown -R root:root /var/lib/filebeat && sudo systemctl restart filebeat',
      verificationCommand: 'sudo systemctl status filebeat',
      verificationOutput: 'Active: active (running)',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-5-1',
      number: '5.1',
      title: 'Test Filebeat Output Connectivity',
      objective: 'Run "filebeat test output" to verify the connection to Logstash 5044.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Execute output diagnostic test.',
          command: 'sudo filebeat test output',
          why: 'Verifies network reachability and protocol compatibility.',
          expectedResult: 'talk to host... OK',
        },
      ],
      verificationPrompt: 'Does Filebeat report "talk to host... OK"?',
      expectedVerification: 'talk to host... OK',
    },
    {
      id: 'lab-5-2',
      number: '5.2',
      title: 'Simulate an Appended Alert in eve.json',
      objective: 'Append a sample JSON alert to /var/log/suricata/eve.json and verify Filebeat harvests it.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Ensure directory exists and append a test JSON event.',
          command: `sudo mkdir -p /var/log/suricata && echo '{"timestamp":"2026-09-18T14:45:00.000Z","event_type":"alert","src_ip":"<KALI_IP>","dest_ip":"<SIEM_IP>","proto":"TCP","alert":{"action":"allowed","signature":"TEST ALERT LAB 5.2","severity":1}}' | sudo tee -a /var/log/suricata/eve.json`,
          why: 'Creates an event on disk for Filebeat to harvest.',
          expectedResult: 'JSON line written to eve.json.',
        },
        {
          stepNumber: 2,
          instruction: 'Check Filebeat journal logs for published events.',
          command: 'sudo journalctl -u filebeat -n 20 --no-pager | grep -i "events"',
          why: 'Confirms Filebeat read and sent the new line.',
          expectedResult: 'Non-zero published events metric.',
        },
      ],
      verificationPrompt: 'Did Filebeat process the appended event?',
      expectedVerification: 'Yes, event harvested and published to output.',
    },
  ],
  challenges: [
    {
      id: 'chal-5-1',
      title: 'Filebeat Configuration Test Command',
      scenario: 'You edited /etc/filebeat/filebeat.yml and want to verify YAML syntax before restarting the service.',
      question: 'What is the exact command to test Filebeat configuration syntax?',
      hint: 'Starts with "sudo filebeat test..."',
      acceptedAnswers: ['sudo filebeat test config', 'filebeat test config'],
      correctExplanation: '"sudo filebeat test config" parses the YAML and confirms configuration validity.',
      troubleshootingTip: 'Use test config to catch YAML indentation errors.',
      commandSuggestion: 'sudo filebeat test config',
    },
    {
      id: 'chal-5-2',
      title: 'Filebeat Output Test Command',
      scenario: 'You want to verify if Filebeat can reach Logstash or Elasticsearch without inspecting log files.',
      question: 'What is the exact command to test Filebeat output destination connectivity?',
      hint: 'It tests the "output".',
      acceptedAnswers: ['sudo filebeat test output', 'filebeat test output'],
      correctExplanation: '"sudo filebeat test output" attempts a TCP handshake and protocol negotiation with the configured output.',
      troubleshootingTip: 'Run this whenever downstream services change.',
      commandSuggestion: 'sudo filebeat test output',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-5-1',
      question: 'How many simultaneous outputs (e.g., Elasticsearch AND Logstash) can be enabled in filebeat.yml?',
      options: [
        'Up to 3 outputs.',
        'Exactly ONE output may be active at any time.',
        'Unlimited outputs.',
        'One output per network interface.',
      ],
      correctIndex: 1,
      explanation: 'Filebeat strictly requires that only ONE output plugin be defined (either output.elasticsearch, output.logstash, or output.kafka). Enabling multiple outputs causes an initialization failure.',
    },
    {
      id: 'quiz-5-2',
      question: 'What happens if Filebeat is harvesting a log file and the downstream server (Logstash) temporarily goes down?',
      options: [
        'Filebeat deletes the log file.',
        'Filebeat crashes and deletes its configuration.',
        'Filebeat pauses harvesting, records the exact file byte offset in its registry, and continuously retries with exponential backoff until Logstash recovers.',
        'Filebeat sends the events to syslog instead.',
      ],
      correctIndex: 2,
      explanation: 'Filebeat maintains an on-disk registry of file inode numbers and byte offsets. If the network breaks, it pauses and resumes exactly where it stopped without losing events.',
    },
  ],
  interviewQuestions: [
    {
      question: 'Explain the difference between shipping logs from Filebeat directly to Elasticsearch versus routing through Logstash.',
      modelAnswer:
        '1) Filebeat → Elasticsearch (Direct): Uses Elasticsearch Ingest Node pipelines. It is simple, requires less server memory, and has fewer moving parts. However, ingest node capabilities are limited compared to full Logstash plugins. 2) Filebeat → Logstash → Elasticsearch: Adds an enterprise data processing tier. Logstash provides heavy grok regex parsing, GeoIP/threat intelligence enrichment, conditional routing to multiple clusters or cold storage (S3/Kafka), and absorbs traffic spikes. In an enterprise SOC, Logstash is preferred for multi-source enrichment.',
      keyPoints: ['Direct is lightweight with fewer hops', 'Logstash provides complex enrichment and buffering', 'Logstash enables multi-destination routing', 'Direct uses ES ingest pipelines'],
    },
  ],
  checklist: [
    { id: 'chk-5-1', label: 'Filebeat package installed', verifyCommand: 'dpkg -l | grep filebeat' },
    { id: 'chk-5-2', label: 'filebeat.yml configured to harvest /var/log/suricata/eve.json', verifyCommand: 'sudo grep -A 5 "filestream" /etc/filebeat/filebeat.yml' },
    { id: 'chk-5-3', label: 'Configuration syntax verified with "filebeat test config"', verifyCommand: 'sudo filebeat test config' },
    { id: 'chk-5-4', label: 'Output connectivity verified with "filebeat test output"', verifyCommand: 'sudo filebeat test output' },
    { id: 'chk-5-5', label: 'Filebeat service active and enabled', verifyCommand: 'sudo systemctl is-active filebeat' },
  ],
};
