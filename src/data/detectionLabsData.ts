import { DetectionLabScenario } from '../types/socMasterLab';

export const DETECTION_LABS_SCENARIOS: DetectionLabScenario[] = [
  {
    id: 'det-lab-1',
    number: '08.1',
    title: 'Port Scan Detection (Nmap SYN Stealth Scan)',
    severity: 'MEDIUM',
    category: 'Reconnaissance',
    objective:
      'Execute a controlled Nmap SYN stealth scan against your authorized SIEM lab target, analyze how Suricata triggers TCP scan signatures in eve.json, and write a KQL query in Kibana to triage the reconnaissance activity.',
    targetEnvironment: 'Target: <SIEM_IP> (Ubuntu Server) | Attacker: <KALI_IP> (Kali Linux VM)',
    kaliAttackerCommand: 'sudo nmap -sS -p 21,22,80,443,3306,5044,5601,8000,9200 -T4 <SIEM_IP>',
    attackerExplanation:
      'A SYN stealth scan sends TCP SYN packets without completing the 3-way handshake (sending RST upon receiving SYN-ACK). It probes common administration and database ports to map open services before launching exploits.',
    suricataSignature: {
      sid: 2009582,
      rule: 'alert tcp $EXTERNAL_NET any -> $HOME_NET [21,22,80,443,3306,9200] (msg:"ET SCAN Potential Nmap SYN Scan to Critical Ports"; flags:S; threshold:type both, track by_src, count 5, seconds 10; classtype:attempted-recon; sid:2009582; rev:4;)',
      explanation:
        'This signature looks for inbound TCP packets with only the SYN flag set targeting a list of monitored ports. The "threshold" keyword ensures an alert triggers only when 5 or more SYN packets originate from the same source IP within a 10-second window, preventing noise from legitimate single-packet retries.',
    },
    eveJsonSample: {
      timestamp: '2026-09-18T14:42:15.194821+0000',
      flow_id: 198421098412984,
      event_type: 'alert',
      src_ip: '<KALI_IP>',
      src_port: 54102,
      dest_ip: '<SIEM_IP>',
      dest_port: 22,
      proto: 'TCP',
      alert: {
        action: 'allowed',
        gid: 1,
        signature_id: 2009582,
        rev: 4,
        signature: 'ET SCAN Potential Nmap SYN Scan to Critical Ports',
        category: 'Attempted Information Leak',
        severity: 2,
      },
      flow: {
        pkts_toserver: 1,
        pkts_toclient: 1,
        bytes_toserver: 60,
        bytes_toclient: 40,
        start: '2026-09-18T14:42:15.194821+0000',
      },
      tcp: {
        tcp_flags: '02',
        syn: true,
      },
    },
    jsonExplanation: [
      { field: 'src_ip', meaning: 'The IP address of the scanning attacker (<KALI_IP>).' },
      { field: 'dest_ip', meaning: 'The targeted lab host (<SIEM_IP>).' },
      { field: 'dest_port', meaning: 'The specific port probed (e.g., 22 for SSH, 9200 for ES).' },
      { field: 'alert.signature', meaning: 'Human-readable rule name: "ET SCAN Potential Nmap SYN Scan".' },
      { field: 'alert.signature_id (sid)', meaning: 'Unique ID 2009582 for rule documentation and suppression.' },
      { field: 'tcp.syn', meaning: 'Boolean confirmation that the raw packet was a SYN probe.' },
      { field: 'alert.severity', meaning: 'Severity rating (1=High, 2=Medium, 3=Low/Informational).' },
    ],
    kqlQuery: 'event.category : "alert" and (suricata.alert.signature : *Nmap* or suricata.alert.signature_id : 2009582)',
    investigationQuestions: [
      {
        question: 'What is the Source IP conducting the reconnaissance?',
        answer: '<KALI_IP>',
        socTip: 'Always check if the source IP belongs to an internal vulnerability scanner (Nessus/Qualys) or an unknown subnet before escalating.',
      },
      {
        question: 'How many unique destination ports were probed in the timeframe?',
        answer: '9 ports (21, 22, 80, 443, 3306, 5044, 5601, 8000, 9200)',
        socTip: 'In Kibana Discover, add "destination.port" as a column or use a Terms visualization to see the spread of scanned ports.',
      },
      {
        question: 'Did the attacker discover open ports?',
        answer: 'Inspect the "flow.bytes_toclient" or TCP flags. A SYN-ACK response (bytes_toclient > 0) indicates an open port.',
        socTip: 'Correlate with local firewall drops in /var/log/ufw.log to see which probes were blocked at the kernel level.',
      },
    ],
    containmentRecommendation:
      'If the source IP is unauthorized: 1) Block source IP immediately on perimeter firewall ("sudo ufw insert 1 deny from <KALI_IP>"). 2) Audit authentication logs on probed ports (SSH, Kibana) to confirm no follow-up exploit attempts occurred.',
  },
  {
    id: 'det-lab-2',
    number: '08.2',
    title: 'SSH Brute-Force & Credential Spraying Simulation',
    severity: 'HIGH',
    category: 'Credential Access',
    objective:
      'Simulate an automated SSH dictionary attack against port 22 of your SIEM server, analyze the repeated failed authentication spikes, examine auth.log correlation in Kibana, and distinguish between benign typos and targeted brute-force attacks.',
    targetEnvironment: 'Target: <SIEM_IP> (Ubuntu Port 22) | Attacker: <KALI_IP> (Hydra / SSH Client)',
    kaliAttackerCommand: 'hydra -l admin -P /usr/share/wordlists/fasttrack.txt ssh://<SIEM_IP> -t 4',
    attackerExplanation:
      'Hydra opens multiple parallel TCP connections to port 22, rapidly submitting username/password pairs to compromise administrative shell access. Each failed attempt triggers a PAM authentication failure in /var/log/auth.log.',
    suricataSignature: {
      sid: 2001219,
      rule: 'alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:"ET SCAN Potential SSH Brute Force Inbound"; flow:to_server,established; threshold:type both, track by_src, count 10, seconds 60; classtype:attempted-admin; sid:2001219; rev:8;)',
      explanation:
        'Monitors established TCP handshakes to port 22. If a single external IP establishes more than 10 sessions within 60 seconds, Suricata classifies it as an automated password guessing brute-force attack.',
    },
    eveJsonSample: {
      timestamp: '2026-09-18T14:48:02.812391+0000',
      event_type: 'alert',
      src_ip: '<KALI_IP>',
      src_port: 48920,
      dest_ip: '<SIEM_IP>',
      dest_port: 22,
      proto: 'TCP',
      alert: {
        action: 'allowed',
        signature_id: 2001219,
        signature: 'ET SCAN Potential SSH Brute Force Inbound',
        category: 'Attempted Administrator Privilege Gain',
        severity: 1,
      },
      app_proto: 'ssh',
      ssh: {
        client: {
          software_version: 'SSH-2.0-OpenSSH_9.6p1',
        },
        server: {
          software_version: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6',
        },
      },
    },
    jsonExplanation: [
      { field: 'alert.signature', meaning: 'High-severity detection: "ET SCAN Potential SSH Brute Force Inbound".' },
      { field: 'ssh.client.software_version', meaning: 'Attacker SSH client banner identity.' },
      { field: 'dest_port', meaning: 'Port 22 confirms targeting of the SSH daemon.' },
      { field: 'alert.severity', meaning: 'Severity 1 (Critical/High) indicating direct attempt to gain admin credentials.' },
    ],
    kqlQuery: 'suricata.alert.signature : *SSH* or (process.name : "sshd" and message : *Failed*)',
    investigationQuestions: [
      {
        question: 'How do you distinguish between a user mistyping their password vs. a brute force attack?',
        answer: 'Volume and timing: An employee typo produces 1-3 failed attempts over a minute. A brute-force attack produces dozens or hundreds of failed attempts within seconds from automated tools.',
        socTip: 'Check the targeted usernames in auth.log. Brute force tools spray common defaults: root, admin, test, user, support.',
      },
      {
        question: 'Did any authentication attempt succeed?',
        answer: 'Check /var/log/auth.log or Kibana with: process.name : "sshd" and message : *Accepted*.',
        socTip: 'If an "Accepted" log appears immediately following multiple "Failed password" logs from the same IP, treat it as an active compromise.',
      },
    ],
    containmentRecommendation:
      '1) Permanently ban the attacking IP in UFW ("sudo ufw deny from <KALI_IP> to any port 22"). 2) Install and configure Fail2ban to automatically jail IPs with >5 failures. 3) Enforce key-only authentication in /etc/ssh/sshd_config.',
  },
  {
    id: 'det-lab-3',
    number: '08.3',
    title: 'Web Application Attack & SQL Injection Simulation',
    severity: 'CRITICAL',
    category: 'Web Attack',
    objective:
      'Simulate an authorized HTTP web reconnaissance and SQL injection payload against a test web service, examine how Suricata decodes HTTP URI parameters in eve.json, and perform log triage in Kibana.',
    targetEnvironment: 'Target: <SIEM_IP>:8000 / <SIEM_IP>:80 | Attacker: <KALI_IP> (cURL / Nikto)',
    kaliAttackerCommand: 'curl -i -s "http://<SIEM_IP>:8000/api/v1/search?query=admin%27%20OR%201=1--"',
    attackerExplanation:
      'Submits an encoded SQL injection vector ("admin\' OR 1=1--") within the HTTP GET query string to bypass database authentication logic.',
    suricataSignature: {
      sid: 2014872,
      rule: 'alert http $EXTERNAL_NET any -> $HTTP_SERVERS any (msg:"ET WEB_SPECIFIC_APPS SQL Injection Attempt (OR 1=1)"; flow:to_server,established; http.uri; content:"OR"; nocase; content:"1=1"; distance:0; classtype:web-application-attack; sid:2014872; rev:3;)',
      explanation:
        'Decodes URL-encoded HTTP request buffers and inspects the URI query string for boolean tautology injections like "OR 1=1", which are classic SQLi bypass techniques.',
    },
    eveJsonSample: {
      timestamp: '2026-09-18T14:55:30.902314+0000',
      event_type: 'alert',
      src_ip: '<KALI_IP>',
      src_port: 58210,
      dest_ip: '<SIEM_IP>',
      dest_port: 8000,
      proto: 'TCP',
      alert: {
        action: 'allowed',
        signature_id: 2014872,
        signature: 'ET WEB_SPECIFIC_APPS SQL Injection Attempt (OR 1=1)',
        category: 'Web Application Attack',
        severity: 1,
      },
      http: {
        hostname: '<SIEM_IP>',
        url: '/api/v1/search?query=admin\' OR 1=1--',
        http_method: 'GET',
        protocol: 'HTTP/1.1',
        status: 200,
        length: 342,
      },
    },
    jsonExplanation: [
      { field: 'http.url', meaning: 'The exact URL and SQL payload captured by the IDS decoder.' },
      { field: 'http.http_method', meaning: 'HTTP GET request.' },
      { field: 'http.status', meaning: 'Web server HTTP response code (200 OK vs 403 Forbidden vs 500 Error).' },
      { field: 'alert.category', meaning: 'Web Application Attack.' },
    ],
    kqlQuery: 'event.category : "alert" and (suricata.alert.signature : *SQL* or suricata.http.url : *OR*1=1*)',
    investigationQuestions: [
      {
        question: 'What exact SQL injection payload was transmitted in the HTTP GET URI?',
        answer: "/api/v1/search?query=admin' OR 1=1--",
        socTip: 'Suricata automatically decodes percent-encoded characters (%20 -> space, %27 -> single quote) in the http.url buffer.',
      },
      {
        question: 'Did the application execute the SQL query successfully?',
        answer: 'Inspect the HTTP response status code and length. A status of 200 with abnormal payload size suggests successful query execution.',
        socTip: 'Check web application backend database logs to confirm if database errors or records were dumped.',
      },
    ],
    containmentRecommendation:
      '1) Block attacker IP via reverse proxy or WAF. 2) Remedy application backend using parameterized prepared statements (e.g. SQLAlchemy or PDO) to eliminate raw string concatenation.',
  },
];
