import { ModuleData } from '../../types/socMasterLab';

export const module02Elasticsearch: ModuleData = {
  id: 'elasticsearch',
  moduleNumber: '02',
  title: 'Elasticsearch Search & Analytics Engine',
  tagline: 'Install, configure, secure, and operate the high-performance distributed search engine storing all security telemetry.',
  badge: 'Storage & Analytics',
  level: 'Level 2: SIEM Stack',
  estimatedMinutes: 60,
  overview: {
    whatIsIt:
      'Elasticsearch is a distributed, RESTful search and analytics engine built on Apache Lucene. In our SOC pipeline, it serves as the primary hot and warm storage repository for all normalized security telemetry, logs, and intrusion detection alerts.',
    whyDoWeNeedIt:
      'Security operations teams deal with millions of events per day. Traditional relational databases (SQL) choke when indexing thousands of unstructured log events per second and cannot perform sub-second full-text searches across petabytes of data. Elasticsearch indexes JSON documents into inverted indices, allowing SOC analysts to search across billions of security records in milliseconds.',
    problemSolved:
      'Eliminates slow, locked queries on large security datasets; provides schema-on-write mapping; scales horizontally across multiple nodes; and provides a standardized REST API for Kibana and automated detection rules.',
    architectureRole:
      'Acts as the centralized database layer. It ingests parsed JSON records from Logstash (or Filebeat) via HTTP port 9200 and exposes them to Kibana via authenticated REST queries.',
    diagramText: `[Logstash Pipeline] ──(HTTP JSON / TCP 9200)──► [Elasticsearch Node]
                                                     │
                                      ┌──────────────┴──────────────┐
                                      ▼                             ▼
                              [Index: suricata-*]           [Index: system-*]
                                 ├── Shard 0 (Primary)        ├── Shard 0 (Primary)
                                 └── Shard 1 (Primary)        └── Shard 1 (Primary)
                                                     │
                                                     ▼
                                      [Kibana Web Console (5601)]`,
  },
  prerequisites: [
    'Completed Module 01 (Host prerequisites, Java 17, Elastic APT repo configured)',
    'Minimum 4 GB dedicated RAM for Elasticsearch JVM heap (8GB system RAM)',
    'At least 20 GB free disk space on root volume',
    'Port 9200 available and not bound by other processes',
  ],
  importantPorts: [
    {
      component: 'Elasticsearch HTTP REST API',
      port: 9200,
      protocol: 'HTTPS',
      purpose: 'REST API communication with Kibana, Logstash, Beats, and analyst curl commands',
      configFile: '/etc/elasticsearch/elasticsearch.yml',
      verificationCommand: 'sudo ss -tulpn | grep 9200',
      troubleshootingCommands: [
        'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200',
        'sudo journalctl -u elasticsearch -n 50',
      ],
      relatedComponents: ['Kibana', 'Logstash', 'Filebeat'],
    },
    {
      component: 'Elasticsearch Cluster Transport',
      port: 9300,
      protocol: 'TCP',
      purpose: 'Internal node-to-node cluster communication and shard replication',
      configFile: '/etc/elasticsearch/elasticsearch.yml',
      verificationCommand: 'sudo ss -tulpn | grep 9300',
      troubleshootingCommands: ['sudo ss -tulpn | grep 9300'],
      relatedComponents: ['Other Elasticsearch Cluster Nodes'],
    },
  ],
  configurationFile: {
    path: '/etc/elasticsearch/elasticsearch.yml',
    component: 'Elasticsearch Core Daemon',
    purpose: 'Controls cluster identity, node binding, network interfaces, TLS/SSL encryption, and discovery topology',
    whatItControls: 'Cluster name, node name, listening host IP (network.host), port, single-node discovery mode, and xpack security',
    parameters: [
      { key: 'cluster.name', value: 'soc-master-lab', purpose: 'Logical name of the cluster. All nodes must share this name.', safeDefault: 'soc-master-lab' },
      { key: 'node.name', value: 'soc-siem-node01', purpose: 'Human-readable identifier for this specific node in logs and cluster APIs.', safeDefault: 'soc-siem-node01' },
      { key: 'network.host', value: '0.0.0.0', purpose: 'Interface IP to bind on. 0.0.0.0 allows LAN connections from Kibana & Logstash.', safeDefault: '0.0.0.0' },
      { key: 'http.port', value: '9200', purpose: 'HTTP REST API port.', safeDefault: '9200' },
      { key: 'discovery.type', value: 'single-node', purpose: 'Disables multi-node quorum checks so Elasticsearch can elect itself master in a 1-server lab.', safeDefault: 'single-node' },
      { key: 'xpack.security.enabled', value: 'true', purpose: 'Enables authentication, role-based access control, and user credentials.', safeDefault: 'true' },
      { key: 'xpack.security.http.ssl.enabled', value: 'false', purpose: 'In beginner labs without CA certificates, setting HTTP SSL to false simplifies initial REST queries, or keep true with auto-generated certs.', safeDefault: 'false' },
    ],
    safeSnippet: `# ======================== Elasticsearch Configuration =========================
cluster.name: soc-master-lab
node.name: soc-siem-node01
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Bind to all IPv4 interfaces so Kibana and Logstash can connect
network.host: 0.0.0.0
http.port: 9200

# Standalone single-node lab mode (bypasses bootstrap multi-node quorum check)
discovery.type: single-node

# Security settings
xpack.security.enabled: true
xpack.security.enrollment.enabled: true
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false`,
    nanoCommand: 'sudo nano /etc/elasticsearch/elasticsearch.yml',
    validationCommand: 'sudo -u elasticsearch /usr/share/elasticsearch/bin/elasticsearch-keystore list',
    commonErrors: [
      'Using TAB indentation instead of spaces causes YAML parse exceptions on boot.',
      'Setting network.host to a routable IP without setting discovery.type: single-node triggers strict bootstrap check failures.',
      'Forgetting to set permissions on /var/lib/elasticsearch blocks index creation.',
    ],
  },
  serviceManagement: {
    serviceName: 'elasticsearch',
    startCommand: 'sudo systemctl start elasticsearch',
    stopCommand: 'sudo systemctl stop elasticsearch',
    restartCommand: 'sudo systemctl restart elasticsearch',
    enableCommand: 'sudo systemctl enable elasticsearch',
    statusCommand: 'sudo systemctl status elasticsearch',
    logsCommand: 'sudo journalctl -u elasticsearch -n 50 --no-pager',
    explanation:
      'Elasticsearch is run as a systemd service under the "elasticsearch" user. Whenever you modify /etc/elasticsearch/elasticsearch.yml, you must restart the daemon using "sudo systemctl restart elasticsearch" and immediately verify its state with "systemctl status".',
  },
  installationSteps: [
    {
      id: 'es-inst-1',
      command: 'sudo apt update && sudo apt install -y elasticsearch',
      description: 'Install the official Elasticsearch package from Elastic APT repository',
      whyThisCommand:
        'Downloads and installs the Elasticsearch binaries, creates the default "elasticsearch" system user, and configures default directories in /etc/elasticsearch and /var/lib/elasticsearch.',
      expectedOutput: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  elasticsearch
0 upgraded, 1 newly installed, 0 to remove.
Unpacking elasticsearch (8.12.2) ...
Setting up elasticsearch (8.12.2) ...
--------------------------- Security autoconfiguration information ----------------------------
Authentication and TLS have been configured!
The password for the elastic built-in superuser is: <AUTOGENERATED_PASSWORD>
------------------------------------------------------------------------------------------------`,
      whatOutputMeans: 'Elasticsearch 8.x is installed. IMPORTANT: Copy down the auto-generated password if TLS is enabled.',
      commonMistake: 'Failing to record the auto-generated elastic password printed during initial package installation.',
      troubleshooting: 'If lost, reset it anytime using: sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -i',
      requiresSudo: true,
    },
    {
      id: 'es-inst-2',
      command: 'sudo nano /etc/elasticsearch/elasticsearch.yml',
      description: 'Open configuration file to set cluster.name, network.host, and discovery.type',
      whyThisCommand:
        'By default, Elasticsearch binds only to 127.0.0.1. We configure it to bind to 0.0.0.0 so our entire lab pipeline can communicate with it.',
      expectedOutput: `(Nano editor opens /etc/elasticsearch/elasticsearch.yml)`,
      whatOutputMeans: 'You are now editing the main daemon configuration.',
      commonMistake: 'Pressing Tab to indent lines. YAML prohibits Tabs; always use two spaces!',
      troubleshooting: 'Use Ctrl+O then Enter to save, and Ctrl+X to exit Nano.',
      requiresSudo: true,
    },
    {
      id: 'es-inst-3',
      command: 'sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -i',
      description: 'Set a known password for the "elastic" superuser account',
      whyThisCommand:
        'Rather than memorizing a 24-character random string, set a reliable lab password (e.g., SocMasterLab2026!) for your local training environment.',
      expectedOutput: `Enter password for [elastic]:
Re-enter password for [elastic]:
Password for the [elastic] user successfully reset.`,
      whatOutputMeans: 'Superuser authentication password is updated and stored in the security index.',
      commonMistake: 'Typing too short a password (minimum 6 characters required).',
      troubleshooting: 'Elasticsearch must be running or have keystore access to set passwords interactively.',
      requiresSudo: true,
    },
    {
      id: 'es-inst-4',
      command: 'sudo systemctl daemon-reload && sudo systemctl enable elasticsearch && sudo systemctl start elasticsearch',
      description: 'Enable Elasticsearch on boot and start the daemon process',
      whyThisCommand:
        '"enable" creates the systemd symlink so Elasticsearch starts automatically after reboot. "start" initiates the JVM process in the background.',
      expectedOutput: `Created symlink /etc/systemd/system/multi-user.target.wants/elasticsearch.service → /lib/systemd/system/elasticsearch.service.`,
      whatOutputMeans: 'Service is enabled and start signal was dispatched to systemd.',
      commonMistake: 'Assuming start happens instantaneously. Elasticsearch JVM takes 15-30 seconds to initialize Lucene indices.',
      troubleshooting: 'Wait 20 seconds before checking status.',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'es-v-1',
      command: 'sudo systemctl status elasticsearch',
      description: 'Verify systemd reports the Elasticsearch daemon as Active (running)',
      whyThisCommand: 'Validates that the process did not encounter a fatal JVM crash or exit on boot.',
      expectedOutput: `● elasticsearch.service - Elasticsearch
     Loaded: loaded (/lib/systemd/system/elasticsearch.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:02:11 UTC; 42s ago
       Docs: https://www.elastic.co
   Main PID: 3412 (java)
      Tasks: 65 (limit: 9485)
     Memory: 2.1G
        CPU: 18.214s
     CGroup: /system.slice/elasticsearch.service
             └─3412 /usr/share/elasticsearch/jdk/bin/java -Xms2g -Xmx2g ...`,
      whatOutputMeans: 'Status is "active (running)" with Main PID 3412. It is actively using 2.1GB RAM.',
    },
    {
      id: 'es-v-2',
      command: 'sudo ss -tulpn | grep 9200',
      description: 'Confirm port 9200 is bound and listening for incoming TCP requests',
      whyThisCommand: 'Proves the HTTP REST listener is open and ready to accept queries.',
      expectedOutput: `tcp   LISTEN 0      4096         0.0.0.0:9200       0.0.0.0:*    users:(("java",pid=3412,fd=346))`,
      whatOutputMeans: 'Java process 3412 is listening on 0.0.0.0:9200.',
    },
    {
      id: 'es-v-3',
      command: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200',
      description: 'Query the root cluster REST API endpoint over HTTPS',
      whyThisCommand:
        'Validates REST communication, superuser credentials, cluster health, and the Lucene build version.',
      expectedOutput: `{
  "name" : "soc-siem-node01",
  "cluster_name" : "soc-master-lab",
  "cluster_uuid" : "v8yq7g9sTaCG1b4oP9K_Aw",
  "version" : {
    "number" : "8.12.2",
    "build_flavor" : "default",
    "build_type" : "deb",
    "build_hash" : "48a2a8723c57c5933807829755f1f7e13ff08f24",
    "lucene_version" : "9.9.2",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}`,
      whatOutputMeans: 'Elasticsearch returned HTTP 200 with cluster metadata. The cluster is alive!',
    },
    {
      id: 'es-v-4',
      command: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200/_cluster/health?pretty',
      description: 'Inspect cluster health status (green, yellow, or red)',
      whyThisCommand:
        'Checks shard allocation state. Green means all primary and replica shards are active. Yellow means all primaries are active but replicas unassigned (normal for single-node). Red means primaries are missing.',
      expectedOutput: `{
  "cluster_name" : "soc-master-lab",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 4,
  "active_shards" : 4,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0
}`,
      whatOutputMeans: 'Status green or yellow indicates operational readiness for log ingestion.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/elasticsearch/soc-master-lab.log',
    inspectionCommands: [
      {
        id: 'es-log-1',
        command: 'sudo tail -n 50 /var/log/elasticsearch/soc-master-lab.log',
        description: 'Read the most recent cluster log entries from disk',
        whyThisCommand: 'Inspects cluster state events, index creations, and runtime warnings.',
      },
      {
        id: 'es-log-2',
        command: 'sudo journalctl -u elasticsearch -n 50 --no-pager',
        description: 'Read systemd daemon log output',
        whyThisCommand: 'Detects JVM startup failures, bootstrap check aborts, or permission errors that occur before the main log file is created.',
      },
    ],
    keyLogPatterns: [
      { pattern: 'cluster.health [soc-master-lab] status changed from [RED] to [GREEN]', meaning: 'Cluster election completed and shards are initialized.' },
      { pattern: 'bound or publishing to address {[::]:9200}', meaning: 'HTTP REST server successfully bound to port 9200.' },
      { pattern: 'bootstrap check failure', meaning: 'Host failed production requirements (e.g., max virtual memory areas vm.max_map_count).' },
    ],
  },
  commonErrors: [
    {
      id: 'es-err-1',
      title: 'Error 1 — Service Failed to Start (Bootstrap Check Failure)',
      symptom: 'systemctl status elasticsearch displays "Active: failed (Result: exit-code)" with code=exited, status=78.',
      whyItHappens: 'When network.host is bound to a non-loopback IP, Elasticsearch enforces production bootstrap checks (e.g., max_map_count or single-node discovery missing).',
      howToIdentify: 'Inspect journalctl output to locate the specific bootstrap check that failed.',
      diagnosticCommand: 'sudo journalctl -u elasticsearch -n 25 --no-pager | grep -i bootstrap',
      expectedErrorOutput: 'ERROR: [1] bootstrap checks failed. [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]',
      fixExplanation: 'Increase sysctl virtual memory count to 262144 and ensure discovery.type: single-node is set.',
      fixCommand: 'sudo sysctl -w vm.max_map_count=262144 && echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf',
      verificationCommand: 'sudo systemctl restart elasticsearch && sudo systemctl status elasticsearch',
      verificationOutput: 'Active: active (running)',
    },
    {
      id: 'es-err-2',
      title: 'Error 2 — Port 9200 Unavailable (BindException: Address already in use)',
      symptom: 'Elasticsearch crashes on boot with BindTransportException: Failed to bind to [9200].',
      whyItHappens: 'Another application or an orphaned Elasticsearch/Logstash instance is already occupying port 9200.',
      howToIdentify: 'Use ss to find which PID holds port 9200.',
      diagnosticCommand: 'sudo ss -tulpn | grep 9200',
      expectedErrorOutput: 'tcp LISTEN 0 128 0.0.0.0:9200 0.0.0.0:* users:(("python3",pid=5120,fd=4))',
      fixExplanation: 'Identify the conflicting PID and terminate it so Elasticsearch can bind.',
      fixCommand: 'sudo kill -9 5120',
      verificationCommand: 'sudo systemctl restart elasticsearch && sudo ss -tulpn | grep 9200',
      verificationOutput: 'users:(("java",pid=...,fd=...))',
    },
    {
      id: 'es-err-3',
      title: 'Error 3 — YAML Configuration Parsing Syntax Error',
      symptom: 'Elasticsearch fails immediately with org.elasticsearch.common.settings.SettingsException: Failed to load settings.',
      whyItHappens: 'A TAB character or mismatched indentation was introduced while editing /etc/elasticsearch/elasticsearch.yml.',
      howToIdentify: 'Check journalctl for the line number and character column where the YAML parser choked.',
      diagnosticCommand: 'sudo journalctl -u elasticsearch -n 20 --no-pager | grep -i "yaml\\|scanner"',
      expectedErrorOutput: 'Cannot create property=cluster.name; ParserException: while scanning a simple key; could not find expected \':\' at line 18, column 3',
      fixExplanation: 'Open the file with Nano, replace any Tab characters with two spaces, and verify colon syntax.',
      fixCommand: 'sudo sed -i \'s/\\t/  /g\' /etc/elasticsearch/elasticsearch.yml',
      verificationCommand: 'sudo systemctl restart elasticsearch',
      verificationOutput: 'Active: active (running)',
    },
    {
      id: 'es-err-4',
      title: 'Error 4 — 401 Unauthorized REST API Authentication Failure',
      symptom: 'curl requests to https://localhost:9200 return HTTP 401 Unauthorized.',
      whyItHappens: 'Incorrect password provided, or user forgot to pass the "-u elastic:password" flag.',
      howToIdentify: 'Inspect cURL HTTP response status and header.',
      diagnosticCommand: 'curl -k -i https://localhost:9200',
      expectedErrorOutput: 'HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Basic realm="security"\n{"error":{"root_cause":[{"type":"security_exception","reason":"missing authentication credentials"}]}}',
      fixExplanation: 'Reset the password for the elastic superuser to a known value.',
      fixCommand: 'sudo /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -b -s',
      verificationCommand: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200',
      verificationOutput: '"tagline" : "You Know, for Search"',
    },
    {
      id: 'es-err-5',
      title: 'Error 5 — Disk Space Flood Stage Watermark Reached',
      symptom: 'Indices enter read-only mode: cluster_block_exception [TOO_MANY_REQUESTS/12/disk usage exceeded flood-stage watermark].',
      whyItHappens: 'Elasticsearch disk watermark threshold (default 95%) was exceeded by log retention or host partition fill.',
      howToIdentify: 'Check disk storage free percentage on /var/lib/elasticsearch partition.',
      diagnosticCommand: 'df -h /var/lib/elasticsearch',
      expectedErrorOutput: '/dev/sda1        50G   48G  1.5G  97% /var/lib/elasticsearch',
      fixExplanation: 'Delete old indices or purge disk space, then unlock the index read-only flag via cluster settings API.',
      fixCommand: 'curl -k -u elastic:YOUR_PASSWORD -X PUT "https://localhost:9200/_all/_settings" -H "Content-Type: application/json" -d \'{"index.blocks.read_only_allow_delete": null}\'',
      verificationCommand: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200/_cluster/allocation/explain?pretty',
      verificationOutput: '"deciders" : [ { "decider" : "disk_threshold", "decision" : "YES" } ]',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-2-1',
      number: '2.1',
      title: 'Verify Elasticsearch Service Execution',
      objective: 'Check the systemd runtime status of Elasticsearch and inspect process details.',
      steps: [
        { stepNumber: 1, instruction: 'Check systemctl status.', command: 'sudo systemctl status elasticsearch', why: 'Confirms active running state.', expectedResult: 'Active: active (running).' },
      ],
      verificationPrompt: 'Is the daemon state active (running)?',
      expectedVerification: 'Yes, running with PID and JVM heap listed.',
    },
    {
      id: 'lab-2-2',
      number: '2.2',
      title: 'Identify Listening Port & Sockets',
      objective: 'Locate port 9200 with socket statistics.',
      steps: [
        { stepNumber: 1, instruction: 'Filter listening ports for 9200.', command: 'sudo ss -tulpn | grep 9200', why: 'Validates TCP socket listener.', expectedResult: 'LISTEN on 0.0.0.0:9200 or 127.0.0.1:9200.' },
      ],
      verificationPrompt: 'Does the Java process show listening on port 9200?',
      expectedVerification: 'Yes.',
    },
    {
      id: 'lab-2-3',
      number: '2.3',
      title: 'Query Elasticsearch REST API',
      objective: 'Send an authenticated GET request to query the cluster identity.',
      steps: [
        { stepNumber: 1, instruction: 'Execute cURL against port 9200.', command: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200', why: 'Tests REST API response.', expectedResult: '"tagline" : "You Know, for Search"' },
      ],
      verificationPrompt: 'Did Elasticsearch respond with cluster metadata?',
      expectedVerification: 'Yes, HTTP 200 with JSON payload.',
    },
    {
      id: 'lab-2-4',
      number: '2.4',
      title: 'Create a Security Telemetry Index',
      objective: 'Create a dedicated index called "soc-alerts-2026.09" via PUT request.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Create index with 1 primary shard and 0 replicas.',
          command: `curl -k -u elastic:YOUR_PASSWORD -X PUT "https://localhost:9200/soc-alerts-2026.09?pretty" -H "Content-Type: application/json" -d '{"settings":{"number_of_shards":1,"number_of_replicas":0}}'`,
          why: 'Creates the index structure without requiring multi-node replication.',
          expectedResult: '{\n  "acknowledged" : true,\n  "shards_acknowledged" : true,\n  "index" : "soc-alerts-2026.09"\n}',
        },
      ],
      verificationPrompt: 'Did the cluster acknowledge the index creation?',
      expectedVerification: '"acknowledged": true',
    },
    {
      id: 'lab-2-5',
      number: '2.5',
      title: 'Insert a Simulated Security Alert Document',
      objective: 'Index a JSON document simulating a port scan detection alert.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Insert document into "soc-alerts-2026.09".',
          command: `curl -k -u elastic:YOUR_PASSWORD -X POST "https://localhost:9200/soc-alerts-2026.09/_doc/1?pretty" -H "Content-Type: application/json" -d '{"@timestamp":"2026-09-18T14:30:00Z","source":{"ip":"<KALI_IP>","port":49212},"destination":{"ip":"<SIEM_IP>","port":22},"event":{"action":"port_scan","severity":3,"module":"suricata"},"message":"ET SCAN Potential Nmap SYN Scan Detected"}'`,
          why: 'Simulates document indexing like Logstash does.',
          expectedResult: '"result" : "created",\n  "_version" : 1',
        },
      ],
      verificationPrompt: 'Is the result "created"?',
      expectedVerification: '"result": "created"',
    },
    {
      id: 'lab-2-6',
      number: '2.6',
      title: 'Search Security Telemetry with Query DSL',
      objective: 'Perform a match query to search for the Nmap alert by signature.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Search for events where message matches Nmap.',
          command: `curl -k -u elastic:YOUR_PASSWORD -X GET "https://localhost:9200/soc-alerts-2026.09/_search?pretty" -H "Content-Type: application/json" -d '{"query":{"match":{"message":"Nmap"}}}'`,
          why: 'Tests Lucene full-text search capability.',
          expectedResult: '"hits" : { "total" : { "value" : 1, "relation" : "eq" }',
        },
      ],
      verificationPrompt: 'Did the search query return the indexed document?',
      expectedVerification: 'Yes, 1 hit returned matching the query.',
    },
    {
      id: 'lab-2-7',
      number: '2.7',
      title: 'Intentionally Break Configuration with Invalid YAML',
      objective: 'Simulate a real-world administrator error by introducing a syntax fault.',
      steps: [
        { stepNumber: 1, instruction: 'Add an invalid tab character or broken key in /etc/elasticsearch/elasticsearch.yml.', command: 'echo "invalid_tab_key:\tvalue" | sudo tee -a /etc/elasticsearch/elasticsearch.yml', why: 'Demonstrates YAML parser vulnerability.', expectedResult: 'Line appended.' },
        { stepNumber: 2, instruction: 'Restart Elasticsearch.', command: 'sudo systemctl restart elasticsearch', why: 'Triggers daemon boot failure.', expectedResult: 'Job for elasticsearch.service failed.' },
      ],
      verificationPrompt: 'Did systemctl report a service failure on restart?',
      expectedVerification: 'Yes, exit-code failure reported.',
    },
    {
      id: 'lab-2-8',
      number: '2.8',
      title: 'Troubleshoot Service Failure via Journalctl',
      objective: 'Use journalctl to pinpoint the YAML parsing fault and restore normal operation.',
      steps: [
        { stepNumber: 1, instruction: 'Inspect journalctl.', command: 'sudo journalctl -u elasticsearch -n 25 --no-pager | grep -i "invalid_tab_key\\|parser"', why: 'Locates exact failure line.', expectedResult: 'ParserException shown.' },
        { stepNumber: 2, instruction: 'Remove the invalid line.', command: 'sudo sed -i \'/invalid_tab_key/d\' /etc/elasticsearch/elasticsearch.yml', why: 'Repairs syntax.', expectedResult: 'Line deleted.' },
        { stepNumber: 3, instruction: 'Restart and verify.', command: 'sudo systemctl restart elasticsearch && sudo systemctl status elasticsearch', why: 'Restores service.', expectedResult: 'Active: active (running).' },
      ],
      verificationPrompt: 'Is Elasticsearch back online and healthy?',
      expectedVerification: 'Yes, active (running).',
    },
    {
      id: 'lab-2-9',
      number: '2.9',
      title: 'Investigate Disk Watermarks & Cluster Allocation',
      objective: 'Query cluster settings to inspect disk threshold watermarks.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Query cluster allocation explain API.',
          command: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200/_cluster/allocation/explain?pretty',
          why: 'Explains why any shard is unassigned or blocked.',
          expectedResult: 'Decisions list for disk and node allocation.',
        },
      ],
      verificationPrompt: 'Does the allocation explain API return decider status?',
      expectedVerification: 'Yes.',
    },
    {
      id: 'lab-2-10',
      number: '2.10',
      title: 'Explain Elasticsearch Architecture in Your Own Words',
      objective: 'Document the relationship between Cluster, Nodes, Indices, Shards, and Documents.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Formulate an architecture summary: A Cluster contains 1+ Nodes. Nodes host Shards (Lucene engines). Shards store Documents (JSON security events). Indices are logical groupings.',
          why: 'Reinforces core interview and operational concepts.',
          expectedResult: 'Conceptual mastery of Elastic terminology.',
        },
      ],
      verificationPrompt: 'Can you articulate the difference between an Index and a Shard?',
      expectedVerification: 'An Index is a logical namespace; a Shard is the physical Apache Lucene storage engine instance.',
    },
  ],
  challenges: [
    {
      id: 'chal-2-1',
      title: 'Identify the Configured HTTP Port',
      scenario: 'A former engineer configured Elasticsearch to bind to a non-standard port. You cannot reach port 9200.',
      question: 'Which Linux command searches listening TCP sockets specifically for the process named "java"?',
      hint: 'Combine ss with grep for java.',
      acceptedAnswers: ['ss -tulpn | grep java', 'sudo ss -tulpn | grep java', 'ss -tlpn | grep java', 'sudo ss -tlpn | grep java'],
      correctExplanation: '"sudo ss -tulpn | grep java" filters all listening sockets specifically to Java processes, exposing the exact port Elasticsearch bound to.',
      troubleshootingTip: 'Try using ss -tulpn in the terminal simulator.',
      commandSuggestion: 'sudo ss -tulpn | grep java',
    },
    {
      id: 'chal-2-2',
      title: 'Cluster Health API Path',
      scenario: 'You need to check if your cluster is Green or Yellow before deploying Logstash.',
      question: 'What is the exact REST API endpoint path to retrieve cluster health status?',
      hint: 'It begins with an underscore: /_cluster/...',
      acceptedAnswers: ['/_cluster/health', '_cluster/health', 'https://localhost:9200/_cluster/health', 'http://localhost:9200/_cluster/health'],
      correctExplanation: 'The endpoint /_cluster/health returns the cluster status (green/yellow/red), node count, and active shard count.',
      troubleshootingTip: 'Append ?pretty to format the JSON response nicely.',
      commandSuggestion: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200/_cluster/health?pretty',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-2-1',
      question: 'What does a cluster health status of "YELLOW" mean in Elasticsearch?',
      options: [
        'A critical database corruption occurred and data is permanently lost.',
        'All primary shards are allocated and operational, but one or more replica shards cannot be assigned (common in single-node labs).',
        'Elasticsearch is running out of disk space.',
        'The superuser password has expired.',
      ],
      correctIndex: 1,
      explanation: 'In a single-node lab, there is only 1 machine. Elasticsearch cannot allocate replica shards on the same node where primary shards live. All primaries are 100% active, so queries and indexing work perfectly, but health is Yellow.',
    },
    {
      id: 'quiz-2-2',
      question: 'Why is setting "discovery.type: single-node" crucial in /etc/elasticsearch/elasticsearch.yml for a home lab?',
      options: [
        'It speeds up indexing by 500%.',
        'It prevents Elasticsearch from performing multi-node cluster quorum checks on boot, allowing it to safely start on a single machine.',
        'It disables user password requirements.',
        'It switches the storage engine to SQLite.',
      ],
      correctIndex: 1,
      explanation: 'By default, binding to any public IP forces production cluster discovery mode. Setting "discovery.type: single-node" tells Elasticsearch it is running standalone and does not need other nodes to elect a master.',
    },
    {
      id: 'quiz-2-3',
      question: 'What is the default HTTP REST API port used by Elasticsearch?',
      options: ['5044', '5601', '9200', '9300'],
      correctIndex: 2,
      explanation: 'Port 9200 is the HTTP REST API port. Port 9300 is internal cluster transport, 5044 is Logstash Beats input, and 5601 is Kibana.',
    },
  ],
  interviewQuestions: [
    {
      question: 'Explain the difference between an Index, a Document, and a Shard in Elasticsearch.',
      modelAnswer:
        'A Document is an individual JSON object representing a single event (e.g., a Suricata alert). An Index is a logical collection of documents with similar characteristics (analogous to a SQL table). A Shard is the underlying physical storage unit: an individual, fully functional Apache Lucene instance that runs on a node. An Index is divided into one or more Shards to allow horizontal scaling across nodes.',
      keyPoints: ['Document: JSON record', 'Index: Logical namespace', 'Shard: Physical Lucene instance', 'Replicas: High availability copies'],
    },
    {
      question: 'A junior analyst reports that Elasticsearch is running, but curl queries to port 9200 from a remote machine fail with "Connection Refused". What would you investigate?',
      modelAnswer:
        '1) First, check "network.host" in /etc/elasticsearch/elasticsearch.yml. If it is set to "localhost" or "127.0.0.1", it only listens locally. It must be set to "0.0.0.0" or the LAN IP to accept remote connections. 2) Check socket listeners with "sudo ss -tulpn | grep 9200". If it says "127.0.0.1:9200", remote packets are dropped by the kernel. 3) If it says "0.0.0.0:9200", check host firewall rules: "sudo ufw status" to ensure port 9200 is not blocked.',
      keyPoints: ['network.host in elasticsearch.yml', 'Socket listening address via ss', 'UFW / iptables host firewall rules'],
    },
  ],
  checklist: [
    { id: 'chk-2-1', label: 'Elasticsearch 8.x package installed', verifyCommand: 'dpkg -l | grep elasticsearch' },
    { id: 'chk-2-2', label: 'elasticsearch.yml configured (cluster.name, network.host, discovery.type: single-node)', verifyCommand: 'sudo grep -E "network.host|discovery.type" /etc/elasticsearch/elasticsearch.yml' },
    { id: 'chk-2-3', label: 'Elastic superuser password set and recorded', verifyCommand: 'echo "Password confirmed in lab notes"' },
    { id: 'chk-2-4', label: 'Service enabled and active (running)', verifyCommand: 'sudo systemctl is-active elasticsearch' },
    { id: 'chk-2-5', label: 'Port 9200 listening on 0.0.0.0', verifyCommand: 'sudo ss -tulpn | grep 9200' },
    { id: 'chk-2-6', label: 'Root REST endpoint returns HTTP 200 with cluster metadata', verifyCommand: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200' },
    { id: 'chk-2-7', label: 'Cluster health is green or yellow', verifyCommand: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200/_cluster/health' },
  ],
};
