import { ModuleData } from '../../types/socMasterLab';

export const module04Kibana: ModuleData = {
  id: 'kibana',
  moduleNumber: '04',
  title: 'Kibana Security Visualization & UI',
  tagline: 'Deploy the browser-based visualization platform for searching security telemetry, building dashboards, and running KQL queries.',
  badge: 'UI & Visualization',
  level: 'Level 2: SIEM Stack',
  estimatedMinutes: 50,
  overview: {
    whatIsIt:
      'Kibana is the official web-based front-end interface for the Elastic Stack. It provides analysts with rich data visualization dashboards, interactive histogram timelines, and a powerful search bar powered by Kibana Query Language (KQL).',
    whyDoWeNeedIt:
      'While Elasticsearch can be queried using raw JSON cURL commands in the terminal, SOC analysts investigating incidents require graphical timelines, geographic threat maps, bar charts of top attacking IPs, and instant filtering across millions of alerts without writing complex API queries.',
    problemSolved:
      'Provides a visual analyst workbench for incident triage, threat hunting, log inspection, security alert management, and reporting.',
    architectureRole:
      'Runs as a Node.js web server on TCP port 5601, queries Elasticsearch REST APIs on port 9200 over HTTP/HTTPS, and renders responsive dashboards to analysts\' web browsers.',
    diagramText: `[SOC Analyst Web Browser]
         │
         ▼ (HTTP/HTTPS Port 5601)
┌────────────────────────────────────────────────────────┐
│                   KIBANA WEB CONSOLE                   │
│                                                        │
│  ├── Discover: Raw Event Inspection & KQL Search Bar   │
│  ├── Dashboards: Threat Visualizations & Histograms    │
│  ├── Data Views: Index Pattern Binding (soc-*)         │
│  └── Stack Management: Security & Saved Objects        │
└────────────────────────────────────────────────────────┘
         │
         ▼ (HTTP/HTTPS Port 9200 REST API)
[Elasticsearch Node]`,
  },
  prerequisites: [
    'Completed Module 02 (Elasticsearch operational on port 9200)',
    'At least 1.5 GB RAM allocated for Kibana Node.js runtime',
    'Port 5601 open and unassigned on the host',
    'Modern web browser (Chrome, Firefox, Edge, Safari)',
  ],
  importantPorts: [
    {
      component: 'Kibana Web Interface',
      port: 5601,
      protocol: 'HTTP',
      purpose: 'Web UI access for security analysts and SOC dashboard consumers',
      configFile: '/etc/kibana/kibana.yml',
      verificationCommand: 'sudo ss -tulpn | grep 5601',
      troubleshootingCommands: [
        'curl -I http://localhost:5601/api/status',
        'sudo journalctl -u kibana -n 50 --no-pager',
      ],
      relatedComponents: ['Elasticsearch', 'SOC Analyst Browser'],
    },
  ],
  configurationFile: {
    path: '/etc/kibana/kibana.yml',
    component: 'Kibana Core Daemon',
    purpose: 'Controls web server listener port, bind address, Elasticsearch connection URLs, and encryption settings',
    whatItControls: 'server.port, server.host (0.0.0.0 for LAN access), elasticsearch.hosts, and service account tokens',
    parameters: [
      { key: 'server.port', value: '5601', purpose: 'HTTP port the web server listens on', safeDefault: '5601' },
      { key: 'server.host', value: '0.0.0.0', purpose: 'Binds to all network interfaces so analysts can connect from their workstation browser', safeDefault: '0.0.0.0' },
      { key: 'elasticsearch.hosts', value: '["http://localhost:9200"]', purpose: 'URL of the local Elasticsearch instance', safeDefault: '["http://localhost:9200"]' },
      { key: 'elasticsearch.serviceAccountToken', value: 'AAEAAWVsYXN0aWMva2liYW5hL3...', purpose: 'Encrypted bearer token for Kibana-to-Elasticsearch communication', safeDefault: 'YOUR_SERVICE_TOKEN' },
    ],
    safeSnippet: `# ========================= Kibana Configuration =========================
server.port: 5601
# Bind to 0.0.0.0 so remote analyst browser can reach the web console
server.host: "0.0.0.0"

# Elasticsearch connection endpoint
elasticsearch.hosts: ["http://localhost:9200"]

# Service account token or credentials
# (Alternatively generate using /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana)
elasticsearch.username: "kibana_system"
elasticsearch.password: "YOUR_KIBANA_PASSWORD"`,
    nanoCommand: 'sudo nano /etc/kibana/kibana.yml',
    validationCommand: 'sudo -u kibana /usr/share/kibana/bin/kibana-keystore list',
    commonErrors: [
      'Leaving server.host set to "localhost" makes Kibana unreachable from any other computer on the network.',
      'Specifying wrong Elasticsearch password or bad SSL certificate verification causes 503 Service Unavailable.',
      'Port 5601 already bound by another web application.',
    ],
  },
  serviceManagement: {
    serviceName: 'kibana',
    startCommand: 'sudo systemctl start kibana',
    stopCommand: 'sudo systemctl stop kibana',
    restartCommand: 'sudo systemctl restart kibana',
    enableCommand: 'sudo systemctl enable kibana',
    statusCommand: 'sudo systemctl status kibana',
    logsCommand: 'sudo journalctl -u kibana -n 50 --no-pager',
    explanation:
      'Kibana is a Node.js process managed by systemd. On initial startup, it connects to Elasticsearch, verifies system indices, and optimizes client bundles. This startup sequence typically takes 30 to 60 seconds before HTTP 200 responses are returned on port 5601.',
  },
  installationSteps: [
    {
      id: 'kib-inst-1',
      command: 'sudo apt update && sudo apt install -y kibana',
      description: 'Install Kibana from the Elastic APT repository',
      whyThisCommand:
        'Downloads the Kibana web application, configures /etc/kibana, and creates the "kibana" system user.',
      expectedOutput: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  kibana
Unpacking kibana (8.12.2) ...
Setting up kibana (8.12.2) ...`,
      whatOutputMeans: 'Kibana binaries and dependencies installed.',
      requiresSudo: true,
    },
    {
      id: 'kib-inst-2',
      command: 'sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u kibana_system -i',
      description: 'Set password for the built-in "kibana_system" internal account',
      whyThisCommand:
        'Kibana requires a dedicated system user ("kibana_system") to manage internal index mappings and health monitoring in Elasticsearch without using the root elastic superuser.',
      expectedOutput: `Enter password for [kibana_system]:
Re-enter password for [kibana_system]:
Password for the [kibana_system] user successfully reset.`,
      whatOutputMeans: 'Password for kibana_system is updated.',
      commonMistake: 'Trying to log into the Kibana web browser using kibana_system. kibana_system is ONLY for background daemon connectivity, not interactive analyst login!',
      troubleshooting: 'Always log into the web browser using the "elastic" superuser.',
      requiresSudo: true,
    },
    {
      id: 'kib-inst-3',
      command: 'sudo nano /etc/kibana/kibana.yml',
      description: 'Configure server.host to "0.0.0.0" and set Elasticsearch credentials',
      whyThisCommand:
        'Enables external browser access from your management workstation and supplies the kibana_system credentials.',
      expectedOutput: `(Nano editor opens /etc/kibana/kibana.yml)`,
      whatOutputMeans: 'Ready to configure server.host and elasticsearch.hosts.',
      commonMistake: 'Leaving server.host as "localhost" which blocks remote web browsers.',
      troubleshooting: 'Set server.host: "0.0.0.0" to allow network-wide connectivity.',
      requiresSudo: true,
    },
    {
      id: 'kib-inst-4',
      command: 'sudo systemctl enable kibana && sudo systemctl start kibana',
      description: 'Enable Kibana on boot and launch the background service',
      whyThisCommand:
        'Configures automatic boot startup and initiates the Node.js web server runtime.',
      expectedOutput: `Created symlink /etc/systemd/system/multi-user.target.wants/kibana.service → /lib/systemd/system/kibana.service.`,
      whatOutputMeans: 'Kibana service launched.',
      commonMistake: 'Expecting the browser interface to respond instantly in 5 seconds. Node.js takes 45-60 seconds to initialize bundles.',
      troubleshooting: 'Monitor initialization progress with: sudo journalctl -u kibana -f',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'kib-v-1',
      command: 'sudo systemctl status kibana',
      description: 'Verify systemd status is active (running)',
      whyThisCommand: 'Confirms Node.js process did not encounter unhandled exceptions.',
      expectedOutput: `● kibana.service - Kibana
     Loaded: loaded (/lib/systemd/system/kibana.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:30:15 UTC; 1min 12s ago
   Main PID: 5612 (node)`,
      whatOutputMeans: 'Kibana is running.',
    },
    {
      id: 'kib-v-2',
      command: 'sudo ss -tulpn | grep 5601',
      description: 'Verify port 5601 is open and listening on 0.0.0.0',
      whyThisCommand: 'Proves the web server is listening for HTTP requests.',
      expectedOutput: `tcp   LISTEN 0      511          0.0.0.0:5601       0.0.0.0:*    users:(("node",pid=5612,fd=18))`,
      whatOutputMeans: 'Port 5601 is bound and ready to accept web traffic.',
    },
    {
      id: 'kib-v-3',
      command: 'curl -I http://localhost:5601/api/status',
      description: 'Check the Kibana internal HTTP API status endpoint',
      whyThisCommand: 'Validates that the web server returns HTTP 200 or 302 redirect to login.',
      expectedOutput: `HTTP/1.1 302 Found
location: /login?nextUrl=%2Fapi%2Fstatus
kbn-name: kibana
content-length: 0`,
      whatOutputMeans: 'Kibana web application is ready and serving the login portal.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/kibana/kibana.log',
    inspectionCommands: [
      {
        id: 'kib-log-1',
        command: 'sudo journalctl -u kibana -n 50 --no-pager',
        description: 'Read the most recent Kibana journalctl output',
        whyThisCommand: 'Identifies connection handshakes between Kibana and Elasticsearch.',
      },
    ],
    keyLogPatterns: [
      { pattern: 'Kibana is now available (was degraded)', meaning: 'Kibana connected to Elasticsearch and is 100% operational.' },
      { pattern: 'Unable to connect to Elasticsearch', meaning: 'Port 9200 is down or credentials/SSL failed.' },
      { pattern: 'Server running at http://0.0.0.0:5601', meaning: 'Web listener started on port 5601.' },
    ],
  },
  commonErrors: [
    {
      id: 'kib-err-1',
      title: 'Error 1 — Kibana Cannot Connect to Elasticsearch (503 Service Unavailable)',
      symptom: 'Browser shows: "Kibana server is not ready yet" and logs report: "Unable to retrieve version information from Elasticsearch".',
      whyItHappens: 'Elasticsearch is either stopped, port 9200 is not reachable, or kibana_system credentials are wrong.',
      howToIdentify: 'Check if Elasticsearch responds locally on port 9200.',
      diagnosticCommand: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200',
      expectedErrorOutput: 'curl: (7) Failed to connect to localhost port 9200: Connection refused',
      fixExplanation: 'Start the Elasticsearch service and verify port 9200 is listening.',
      fixCommand: 'sudo systemctl start elasticsearch && sudo systemctl status elasticsearch',
      verificationCommand: 'curl -I http://localhost:5601/api/status',
      verificationOutput: 'HTTP/1.1 302 Found',
    },
    {
      id: 'kib-err-2',
      title: 'Error 2 — Connection Refused from Remote Analyst Browser',
      symptom: 'Browser on host machine shows "This site can\'t be reached" when browsing to http://<SIEM_IP>:5601.',
      whyItHappens: 'server.host is set to "localhost" instead of "0.0.0.0", or UFW firewall blocks port 5601.',
      howToIdentify: 'Check listening IP with ss.',
      diagnosticCommand: 'sudo ss -tulpn | grep 5601',
      expectedErrorOutput: 'tcp LISTEN 0 511 127.0.0.1:5601 0.0.0.0:* users:(("node",pid=...,fd=...))',
      fixExplanation: 'Change server.host in /etc/kibana/kibana.yml to "0.0.0.0" and allow port 5601 in UFW.',
      fixCommand: 'sudo sed -i \'s/server.host: "localhost"/server.host: "0.0.0.0"/\' /etc/kibana/kibana.yml && sudo systemctl restart kibana',
      verificationCommand: 'sudo ss -tulpn | grep 5601',
      verificationOutput: '0.0.0.0:5601',
    },
    {
      id: 'kib-err-3',
      title: 'Error 3 — Invalid YAML Indentation in kibana.yml',
      symptom: 'Kibana fails on startup with code=exited, status=1.',
      whyItHappens: 'TAB characters or invalid syntax in /etc/kibana/kibana.yml.',
      howToIdentify: 'Inspect journalctl for YAML parser error.',
      diagnosticCommand: 'sudo journalctl -u kibana -n 25 --no-pager | grep -i "yaml\\|error"',
      expectedErrorOutput: 'FATAL Error: bad indentation of a mapping entry at line 12, column 5',
      fixExplanation: 'Remove all tabs and format keys with standard spaces.',
      fixCommand: 'sudo sed -i \'s/\\t/  /g\' /etc/kibana/kibana.yml',
      verificationCommand: 'sudo systemctl restart kibana',
      verificationOutput: 'Active: active (running)',
    },
    {
      id: 'kib-err-4',
      title: 'Error 4 — Port 5601 Already in Use',
      symptom: 'Kibana logs report: "listen EADDRINUSE: address already in use 0.0.0.0:5601".',
      whyItHappens: 'An orphaned Node.js process is holding port 5601.',
      howToIdentify: 'Locate process on port 5601.',
      diagnosticCommand: 'sudo ss -tulpn | grep 5601',
      expectedErrorOutput: 'tcp LISTEN ... 0.0.0.0:5601 ... users:(("node",pid=2311,fd=...))',
      fixExplanation: 'Kill the orphaned PID and restart kibana.',
      fixCommand: 'sudo kill -9 2311 && sudo systemctl restart kibana',
      verificationCommand: 'sudo systemctl status kibana',
      verificationOutput: 'Active: active (running)',
    },
    {
      id: 'kib-err-5',
      title: 'Error 5 — The 4-Way Root Cause Distinction Matrix',
      symptom: 'A user cannot open Kibana in their web browser and doesn\'t know why.',
      whyItHappens: 'Failure could stem from 4 completely distinct layers: Kibana service, Elasticsearch backend, Network/Firewall, or Browser client.',
      howToIdentify: 'Execute the 4-way triage sequence below.',
      diagnosticCommand: 'echo "1. Service: sudo systemctl status kibana\n2. Backend: curl -k https://localhost:9200\n3. Network: sudo ss -tulpn | grep 5601\n4. Firewall: sudo ufw status"',
      expectedErrorOutput: 'Allows immediate identification of whether the fault is Kibana, ES, Network, or Browser.',
      fixExplanation: 'Follow the evidence: if ES is down, fix ES. If port is on 127.0.0.1, change to 0.0.0.0. If firewall blocks, run "sudo ufw allow 5601/tcp".',
      fixCommand: 'echo "Diagnostic checklist completed"',
      verificationCommand: 'curl -I http://localhost:5601',
      verificationOutput: 'HTTP/1.1 302 Found',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-4-1',
      number: '4.1',
      title: 'Log Into Kibana & Navigate Discover',
      objective: 'Open Kibana at http://<SIEM_IP>:5601, authenticate with "elastic" superuser, and locate Discover.',
      steps: [
        { stepNumber: 1, instruction: 'Open your browser and navigate to http://<SIEM_IP>:5601.', why: 'Accesses the web console.', expectedResult: 'Kibana login page displays.' },
        { stepNumber: 2, instruction: 'Login using username: elastic and your configured password.', why: 'Authenticates with superuser privileges.', expectedResult: 'Kibana Home Space displays.' },
        { stepNumber: 3, instruction: 'Click the left hamburger menu and select "Discover" under Analytics.', why: 'Discover is where raw security telemetry is queried.', expectedResult: 'Discover search bar and time picker appear.' },
      ],
      verificationPrompt: 'Can you see the Discover search bar and time range selector?',
      expectedVerification: 'Yes, Discover view is loaded.',
    },
    {
      id: 'lab-4-2',
      number: '4.2',
      title: 'Create a Data View for Security Telemetry',
      objective: 'Create a Data View targeting "soc-*" to query all security alerts.',
      steps: [
        { stepNumber: 1, instruction: 'In Discover, click "Create a data view".', why: 'Data views bind Kibana searches to Elasticsearch index patterns.', expectedResult: 'Data view creation flyout opens.' },
        { stepNumber: 2, instruction: 'Enter Name: "SOC Telemetry" and Index Pattern: "soc-*".', why: 'Matches all indices like soc-alerts-* or soc-suricata-*.', expectedResult: 'Elasticsearch confirms matching indices exist.' },
        { stepNumber: 3, instruction: 'Select Timestamp field: "@timestamp" and click Save.', why: 'Enables time-series histogram navigation.', expectedResult: 'Data view saved successfully.' },
      ],
      verificationPrompt: 'Does the Data View show indexed security documents?',
      expectedVerification: 'Yes, documents appear in the histogram.',
    },
    {
      id: 'lab-4-3',
      number: '4.3',
      title: 'Execute Kibana Query Language (KQL) Searches',
      objective: 'Search for security events using structured KQL syntax.',
      steps: [
        { stepNumber: 1, instruction: 'Type: event.action : "port_scan" in the KQL search bar.', why: 'Filters events where the action is port_scan.', expectedResult: 'Document count filters down to port scan events.' },
        { stepNumber: 2, instruction: 'Combine with IP filter: event.action : "port_scan" and destination.port : 22', why: 'Narrows down to SSH targeting.', expectedResult: 'Targeted results displayed.' },
      ],
      verificationPrompt: 'Did KQL filter the document list correctly?',
      expectedVerification: 'Yes, filtered results displayed.',
    },
  ],
  challenges: [
    {
      id: 'chal-4-1',
      title: 'Kibana Default Web Port',
      scenario: 'You are configuring network security groups for a cloud SIEM deployment.',
      question: 'What is the default TCP port number for the Kibana web console?',
      hint: 'It begins with 56..',
      acceptedAnswers: ['5601', 'tcp 5601', 'port 5601'],
      correctExplanation: 'Kibana runs its Node.js web server on TCP port 5601 by default.',
      troubleshootingTip: 'Check server.port in /etc/kibana/kibana.yml.',
    },
    {
      id: 'chal-4-2',
      title: 'KQL Field Search Syntax',
      scenario: 'You want to search for any alert where the source IP equals 192.168.1.100 using Kibana Query Language.',
      question: 'What is the correct KQL syntax to match source.ip with 192.168.1.100?',
      hint: 'Format: field : "value"',
      acceptedAnswers: ['source.ip : "192.168.1.100"', 'source.ip: "192.168.1.100"', 'source.ip:192.168.1.100', 'source.ip : 192.168.1.100'],
      correctExplanation: 'In KQL, field matching uses the colon operator: source.ip : "192.168.1.100".',
      troubleshootingTip: 'KQL uses colons for field equality checks.',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-4-1',
      question: 'Why should "server.host" in /etc/kibana/kibana.yml be set to "0.0.0.0" instead of "localhost"?',
      options: [
        'To enable encryption.',
        'To allow users on other workstations across the local network to reach the Kibana web dashboard in their browser.',
        'Because Elasticsearch refuses connections from localhost.',
        'To speed up query caching.',
      ],
      correctIndex: 1,
      explanation: 'Binding to "localhost" or 127.0.0.1 restricts access strictly to the local machine. Setting 0.0.0.0 instructs the web server to listen on all interfaces, allowing remote analyst browsers to access the portal.',
    },
    {
      id: 'quiz-4-2',
      question: 'What is the primary difference between the "elastic" superuser and the "kibana_system" account?',
      options: [
        'There is no difference; they are aliases.',
        'kibana_system is an internal service account used exclusively by the Kibana daemon to communicate with Elasticsearch; humans should log into the web UI as "elastic".',
        'kibana_system has more permissions than elastic.',
        'kibana_system is used to reboot the Linux kernel.',
      ],
      correctIndex: 1,
      explanation: 'kibana_system is an unprivileged internal service account specifically restricted to Kibana background indexing tasks. Interactive users cannot and should not log into the Kibana web GUI with kibana_system.',
    },
  ],
  interviewQuestions: [
    {
      question: 'How do you distinguish whether a Kibana accessibility failure is caused by Kibana itself, Elasticsearch, the network, or the browser?',
      modelAnswer:
        'I follow a 4-tier diagnostic isolation model: 1) Kibana Process: Check "systemctl status kibana" and journalctl to confirm the Node.js process is active. 2) Elasticsearch Backend: Run "curl -k -u elastic:pass https://localhost:9200" to verify the storage layer is operational. If ES is down, Kibana will display 503 or degraded status. 3) Network & Socket: Run "ss -tulpn | grep 5601" to verify Kibana is bound to 0.0.0.0 and check UFW with "sudo ufw status". 4) Browser Client: If localhost responds via "curl -I http://localhost:5601" but a remote browser cannot connect, the issue is strictly network routing, firewall, or NAT.',
      keyPoints: ['Process check via systemctl', 'Backend check via curl 9200', 'Listener binding via ss 5601', 'Client/routing validation via firewall and remote curl'],
    },
  ],
  checklist: [
    { id: 'chk-4-1', label: 'Kibana package installed', verifyCommand: 'dpkg -l | grep kibana' },
    { id: 'chk-4-2', label: 'kibana_system account password configured', verifyCommand: 'echo "Password set"' },
    { id: 'chk-4-3', label: 'kibana.yml configured with server.host: "0.0.0.0"', verifyCommand: 'sudo grep "server.host" /etc/kibana/kibana.yml' },
    { id: 'chk-4-4', label: 'Kibana service active and listening on port 5601', verifyCommand: 'sudo ss -tulpn | grep 5601' },
    { id: 'chk-4-5', label: 'HTTP status 200 or 302 returned on port 5601', verifyCommand: 'curl -I http://localhost:5601/api/status' },
    { id: 'chk-4-6', label: 'Successfully logged in as elastic superuser via browser', verifyCommand: 'echo "Login confirmed in browser"' },
  ],
};
