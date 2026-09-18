import { ModuleData } from '../../types/socMasterLab';

export const module07HardenVerify: ModuleData = {
  id: 'harden-verify',
  moduleNumber: '07',
  title: 'Harden & Stack-Wide Verification',
  tagline: 'Audit all listening sockets, lock down UFW firewall rules, harden SSH, and execute an end-to-end stack verification audit.',
  badge: 'Security Hardening',
  level: 'Level 3: SOC Detection',
  estimatedMinutes: 45,
  overview: {
    whatIsIt:
      'The Hardening and Verification phase conducts a holistic security audit of our entire SIEM appliance. We verify that all 5 pipeline components (Suricata, Filebeat, Logstash, Elasticsearch, Kibana) are active and communicating, lock down host firewall rules (UFW), harden SSH remote administration, and implement defense-in-depth principles.',
    whyDoWeNeedIt:
      'A monitoring server is one of the highest-value targets for an adversary. If an attacker compromises the SIEM server, they can tamper with audit trails, delete intrusion alerts, and blind the security operations center. Furthermore, exposing Elasticsearch unauthenticated to the public internet leads to automated ransomware wipe attacks.',
    problemSolved:
      'Eliminates unauthorized network access to sensitive databases (port 9200); blocks brute-force password spraying on SSH (port 22); verifies disk and memory thresholds; and confirms continuous end-to-end log telemetry flow.',
    architectureRole:
      'Wraps a hardened defensive perimeter (UFW firewall + SSH key-only auth + least privilege) around all five pipeline services and confirms stack synchronization.',
    diagramText: `[Untrusted External Network / Internet]
                   │
                   ▼ (UFW Firewall Perimeter)
┌──────────────────────────────────────────────────────────────┐
│  [ALLOWED]                                                   │
│    ├── Port 22/tcp: SSH (Key-based auth only)                │
│    ├── Port 5044/tcp: Beats Ingest (from authorized subnets) │
│    └── Port 5601/tcp: Kibana Web (Restricted to SOC VPN)     │
│                                                              │
│  [BLOCKED / LOCALHOST ONLY]                                  │
│    └── Port 9200/tcp: Elasticsearch (NEVER exposed to WAN!)  │
└──────────────────────────────────────────────────────────────┘`,
  },
  prerequisites: [
    'Completed Modules 01 through 06',
    'All services installed: Elasticsearch, Logstash, Kibana, Filebeat, Suricata',
    'Root / sudo privileges to configure UFW firewall and SSH daemon',
  ],
  importantPorts: [
    {
      component: 'SSH Hardened Administration',
      port: 22,
      protocol: 'TCP',
      purpose: 'Remote access locked to key-based auth and rate-limited',
      configFile: '/etc/ssh/sshd_config',
      verificationCommand: 'sudo sshd -t',
      troubleshootingCommands: ['sudo systemctl status ssh', 'sudo journalctl -u ssh -n 25'],
      relatedComponents: ['Host OS'],
    },
    {
      component: 'Elasticsearch Protected Listener',
      port: 9200,
      protocol: 'HTTPS',
      purpose: 'Strictly restricted to localhost or internal cluster network; blocked from public WAN',
      configFile: '/etc/elasticsearch/elasticsearch.yml',
      verificationCommand: 'sudo ufw status verbose | grep 9200',
      troubleshootingCommands: ['sudo ufw status numbered'],
      relatedComponents: ['Logstash', 'Kibana'],
    },
  ],
  configurationFile: {
    path: '/etc/ssh/sshd_config',
    component: 'OpenSSH Server Hardening',
    purpose: 'Disables root login, disables password authentication (forces SSH keys), and limits authentication attempts',
    whatItControls: 'PermitRootLogin, PasswordAuthentication, MaxAuthTries, and ClientAliveInterval',
    parameters: [
      { key: 'PermitRootLogin', value: 'no', purpose: 'Prevents direct root logins over SSH', safeDefault: 'no' },
      { key: 'PasswordAuthentication', value: 'no', purpose: 'Disables password brute force; requires ed25519 or RSA keys', safeDefault: 'no' },
      { key: 'MaxAuthTries', value: '3', purpose: 'Drops connection after 3 failed attempts to thwart dictionary attacks', safeDefault: '3' },
    ],
    safeSnippet: `# ========================= Hardened OpenSSH Configuration =========================
Port 22
Protocol 2

# Authentication Hardening
PermitRootLogin no
PasswordAuthentication yes # Set to no after public key is copied!
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30

# Session idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Logging
LogLevel VERBOSE`,
    nanoCommand: 'sudo nano /etc/ssh/sshd_config',
    validationCommand: 'sudo sshd -t',
    commonErrors: [
      'Disabling PasswordAuthentication before copying your public SSH key locks you out permanently.',
      'Always test SSH configuration with "sudo sshd -t" before restarting sshd.',
    ],
  },
  serviceManagement: {
    serviceName: 'ufw',
    startCommand: 'sudo ufw enable',
    stopCommand: 'sudo ufw disable',
    restartCommand: 'sudo ufw reload',
    enableCommand: 'sudo systemctl enable ufw',
    statusCommand: 'sudo ufw status verbose',
    logsCommand: 'sudo dmesg | grep "[UFW BLOCK]"',
    explanation:
      'Uncomplicated Firewall (UFW) manages iptables/nftables netfilter rules. Before enabling UFW, you MUST explicitly allow SSH port 22, otherwise you will sever your remote connection immediately!',
  },
  installationSteps: [
    {
      id: 'hrd-1',
      command: 'sudo ufw default deny incoming && sudo ufw default allow outgoing',
      description: 'Set default firewall policy to deny all inbound and allow outbound',
      whyThisCommand:
        'Follows the principle of least privilege. Any port not explicitly whitelisted is dropped silently.',
      expectedOutput: `Default incoming policy changed to 'deny'
(be sure to update your rules accordingly)
Default outgoing policy changed to 'allow'
(be sure to update your rules accordingly)`,
      whatOutputMeans: 'Baseline zero-trust firewall policy established.',
      requiresSudo: true,
    },
    {
      id: 'hrd-2',
      command: 'sudo ufw allow 22/tcp comment "SSH Remote Admin" && sudo ufw allow 5601/tcp comment "Kibana Web UI" && sudo ufw allow 5044/tcp comment "Logstash Beats Ingest"',
      description: 'Explicitly allow only required management and log shipping ports',
      whyThisCommand:
        'Only permits SSH (22), Kibana (5601), and Beats (5044). Port 9200 (Elasticsearch) is intentionally NOT allowed, preventing direct public exposure.',
      expectedOutput: `Rules updated
Rules updated (v6)
Rules updated
Rules updated (v6)
Rules updated
Rules updated (v6)`,
      whatOutputMeans: 'Firewall rules added for ports 22, 5601, and 5044.',
      requiresSudo: true,
    },
    {
      id: 'hrd-3',
      command: 'sudo ufw enable',
      description: 'Activate the firewall enforcement rules',
      whyThisCommand: 'Applies the iptables filtering rules immediately.',
      expectedOutput: `Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup`,
      whatOutputMeans: 'UFW is active and filtering all packets.',
      requiresSudo: true,
    },
    {
      id: 'hrd-4',
      command: 'sudo sshd -t && sudo systemctl restart ssh',
      description: 'Validate SSH configuration syntax and restart the SSH daemon',
      whyThisCommand:
        '"sshd -t" tests syntax. If zero errors are reported, it is safe to restart the SSH daemon.',
      expectedOutput: `(No output on success)`,
      whatOutputMeans: 'SSH configuration verified and daemon restarted.',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'hrd-v-1',
      command: 'sudo ss -tulpn',
      description: 'Stack-wide socket audit of all listening processes',
      whyThisCommand: 'Verify all 4 core ports (22, 9200, 5044, 5601) are active simultaneously.',
      expectedOutput: `Netid  State   Local Address:Port   Process
tcp    LISTEN  0.0.0.0:22           users:(("sshd",pid=...))
tcp    LISTEN  0.0.0.0:5044         users:(("java",pid=...,fd=...))
tcp    LISTEN  0.0.0.0:5601         users:(("node",pid=...,fd=...))
tcp    LISTEN  0.0.0.0:9200         users:(("java",pid=...,fd=...))`,
      whatOutputMeans: 'All 4 services are bound and listening.',
    },
    {
      id: 'hrd-v-2',
      command: 'for svc in suricata filebeat logstash elasticsearch kibana; do systemctl is-active --quiet $svc && echo "✓ $svc is RUNNING" || echo "✗ $svc is DOWN"; done',
      description: 'Batch status check across all 5 security pipeline daemons',
      whyThisCommand: 'Instantly checks if any component in the pipeline has crashed.',
      expectedOutput: `✓ suricata is RUNNING
✓ filebeat is RUNNING
✓ logstash is RUNNING
✓ elasticsearch is RUNNING
✓ kibana is RUNNING`,
      whatOutputMeans: '100% of pipeline daemons are healthy and active.',
    },
    {
      id: 'hrd-v-3',
      command: 'sudo ufw status verbose',
      description: 'Audit active firewall rules and policies',
      whyThisCommand: 'Verifies default deny incoming and confirms port 9200 is not exposed.',
      expectedOutput: `Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (SSH Remote Admin)  ALLOW IN    Anywhere
5601/tcp (Kibana Web UI)   ALLOW IN    Anywhere
5044/tcp (Logstash Beats)  ALLOW IN    Anywhere`,
      whatOutputMeans: 'Firewall is enforcing strict perimeter filtering.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/ufw.log',
    inspectionCommands: [
      {
        id: 'hrd-log-1',
        command: 'sudo tail -n 25 /var/log/ufw.log',
        description: 'Read blocked connection attempts logged by UFW',
        whyThisCommand: 'Detects unauthorized port scans and connection attempts dropped at the firewall.',
      },
      {
        id: 'hrd-log-2',
        command: 'sudo journalctl -u ssh -n 25 --no-pager | grep -i "failed"',
        description: 'Check for failed SSH login attempts in system logs',
        whyThisCommand: 'Identifies brute-force credential stuffing attacks against port 22.',
      },
    ],
    keyLogPatterns: [
      { pattern: '[UFW BLOCK]', meaning: 'Packet was dropped by firewall default deny rule.' },
      { pattern: 'Failed password for invalid user', meaning: 'Remote host attempted SSH login with non-existent account.' },
      { pattern: 'Accepted publickey for', meaning: 'Legitimate analyst authenticated via SSH key.' },
    ],
  },
  commonErrors: [
    {
      id: 'hrd-err-1',
      title: 'Accidental SSH Lockout during UFW Enable',
      symptom: 'User enables UFW without allowing port 22 first, severing the SSH connection.',
      whyItHappens: 'Default incoming deny policy blocks port 22 unless explicitly whitelisted.',
      howToIdentify: 'SSH connection hangs and fails with timed out.',
      diagnosticCommand: 'sudo ufw status',
      expectedErrorOutput: 'Status: active\n(No port 22 rule listed)',
      fixExplanation: 'Access the server via hypervisor direct virtual console (Proxmox, VirtualBox, VMware) and run "sudo ufw allow 22/tcp".',
      fixCommand: 'sudo ufw allow 22/tcp',
      verificationCommand: 'sudo ufw status | grep 22/tcp',
      verificationOutput: '22/tcp ALLOW Anywhere',
    },
    {
      id: 'hrd-err-2',
      title: 'Exposing Elasticsearch 9200 Publicly to Internet',
      symptom: 'Automated crawlers or ransomware bots index deletion requests on port 9200.',
      whyItHappens: 'Administrator runs "sudo ufw allow 9200" or sets network.host to public IP without IP whitelisting.',
      howToIdentify: 'Check UFW status for port 9200 exposure.',
      diagnosticCommand: 'sudo ufw status | grep 9200',
      expectedErrorOutput: '9200/tcp ALLOW Anywhere',
      fixExplanation: 'Delete the rule immediately. Elasticsearch should only be reached internally by Logstash/Kibana.',
      fixCommand: 'sudo ufw delete allow 9200/tcp',
      verificationCommand: 'sudo ufw status | grep 9200',
      verificationOutput: '(No output returned - port 9200 blocked from WAN)',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-7-1',
      number: '7.1',
      title: 'Run Full Stack Health Audit Script',
      objective: 'Execute a consolidated pipeline status check to verify all components.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Run one-line status audit for all 5 services.',
          command: 'for svc in suricata filebeat logstash elasticsearch kibana; do systemctl is-active --quiet $svc && echo "✓ $svc is RUNNING" || echo "✗ $svc is DOWN"; done',
          why: 'Provides an instant health dashboard of the entire stack.',
          expectedResult: 'All 5 services report RUNNING.',
        },
      ],
      verificationPrompt: 'Are all 5 services reporting RUNNING?',
      expectedVerification: 'All 5 services report RUNNING.',
    },
    {
      id: 'lab-7-2',
      number: '7.2',
      title: 'Verify UFW Firewall Enforcement',
      objective: 'Test that port 9200 is blocked from external connection while port 5601 is reachable.',
      steps: [
        { stepNumber: 1, instruction: 'Check UFW status.', command: 'sudo ufw status verbose', why: 'Confirms active firewall state.', expectedResult: 'Status: active.' },
        { stepNumber: 2, instruction: 'Verify 9200 is not in allow list.', command: 'sudo ufw status | grep 9200', why: 'Ensures database is protected.', expectedResult: 'Zero matches (blocked).' },
      ],
      verificationPrompt: 'Is port 9200 blocked by UFW?',
      expectedVerification: 'Yes, no allow rule exists for port 9200.',
    },
  ],
  challenges: [
    {
      id: 'chal-7-1',
      title: 'Firewall Activation Command',
      scenario: 'You configured UFW rules for ports 22, 5601, and 5044. You now need to enable the firewall.',
      question: 'What is the command to activate UFW firewall enforcement?',
      hint: 'Starts with "sudo ufw..."',
      acceptedAnswers: ['sudo ufw enable', 'ufw enable'],
      correctExplanation: '"sudo ufw enable" activates the firewall and sets it to start automatically on system boot.',
      troubleshootingTip: 'Always verify SSH is allowed before enabling.',
      commandSuggestion: 'sudo ufw enable',
    },
    {
      id: 'chal-7-2',
      title: 'Primary Security Rule for Elasticsearch Port 9200',
      scenario: 'An auditor asks you whether port 9200 should be exposed to external internet traffic.',
      question: 'Should port 9200 ever be exposed directly to the public internet without an encrypted reverse proxy or VPN? (yes/no)',
      hint: 'Answer is no.',
      acceptedAnswers: ['no', 'false', 'never'],
      correctExplanation: 'Port 9200 should NEVER be exposed directly to the internet. Exposing Elasticsearch publicly has led to thousands of database ransomware attacks and data leaks.',
      troubleshootingTip: 'Only Logstash and Kibana on the local network should communicate with 9200.',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-7-1',
      question: 'What is the principle of Least Privilege in the context of SIEM firewall configuration?',
      options: [
        'Giving all users root access to speed up investigations.',
        'Opening every port so no log shippers are ever blocked.',
        'Denying all network traffic by default, and whitelisting ONLY the exact ports, protocols, and source IPs required for legitimate operations.',
        'Disabling firewalls on virtual machines.',
      ],
      correctIndex: 2,
      explanation: 'Least Privilege mandates that systems only have the minimum permissions and network access required to fulfill their function. Everything else is blocked by default.',
    },
    {
      id: 'quiz-7-2',
      question: 'Why should SSH password authentication be disabled in favor of SSH public keys on a SIEM server?',
      options: [
        'Because passwords consume too much RAM.',
        'Because passwords are vulnerable to automated dictionary and brute-force spraying attacks, whereas asymmetric cryptographic keys (e.g. Ed25519) cannot be brute-forced.',
        'Because Linux doesn\'t support passwords in 2026.',
        'To allow anyone to login without credentials.',
      ],
      correctIndex: 1,
      explanation: 'Exposed SSH password endpoints face thousands of automated brute-force attacks per hour. Cryptographic key pairs effectively eliminate credential stuffing vulnerabilities.',
    },
  ],
  interviewQuestions: [
    {
      question: 'How do you secure an Elastic Stack deployment from external threat actors?',
      modelAnswer:
        '1) Network Isolation: Place Elasticsearch in a private subnet with UFW/security groups blocking port 9200 from WAN. Only Logstash and Kibana can reach it. 2) Encryption in Transit: Enable TLS on transport (9300) and HTTP (9200) interfaces. 3) Authentication & RBAC: Enable xpack.security, enforce strong passwords or LDAP/SAML, and create least-privilege roles (e.g., logstash_writer can only write to soc-* indices). 4) Ingress Security: Put Kibana behind a reverse proxy (NGINX/Caddy) with TLS certificates, rate limiting, and VPN/MFA protection.',
      keyPoints: ['Network segmentation: Block 9200 from WAN', 'TLS encryption on all communications', 'Role-Based Access Control (RBAC)', 'MFA/VPN for Kibana access'],
    },
  ],
  checklist: [
    { id: 'chk-7-1', label: 'UFW default incoming deny policy set', verifyCommand: 'sudo ufw status verbose | grep -i "Default: deny (incoming)"' },
    { id: 'chk-7-2', label: 'SSH port 22 explicitly allowed in UFW', verifyCommand: 'sudo ufw status | grep 22/tcp' },
    { id: 'chk-7-3', label: 'Kibana port 5601 allowed in UFW', verifyCommand: 'sudo ufw status | grep 5601/tcp' },
    { id: 'chk-7-4', label: 'Logstash port 5044 allowed in UFW', verifyCommand: 'sudo ufw status | grep 5044/tcp' },
    { id: 'chk-7-5', label: 'Elasticsearch port 9200 blocked from external networks', verifyCommand: 'sudo ufw status | grep 9200 || echo "PORT_9200_PROTECTED"' },
    { id: 'chk-7-6', label: 'UFW firewall enabled and active', verifyCommand: 'sudo ufw status | grep -i "Status: active"' },
    { id: 'chk-7-7', label: 'All 5 stack daemons verified active simultaneously', verifyCommand: 'echo "Full stack running"' },
  ],
};
