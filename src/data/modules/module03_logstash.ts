import { ModuleData } from '../../types/socMasterLab';

export const module03Logstash: ModuleData = {
  id: 'logstash',
  moduleNumber: '03',
  title: 'Logstash Data Processing Pipeline',
  tagline: 'Build, test, and run the event parsing pipeline that ingests Beats logs, transforms metadata, and indexes into Elasticsearch.',
  badge: 'ETL Pipeline',
  level: 'Level 2: SIEM Stack',
  estimatedMinutes: 50,
  overview: {
    whatIsIt:
      'Logstash is an open-source, server-side data processing pipeline that ingests data from a multitude of sources simultaneously, transforms it through filters, and sends it to your preferred "stash" (Elasticsearch).',
    whyDoWeNeedIt:
      'Raw security logs arrive in various formats: Syslog RFC 5424, Apache combined, Windows EVTX XML, and Suricata EVE JSON. Without parsing and standardization, queries in Elasticsearch are messy and slow. Logstash parses unstructured logs into structured JSON, enriches IP addresses with GeoIP, and normalizes field names to the Elastic Common Schema (ECS).',
    problemSolved:
      'Bridges raw telemetry formats into consistent, searchable schema fields; shields Elasticsearch from traffic spikes via internal queuing; and applies complex conditionals and grok patterns before documents hit the disk.',
    architectureRole:
      'Receives streaming Beats connections over TCP port 5044, parses and decorates event fields in memory, and writes bulk batches to Elasticsearch over HTTP port 9200.',
    diagramText: `[Filebeat Agent]
       │
       ▼ (TCP Port 5044 - Lumbar protocol)
┌────────────────────────────────────────────────────────┐
│                   LOGSTASH PIPELINE                    │
│                                                        │
│  [INPUT]   beats { port => 5044 }                      │
│     │                                                  │
│     ▼                                                  │
│  [FILTER]  json / grok / mutate / geoip / date         │
│     │                                                  │
│     ▼                                                  │
│  [OUTPUT]  elasticsearch { hosts => ["localhost:9200"] │
│                            index => "suricata-%{+YYYY.MM.dd}" }
└────────────────────────────────────────────────────────┘
       │
       ▼ (HTTP Port 9200 REST bulk API)
[Elasticsearch Node]`,
  },
  prerequisites: [
    'Completed Module 01 (Host prerequisites, Java 17 installed and verified)',
    'Completed Module 02 (Elasticsearch running and healthy on port 9200)',
    'Port 5044 free and not occupied by other services',
    'At least 2 GB RAM allocated for Logstash JVM heap',
  ],
  importantPorts: [
    {
      component: 'Logstash Beats Input Listener',
      port: 5044,
      protocol: 'TCP',
      purpose: 'Accepts incoming log streams from Filebeat and other Elastic Beats agents',
      configFile: '/etc/logstash/conf.d/01-beats.conf',
      verificationCommand: 'sudo ss -tulpn | grep 5044',
      troubleshootingCommands: [
        'sudo nc -zv localhost 5044',
        'sudo journalctl -u logstash -n 50 --no-pager',
      ],
      relatedComponents: ['Filebeat', 'Metricbeat', 'Packetbeat'],
    },
  ],
  configurationFile: {
    path: '/etc/logstash/conf.d/01-beats.conf',
    component: 'Logstash Beats Pipeline Definition',
    purpose: 'Defines the Beats input listener, JSON/EVE parser filter, and Elasticsearch output indexing destination',
    whatItControls: 'Ingest port, protocol decompression, event field transformations, and destination index pattern',
    parameters: [
      { key: 'input.beats.port', value: '5044', purpose: 'TCP port Logstash listens on for Filebeat agents', safeDefault: '5044' },
      { key: 'filter.json.source', value: 'message', purpose: 'Parses raw string messages into structured JSON keys', safeDefault: 'message' },
      { key: 'output.elasticsearch.hosts', value: '["http://localhost:9200"]', purpose: 'Elasticsearch cluster URL to send parsed batches', safeDefault: '["http://localhost:9200"]' },
      { key: 'output.elasticsearch.index', value: 'soc-suricata-%{+YYYY.MM.dd}', purpose: 'Dynamic daily index naming pattern', safeDefault: 'soc-suricata-%{+YYYY.MM.dd}' },
      { key: 'output.elasticsearch.user', value: 'elastic', purpose: 'Username for Elasticsearch authentication', safeDefault: 'elastic' },
      { key: 'output.elasticsearch.password', value: 'YOUR_PASSWORD', purpose: 'Superuser password for Elasticsearch', safeDefault: 'YOUR_PASSWORD' },
    ],
    safeSnippet: `# ========================= Logstash Ingest Pipeline =========================
input {
  beats {
    port => 5044
  }
}

filter {
  # If the event comes from Suricata eve.json, parse the JSON payload
  if [event][module] == "suricata" or [fields][log_type] == "suricata" {
    json {
      source => "message"
      target => "suricata"
    }
  }

  # Tag all incoming SOC pipeline events with metadata
  mutate {
    add_field => { "[@metadata][pipeline]" => "soc-master-lab" }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    user => "elastic"
    password => "YOUR_PASSWORD"
    index => "soc-telemetry-%{+YYYY.MM.dd}"
    ssl_certificate_verification => false
  }
}`,
    nanoCommand: 'sudo nano /etc/logstash/conf.d/01-beats.conf',
    validationCommand: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
    commonErrors: [
      'Missing closing bracket or quote in 01-beats.conf causes pipeline compilation abort.',
      'Specifying wrong Elasticsearch password results in HTTP 401 response loop in Logstash logs.',
      'Port 5044 already bound by another daemon or an old Logstash instance.',
    ],
  },
  serviceManagement: {
    serviceName: 'logstash',
    startCommand: 'sudo systemctl start logstash',
    stopCommand: 'sudo systemctl stop logstash',
    restartCommand: 'sudo systemctl restart logstash',
    enableCommand: 'sudo systemctl enable logstash',
    statusCommand: 'sudo systemctl status logstash',
    logsCommand: 'sudo journalctl -u logstash -n 50 --no-pager',
    explanation:
      'Logstash takes 20-40 seconds to spin up its JRuby virtual machine and compile pipeline configurations. Always test configurations with "--config.test_and_exit" before restarting the service.',
  },
  installationSteps: [
    {
      id: 'ls-inst-1',
      command: 'sudo apt update && sudo apt install -y logstash',
      description: 'Install Logstash from the Elastic repository',
      whyThisCommand:
        'Installs the Logstash pipeline runner into /usr/share/logstash, creates configuration folders in /etc/logstash, and creates the "logstash" system user.',
      expectedOutput: `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  logstash
Unpacking logstash (8.12.2) ...
Setting up logstash (8.12.2) ...`,
      whatOutputMeans: 'Logstash binary distribution installed successfully.',
      requiresSudo: true,
    },
    {
      id: 'ls-inst-2',
      command: 'sudo nano /etc/logstash/conf.d/01-beats.conf',
      description: 'Create the primary Beats-to-Elasticsearch pipeline configuration',
      whyThisCommand:
        'Logstash has no default active pipelines out-of-the-box. We must declare an input listener (beats port 5044), processing filters, and an output destination (Elasticsearch 9200).',
      expectedOutput: `(Nano editor opens /etc/logstash/conf.d/01-beats.conf)`,
      whatOutputMeans: 'Ready to paste pipeline configuration.',
      commonMistake: 'Leaving placeholder "YOUR_PASSWORD" without replacing it with your real Elasticsearch password.',
      troubleshooting: 'Use Nano shortcuts: Ctrl+O to save, Enter, Ctrl+X to exit.',
      requiresSudo: true,
    },
    {
      id: 'ls-inst-3',
      command: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
      description: 'Test and validate pipeline syntax without starting the background service',
      whyThisCommand:
        'Prevents broken configs from being loaded by systemd. The --config.test_and_exit flag compiles the Ruby AST and outputs "Configuration OK" if syntax is flawless.',
      expectedOutput: `Sending Logstash logs to /var/log/logstash which is now configured via log4j2.properties
[2026-09-18T14:15:10,212][INFO ][logstash.javapipeline    ] Pipeline ` + "`main`" + ` test_and_exit successful
Configuration OK`,
      whatOutputMeans: 'The pipeline configuration syntax is 100% valid and ready for production.',
      commonMistake: 'Running the command as regular user without read access to /etc/logstash/conf.d/.',
      troubleshooting: 'Prepend "sudo" to ensure permission to read config files.',
      requiresSudo: true,
    },
    {
      id: 'ls-inst-4',
      command: 'sudo systemctl enable logstash && sudo systemctl start logstash',
      description: 'Enable Logstash on system boot and start the daemon',
      whyThisCommand:
        'Starts the JRuby JVM process and begins listening on TCP port 5044 for Filebeat packets.',
      expectedOutput: `Created symlink /etc/systemd/system/multi-user.target.wants/logstash.service → /lib/systemd/system/logstash.service.`,
      whatOutputMeans: 'Service enabled and background startup initiated.',
      commonMistake: 'Checking status immediately within 5 seconds. Logstash requires 30-40 seconds to bind port 5044.',
      troubleshooting: 'Wait 30 seconds before running ss -tulpn.',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'ls-v-1',
      command: 'sudo systemctl status logstash',
      description: 'Check systemd service status',
      whyThisCommand: 'Validates that Logstash is in "active (running)" state.',
      expectedOutput: `● logstash.service - logstash
     Loaded: loaded (/lib/systemd/system/logstash.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-09-18 14:18:22 UTC; 48s ago
   Main PID: 4521 (java)`,
      whatOutputMeans: 'Logstash daemon is running.',
    },
    {
      id: 'ls-v-2',
      command: 'sudo ss -tulpn | grep 5044',
      description: 'Verify Logstash is actively listening on Beats TCP port 5044',
      whyThisCommand: 'Proves the pipeline input plugin successfully initialized the TCP socket.',
      expectedOutput: `tcp   LISTEN 0      128          0.0.0.0:5044       0.0.0.0:*    users:(("java",pid=4521,fd=102))`,
      whatOutputMeans: 'Port 5044 is open and ready to accept connections from Filebeat.',
    },
    {
      id: 'ls-v-3',
      command: 'nc -zv localhost 5044',
      description: 'Test TCP three-way handshake connectivity to port 5044',
      whyThisCommand: 'Netcat (nc) tests network connectivity to verify the socket accepts inbound SYNs.',
      expectedOutput: `Connection to localhost 5044 port [tcp/*] succeeded!`,
      whatOutputMeans: 'TCP socket connection was accepted immediately.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/logstash/logstash-plain.log',
    inspectionCommands: [
      {
        id: 'ls-log-1',
        command: 'sudo tail -n 50 /var/log/logstash/logstash-plain.log',
        description: 'Read the active Logstash application log',
        whyThisCommand: 'Inspects pipeline execution status, worker counts, and batch submission states.',
      },
      {
        id: 'ls-log-2',
        command: 'sudo journalctl -u logstash -n 50 --no-pager',
        description: 'Read systemd logs for Logstash startup crashes',
        whyThisCommand: 'Finds JVM launch errors or missing Java dependencies.',
      },
    ],
    keyLogPatterns: [
      { pattern: 'Pipeline started {"pipeline.id"=>"main"}', meaning: 'Pipeline successfully initialized and listening for events.' },
      { pattern: 'Beats input: Starting input listener {:address=>"0.0.0.0:5044"}', meaning: 'TCP 5044 server is open.' },
      { pattern: 'Response code 401', meaning: 'Elasticsearch output rejected credentials (bad password).' },
    ],
  },
  commonErrors: [
    {
      id: 'ls-err-1',
      title: 'Error 1 — Pipeline Configuration Syntax Failure',
      symptom: 'Logstash exits immediately: "Expected one of #, {, } at line X, column Y".',
      whyItHappens: 'A missing closing bracket or misspelled plugin name in /etc/logstash/conf.d/01-beats.conf.',
      howToIdentify: 'Run configuration test command to print the syntax line error.',
      diagnosticCommand: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
      expectedErrorOutput: 'Expected one of #, input, filter, output at line 14, column 1 (byte 245)',
      fixExplanation: 'Open the file in Nano and verify all open braces "{" have matching closing braces "}".',
      fixCommand: 'sudo nano /etc/logstash/conf.d/01-beats.conf',
      verificationCommand: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
      verificationOutput: 'Configuration OK',
    },
    {
      id: 'ls-err-2',
      title: 'Error 2 — Port 5044 Already in Use (BindException)',
      symptom: 'Logstash logs show: "Address already in use - bind - Address already in use: 5044".',
      whyItHappens: 'An earlier standalone Logstash test process is still running in the background.',
      howToIdentify: 'Use ss to find which process owns port 5044.',
      diagnosticCommand: 'sudo ss -tulpn | grep 5044',
      expectedErrorOutput: 'tcp LISTEN 0 128 0.0.0.0:5044 users:(("java",pid=3882,fd=98))',
      fixExplanation: 'Kill the orphaned PID and restart the logstash service.',
      fixCommand: 'sudo kill -9 3882 && sudo systemctl restart logstash',
      verificationCommand: 'sudo systemctl status logstash',
      verificationOutput: 'Active: active (running)',
    },
    {
      id: 'ls-err-3',
      title: 'Error 3 — Elasticsearch Connection Refused (Port 9200 Down)',
      symptom: 'Logstash logs: "Attempted to resurrect connection to dead ES instance, but got error -> Connection refused".',
      whyItHappens: 'Elasticsearch service is stopped or port 9200 is unreachable.',
      howToIdentify: 'Test Elasticsearch availability with curl.',
      diagnosticCommand: 'curl -I http://localhost:9200',
      expectedErrorOutput: 'curl: (7) Failed to connect to localhost port 9200: Connection refused',
      fixExplanation: 'Start the Elasticsearch service and verify port 9200 is listening.',
      fixCommand: 'sudo systemctl start elasticsearch',
      verificationCommand: 'sudo ss -tulpn | grep 9200',
      verificationOutput: 'tcp LISTEN ... 0.0.0.0:9200',
    },
    {
      id: 'ls-err-4',
      title: 'Error 4 — Elasticsearch HTTP 401 Unauthorized',
      symptom: 'Logstash logs: "[WARN ][logstash.outputs.elasticsearch] Got response code \'401\' contacting Elasticsearch".',
      whyItHappens: 'The password defined in the output block of 01-beats.conf does not match the elastic user password.',
      howToIdentify: 'Inspect Logstash log for 401 responses.',
      diagnosticCommand: 'sudo grep -i "401" /var/log/logstash/logstash-plain.log',
      expectedErrorOutput: 'Response code 401 contacting Elasticsearch at http://localhost:9200',
      fixExplanation: 'Update the "password" parameter in /etc/logstash/conf.d/01-beats.conf to match the real elastic superuser password.',
      fixCommand: 'sudo nano /etc/logstash/conf.d/01-beats.conf',
      verificationCommand: 'sudo systemctl restart logstash && sudo tail -n 25 /var/log/logstash/logstash-plain.log',
      verificationOutput: 'Pipeline started {"pipeline.id"=>"main"}',
    },
    {
      id: 'ls-err-5',
      title: 'Error 5 — Pipeline Failed to Start (Heap Out of Memory)',
      symptom: 'Logstash terminates with: "java.lang.OutOfMemoryError: Java heap space".',
      whyItHappens: 'Logstash default JVM heap exceeds available server RAM or is set too low for intense pipelines.',
      howToIdentify: 'Check /etc/logstash/jvm.options for -Xms and -Xmx values.',
      diagnosticCommand: 'cat /etc/logstash/jvm.options | grep -E "^-Xm"',
      expectedErrorOutput: '-Xms4g\n-Xmx4g',
      fixExplanation: 'Adjust heap to 1GB or 2GB in /etc/logstash/jvm.options to fit within host memory.',
      fixCommand: 'sudo sed -i \'s/^-Xms.*/-Xms1g/\' /etc/logstash/jvm.options && sudo sed -i \'s/^-Xmx.*/-Xmx1g/\' /etc/logstash/jvm.options',
      verificationCommand: 'sudo systemctl restart logstash && sudo systemctl status logstash',
      verificationOutput: 'Active: active (running)',
    },
    {
      id: 'ls-err-6',
      title: 'Error 6 — Grok Parsing Failure (_grokparsefailure tag)',
      symptom: 'Events in Elasticsearch contain the tag "_grokparsefailure" and message is unparsed.',
      whyItHappens: 'The grok regular expression pattern does not match the format of the incoming log text.',
      howToIdentify: 'Inspect the tags field in Elasticsearch document query.',
      diagnosticCommand: 'curl -k -u elastic:YOUR_PASSWORD "https://localhost:9200/soc-telemetry-*/_search?q=tags:_grokparsefailure&pretty"',
      expectedErrorOutput: '"tags" : [ "_grokparsefailure" ]',
      fixExplanation: 'Test your grok pattern against the raw log using the Kibana Grok Debugger tool and adjust patterns.',
      fixCommand: 'echo "Verify pattern matching using grok debugger"',
      verificationCommand: 'echo "Pipeline regex verified"',
      verificationOutput: 'Pipeline regex verified',
    },
    {
      id: 'ls-err-7',
      title: 'Error 7 — Permission Denied on Configuration Directory',
      symptom: 'Logstash fails with: "java.io.FileNotFoundException: /etc/logstash/conf.d/01-beats.conf (Permission denied)".',
      whyItHappens: 'Configuration file was created with root 0600 permissions, preventing the "logstash" user from reading it.',
      howToIdentify: 'Inspect file permissions.',
      diagnosticCommand: 'ls -la /etc/logstash/conf.d/01-beats.conf',
      expectedErrorOutput: '-rw------- 1 root root 824 /etc/logstash/conf.d/01-beats.conf',
      fixExplanation: 'Grant read permissions to group and others, or chown to logstash:logstash.',
      fixCommand: 'sudo chmod 644 /etc/logstash/conf.d/01-beats.conf && sudo chown -R logstash:logstash /etc/logstash/conf.d',
      verificationCommand: 'sudo systemctl restart logstash && sudo systemctl status logstash',
      verificationOutput: 'Active: active (running)',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-3-1',
      number: '3.1',
      title: 'Validate Logstash Pipeline Configuration',
      objective: 'Run logstash with --config.test_and_exit to verify pipeline logic before deploying.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Execute config test command.',
          command: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
          why: 'Prevents service crashes caused by syntax mistakes.',
          expectedResult: 'Configuration OK',
        },
      ],
      verificationPrompt: 'Did Logstash output "Configuration OK"?',
      expectedVerification: 'Configuration OK',
    },
    {
      id: 'lab-3-2',
      number: '3.2',
      title: 'Verify Port 5044 Listener and Test Socket',
      objective: 'Verify Logstash is bound to port 5044 and test TCP connection.',
      steps: [
        { stepNumber: 1, instruction: 'Check socket listener.', command: 'sudo ss -tulpn | grep 5044', why: 'Confirms Beats port is open.', expectedResult: 'LISTEN on 0.0.0.0:5044.' },
        { stepNumber: 2, instruction: 'Test TCP handshake with netcat.', command: 'nc -zv localhost 5044', why: 'Validates three-way handshake.', expectedResult: 'Connection succeeded.' },
      ],
      verificationPrompt: 'Does netcat report connection succeeded?',
      expectedVerification: 'Connection to localhost 5044 port succeeded!',
    },
  ],
  challenges: [
    {
      id: 'chal-3-1',
      title: 'Logstash Pipeline Test Flag',
      scenario: 'You modified /etc/logstash/conf.d/01-beats.conf and want to verify syntax without starting the daemon.',
      question: 'Which Logstash command line flag tests configuration files and exits immediately?',
      hint: 'It starts with --config.',
      acceptedAnswers: ['--config.test_and_exit', '-t', '--config.test_and_exit=true'],
      correctExplanation: 'The flag "--config.test_and_exit" compiles the configuration file and terminates with code 0 if syntax is valid.',
      troubleshootingTip: 'Try running sudo /usr/share/logstash/bin/logstash --help.',
      commandSuggestion: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit',
    },
    {
      id: 'chal-3-2',
      title: 'Standard Beats Input Port',
      scenario: 'Filebeat on a remote Linux server cannot reach Logstash because the firewall is blocking the Beats input port.',
      question: 'What is the standard TCP port number used by Logstash Beats input plugin?',
      hint: 'It is a 4-digit port beginning with 50..',
      acceptedAnswers: ['5044', 'tcp 5044', 'port 5044'],
      correctExplanation: 'TCP port 5044 is the standard, universally recognized port for Elastic Beats input in Logstash.',
      troubleshootingTip: 'Check 01-beats.conf input block.',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-3-1',
      question: 'What are the three core processing stages of a Logstash pipeline?',
      options: [
        'Collect, Store, Delete',
        'Input, Filter, Output',
        'Ingest, Index, Search',
        'Extract, Load, Replicate',
      ],
      correctIndex: 1,
      explanation: 'Logstash pipelines are strictly structured into: INPUT (where data originates), FILTER (how data is transformed/parsed), and OUTPUT (where data is sent).',
    },
    {
      id: 'quiz-3-2',
      question: 'Why is it advantageous to place Logstash between Filebeat and Elasticsearch in an enterprise SOC?',
      options: [
        'Because Filebeat cannot connect to Elasticsearch directly.',
        'Because Logstash allows complex grok pattern parsing, GeoIP enrichment, metadata tagging, and buffering that lightweight shippers cannot perform.',
        'Because Logstash replaces the need for Kibana.',
        'Because Logstash encrypts hard drives.',
      ],
      correctIndex: 1,
      explanation: 'Filebeat is lightweight and designed solely for fast shipping without consuming CPU on edge hosts. Logstash runs heavy parsing, IP enrichment, and schema translation centralized on the SIEM server.',
    },
  ],
  interviewQuestions: [
    {
      question: 'Explain the purpose and function of the Logstash Grok filter.',
      modelAnswer:
        'Grok is a Logstash filter plugin that parses arbitrary unstructured log strings into structured, queryable JSON fields using regular expression pattern matching. It uses reusable syntax macros like %{IP:client_ip} or %{TIMESTAMP_ISO8601:timestamp}. For example, it transforms a raw SSH failure message into structured fields {"src_ip": "192.168.1.100", "user": "root", "auth_result": "failed"}, enabling fast aggregations in Elasticsearch.',
      keyPoints: ['Regex-based log parsing', 'Built-in pattern macros', 'Transforms unstructured text to structured JSON', 'Generates _grokparsefailure if mismatched'],
    },
    {
      question: 'How do you diagnose why Logstash is running but no documents are appearing in Elasticsearch?',
      modelAnswer:
        'I follow the pipeline flow: 1) Verify Filebeat is actively connecting to port 5044 using "ss -tulpn | grep 5044". 2) Check Logstash logs in /var/log/logstash/logstash-plain.log for pipeline worker errors or HTTP 401/403/500 responses from Elasticsearch. 3) Inspect Elasticsearch cluster health and check if the expected index pattern (e.g., soc-telemetry-*) was created using "curl -k -u elastic:pass https://localhost:9200/_cat/indices". 4) Check for disk watermark limits in Elasticsearch that block writes.',
      keyPoints: ['Check port 5044 connection', 'Check Logstash logs for HTTP errors', 'Check Elasticsearch indices with _cat/indices', 'Verify disk watermark status'],
    },
  ],
  checklist: [
    { id: 'chk-3-1', label: 'Logstash package installed', verifyCommand: 'dpkg -l | grep logstash' },
    { id: 'chk-3-2', label: '01-beats.conf created with Input, Filter, and Output blocks', verifyCommand: 'test -f /etc/logstash/conf.d/01-beats.conf && echo "EXISTS"' },
    { id: 'chk-3-3', label: 'Pipeline syntax tested with --config.test_and_exit', verifyCommand: 'sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/01-beats.conf --config.test_and_exit' },
    { id: 'chk-3-4', label: 'Logstash service enabled and active (running)', verifyCommand: 'sudo systemctl is-active logstash' },
    { id: 'chk-3-5', label: 'TCP port 5044 listening for Beats connections', verifyCommand: 'sudo ss -tulpn | grep 5044' },
    { id: 'chk-3-6', label: 'Successful TCP handshake verified via netcat', verifyCommand: 'nc -zv localhost 5044' },
  ],
};
