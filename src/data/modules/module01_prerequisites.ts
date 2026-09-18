import { ModuleData } from '../../types/socMasterLab';

export const module01Prerequisites: ModuleData = {
  id: 'prerequisites',
  moduleNumber: '01',
  title: 'System Prerequisites & Host Preparation',
  tagline: 'Prepare Ubuntu Server with networking, system resources, OpenJDK 17, and Elastic APT repositories.',
  badge: 'Foundation',
  level: 'Level 1: Foundation',
  estimatedMinutes: 45,
  overview: {
    whatIsIt:
      'The Prerequisites phase establishes the foundational operating system environment on Ubuntu Server 22.04/24.04 LTS. Before any SIEM or IDS software can run, the host OS must have clean package caches, verified static network addressing, sufficient RAM and disk allocations, and the official Elastic GPG repository signed keys.',
    whyDoWeNeedIt:
      'Elasticsearch and Logstash are memory-intensive Java-based enterprise services, while Suricata inspects raw network packets via kernel promiscuous sockets. Starting without verified RAM, free disk space, Java 17, and static IPs leads to cascading service crashes (OOM kills, disk watermarks, bind failures).',
    problemSolved:
      'Prevents package dependency conflicts, repository signature errors, dynamic IP changes that break agent shippers, and out-of-memory lockups during Elasticsearch initialization.',
    architectureRole:
      'Acts as the bare-metal or hypervisor OS substrate hosting all telemetry processors, socket listeners, and storage engines.',
    diagramText: `[Ubuntu Server 22.04 LTS Host]
  ├── System Packages: apt update & upgrade
  ├── Network Stack: Static IP, Routing, Listening Sockets (ss -tulpn)
  ├── Host Resources: Disk (df -h), RAM (free -h), CPU (lscpu)
  ├── Runtimes: OpenJDK 17 Headless (Required by Logstash)
  └── Repositories: Elastic Stack 8.x Signed GPG Keyrings`,
  },
  prerequisites: [
    'Ubuntu Server 22.04 or 24.04 LTS (minimal or standard installation)',
    'Minimum 4 vCPUs, 8 GB RAM (16 GB recommended for full single-node stack), 40 GB storage',
    'Root or sudo privileges on the server',
    'Access to local internet for downloading packages',
  ],
  importantPorts: [
    {
      component: 'SSH Administration',
      port: 22,
      protocol: 'TCP',
      purpose: 'Secure remote terminal management of the Linux host',
      configFile: '/etc/ssh/sshd_config',
      verificationCommand: 'sudo ss -tulpn | grep :22',
      troubleshootingCommands: ['sudo systemctl status ssh', 'sudo journalctl -u ssh -n 20'],
      relatedComponents: ['Terminal Console', 'SOC Management Workstation'],
    },
  ],
  configurationFile: {
    path: '/etc/netplan/00-installer-config.yaml',
    component: 'Ubuntu Netplan Networking',
    purpose: 'Defines static IP addressing, gateway, and DNS resolvers for the SIEM host',
    whatItControls: 'IP address binding, network default gateway, interface MTU, and DNS nameservers',
    parameters: [
      { key: 'addresses', value: '[192.168.1.50/24]', purpose: 'Static IPv4 address assigned to the SIEM server', safeDefault: '[<SIEM_IP>/24]' },
      { key: 'gateway4', value: '192.168.1.1', purpose: 'Default gateway router IP', safeDefault: '192.168.1.1' },
      { key: 'nameservers', value: 'addresses: [1.1.1.1, 8.8.8.8]', purpose: 'Upstream DNS resolvers for APT package updates', safeDefault: '[1.1.1.1, 8.8.8.8]' },
    ],
    safeSnippet: `network:
  version: 2
  renderer: networkd
  ethernets:
    <INTERFACE>:
      dhcp4: no
      addresses:
        - <SIEM_IP>/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]`,
    nanoCommand: 'sudo nano /etc/netplan/00-installer-config.yaml',
    validationCommand: 'sudo netplan try',
    commonErrors: [
      'Using TAB characters instead of SPACES in YAML causes netplan parser crashes.',
      'Misconfigured subnet mask (e.g., /32 instead of /24) isolates the server from LAN clients.',
      'Incorrect default route "via" IP prevents downloading packages from repositories.',
    ],
  },
  serviceManagement: {
    serviceName: 'systemd-networkd',
    startCommand: 'sudo systemctl start systemd-networkd',
    stopCommand: 'sudo systemctl stop systemd-networkd',
    restartCommand: 'sudo systemctl restart systemd-networkd',
    enableCommand: 'sudo systemctl enable systemd-networkd',
    statusCommand: 'sudo systemctl status systemd-networkd',
    logsCommand: 'sudo journalctl -u systemd-networkd -n 50',
    explanation:
      'Linux systemd manages background daemon services. Using "systemctl status" checks if a service is actively running or has encountered a fatal boot crash.',
  },
  installationSteps: [
    {
      id: 'pre-1',
      command: 'sudo apt update && sudo apt upgrade -y',
      description: 'Update repository package indices and upgrade installed system packages',
      whyThisCommand:
        'APT package indices must be fresh before installing enterprise services. "apt update" fetches new package manifests, and "apt upgrade" patches existing system binaries and kernel security vulnerabilities.',
      expectedOutput: `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Reading package lists... Done
Building dependency tree... Done
Calculating upgrade... Done
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`,
      whatOutputMeans: 'All package repositories were contacted successfully and system binaries are up to date.',
      commonMistake: 'Running apt upgrade without sudo, or interrupting the process while dpkg locks the database.',
      troubleshooting: 'If locked: "sudo rm /var/lib/dpkg/lock-frontend" and run "sudo dpkg --configure -a".',
      requiresSudo: true,
    },
    {
      id: 'pre-2',
      command: 'hostname && hostname -I',
      description: 'Verify Linux host name and bound IPv4/IPv6 addresses',
      whyThisCommand:
        'SIEM log shippers and cluster nodes communicate via IP. We must know the exact local IP address of our server to configure Elasticsearch and Filebeat.',
      expectedOutput: `siem-master-node
<SIEM_IP> 172.17.0.1 fe80::a00:27ff:fe4a:321`,
      whatOutputMeans: 'First line is your hostname; second line displays all active IP addresses assigned to network interfaces.',
      commonMistake: 'Assuming 127.0.0.1 is the only IP address. You must use the routable LAN interface IP.',
      troubleshooting: 'Run "ip addr show" to inspect all interfaces and their link states.',
    },
    {
      id: 'pre-3',
      command: 'ip addr && ip route',
      description: 'Examine detailed network interfaces, MAC addresses, and default gateway routing',
      whyThisCommand:
        'Verifies that your network interface is UP, has an assigned subnet, and has a default route to access upstream repositories and receive telemetry.',
      expectedOutput: `2: <INTERFACE>: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    inet <SIEM_IP>/24 brd 192.168.1.255 scope global <INTERFACE>
default via 192.168.1.1 dev <INTERFACE> proto static`,
      whatOutputMeans: 'Interface is in UP state with an IP in the /24 subnet and packets can route to 192.168.1.1.',
      commonMistake: 'Not noticing when an interface is NO-CARRIER or DOWN in virtualized environments.',
      troubleshooting: 'Run "sudo ip link set <INTERFACE> up" to bring an inactive interface online.',
    },
    {
      id: 'pre-4',
      command: 'df -h && free -h',
      description: 'Check available disk storage and system RAM allocations',
      whyThisCommand:
        'Elasticsearch has built-in disk watermarks: at 85% disk usage it stops allocating new shards; at 95% it blocks all write operations! We must ensure at least 20GB+ free space and 8GB+ RAM.',
      expectedOutput: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G  8.2G   39G  18% /
               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       1.2Gi       5.1Gi       12Mi       1.4Gi       6.2Gi
Swap:          4.0Gi          0B       4.0Gi`,
      whatOutputMeans: 'Root partition has 39GB free (18% used) and system has 6.2GB available memory with 4GB swap.',
      commonMistake: 'Installing on a 10GB VM disk where indices fill the drive in a single day.',
      troubleshooting: 'Clean old apt caches using "sudo apt clean" and check largest dirs with "sudo du -sh /* | sort -h".',
    },
    {
      id: 'pre-5',
      command: 'sudo ss -tulpn',
      description: 'Audit currently listening TCP and UDP sockets on the host',
      whyThisCommand:
        '"ss" (socket statistics) shows what ports are already occupied. We must verify that ports 9200, 5044, and 5601 are free before installing our services.',
      expectedOutput: `Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process
tcp    LISTEN  0       128            0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=842,fd=3))
tcp    LISTEN  0       128               [::]:22             [::]:*      users:(("sshd",pid=842,fd=4))`,
      whatOutputMeans: 'Only port 22 (SSH) is listening. Ports 9200 (ES), 5044 (Logstash), and 5601 (Kibana) are available!',
      commonMistake: 'Confusing 0.0.0.0 (all IPv4 interfaces) with 127.0.0.1 (localhost only).',
      troubleshooting: 'If another process is using port 9200 or 5044, check the process ID in the right column and kill it.',
      requiresSudo: true,
    },
    {
      id: 'pre-6',
      command: 'sudo apt install -y openjdk-17-jre-headless apt-transport-https gnupg curl',
      description: 'Install OpenJDK 17 runtime, HTTPS transport, GPG utilities, and cURL',
      whyThisCommand:
        'Logstash runs on the Java Virtual Machine. While Elasticsearch bundles its own Java runtime, Logstash and various system diagnostic tools require Java 17 headless.',
      expectedOutput: `Setting up openjdk-17-jre-headless:amd64 ...
Setting up apt-transport-https ...
Setting up gnupg ...
Setting up curl ...
Processing triggers for man-db ...`,
      whatOutputMeans: 'Java 17 runtime and prerequisite utilities were installed successfully.',
      commonMistake: 'Installing full GUI openjdk-17-jdk which wastes 600MB on X11 graphics packages.',
      troubleshooting: 'Run "java -version" to verify the JRE runtime executes without architecture faults.',
      requiresSudo: true,
    },
    {
      id: 'pre-7',
      command: 'java -version',
      description: 'Verify the active default Java runtime version',
      whyThisCommand:
        'Confirms the Java compiler/runtime is recognized by system PATH and reports the version 17 release series.',
      expectedOutput: `openjdk version "17.0.10" 2024-01-16
OpenJDK Runtime Environment (build 17.0.10+7-Ubuntu-122.04.1)
OpenJDK 64-Bit Server VM (build 17.0.10+7-Ubuntu-122.04.1, mixed mode, sharing)`,
      whatOutputMeans: 'Java 17 64-Bit OpenJDK Server VM is active and ready for Logstash.',
      commonMistake: 'Having an older Java 8 or Java 11 installed that overrides PATH.',
      troubleshooting: 'Use "sudo update-alternatives --config java" to select Java 17 as default.',
    },
    {
      id: 'pre-8',
      command: 'wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg',
      description: 'Download and import the official Elastic signing GPG key securely into keyrings',
      whyThisCommand:
        'Ubuntu requires APT repositories to be cryptographically signed to prevent MITM tampering. This downloads Elastic\'s public key and writes it to a modern dearmored keyring file.',
      expectedOutput: `(No output on success; command completes silently)`,
      whatOutputMeans: 'Keyring file /usr/share/keyrings/elasticsearch-keyring.gpg was written.',
      commonMistake: 'Using deprecated "apt-key add" which generates security warnings on Ubuntu 22.04+.',
      troubleshooting: 'Check key exists: "ls -lh /usr/share/keyrings/elasticsearch-keyring.gpg".',
      requiresSudo: true,
    },
    {
      id: 'pre-9',
      command: 'echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list',
      description: 'Create the official Elastic Stack 8.x repository source file',
      whyThisCommand:
        'Instructs Ubuntu\'s APT manager where to find the official, up-to-date versions of Elasticsearch, Logstash, Kibana, and Filebeat rather than outdated generic packages.',
      expectedOutput: `deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main`,
      whatOutputMeans: 'Elastic 8.x repository list file was generated.',
      commonMistake: 'Omitting the [signed-by=...] directive which causes Ubuntu to reject unsigned packages.',
      troubleshooting: 'Cat the file: "cat /etc/apt/sources.list.d/elastic-8.x.list".',
      requiresSudo: true,
    },
    {
      id: 'pre-10',
      command: 'sudo apt update',
      description: 'Synchronize package cache with newly configured Elastic repository',
      whyThisCommand:
        'Ubuntu now contacts https://artifacts.elastic.co to index the latest Elasticsearch, Logstash, and Filebeat package versions.',
      expectedOutput: `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 https://artifacts.elastic.co/packages/8.x/apt stable InRelease [12.4 kB]
Get:3 https://artifacts.elastic.co/packages/8.x/apt stable/main amd64 Packages [145 kB]
Fetched 157 kB in 2s (78.5 kB/s)
Reading package lists... Done`,
      whatOutputMeans: 'Elastic repository returned HTTP 200 InRelease and package lists are loaded.',
      commonMistake: 'Firewall blocking outbound HTTPS (port 443) preventing connection to artifacts.elastic.co.',
      troubleshooting: 'Test connectivity: "curl -I https://artifacts.elastic.co".',
      requiresSudo: true,
    },
  ],
  verificationSteps: [
    {
      id: 'pre-v1',
      command: 'apt-cache policy elasticsearch',
      description: 'Confirm Elasticsearch is ready for installation from Elastic repository',
      whyThisCommand: 'Validates that the Elastic 8.x repo is active and APT knows the exact version to install.',
      expectedOutput: `elasticsearch:
  Installed: (none)
  Candidate: 8.12.2
  Version table:
     8.12.2 500
        500 https://artifacts.elastic.co/packages/8.x/apt stable/main amd64 Packages`,
      whatOutputMeans: 'Candidate version 8.x is discovered and available from artifacts.elastic.co.',
    },
    {
      id: 'pre-v2',
      command: 'free -h',
      description: 'Verify system has sufficient free RAM for JVM allocations',
      whyThisCommand: 'Ensures we have at least 4GB of unused memory before starting Elasticsearch.',
      expectedOutput: `Mem:           7.7Gi       1.1Gi       5.2Gi`,
      whatOutputMeans: 'Over 5GB of free memory available.',
    },
  ],
  logsExplanation: {
    primaryPath: '/var/log/syslog',
    inspectionCommands: [
      {
        id: 'log-sys-1',
        command: 'sudo tail -n 50 /var/log/syslog',
        description: 'View recent system-wide kernel and daemon logs',
        whyThisCommand: 'Checks if any hardware errors, disk I/O bottlenecks, or network interface drops occurred.',
      },
      {
        id: 'log-sys-2',
        command: 'sudo dmesg -T | grep -i oom',
        description: 'Check kernel ring buffer for Out-Of-Memory (OOM) killer events',
        whyThisCommand: 'Identifies if Linux kernel terminated any process due to RAM exhaustion.',
      },
    ],
    keyLogPatterns: [
      { pattern: 'Out of memory: Kill process', meaning: 'Kernel killed a process because host ran out of physical RAM.' },
      { pattern: 'link becomes ready', meaning: 'Network interface successfully established physical/virtual link.' },
      { pattern: 'EXT4-fs: mounted filesystem', meaning: 'File system mounted with read/write permissions.' },
    ],
  },
  commonErrors: [
    {
      id: 'pre-err-1',
      title: 'Repository GPG Signature Verification Error',
      symptom: 'apt update fails with: "GPG error: ... The following signatures couldn\'t be verified because the public key is not available"',
      whyItHappens: 'The Elastic GPG public key was either not downloaded or saved to an invalid path.',
      howToIdentify: 'Run "sudo apt update" and look for NO_PUBKEY or gpgv verification failure.',
      diagnosticCommand: 'ls -la /usr/share/keyrings/elasticsearch-keyring.gpg',
      expectedErrorOutput: 'W: GPG error: https://artifacts.elastic.co/packages/8.x/apt stable InRelease: The following signatures couldn\'t be verified: NO_PUBKEY D27D666CD88E42B4',
      fixExplanation: 'Re-download and dearmor the GPG key directly to /usr/share/keyrings/elasticsearch-keyring.gpg.',
      fixCommand: 'wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor --yes -o /usr/share/keyrings/elasticsearch-keyring.gpg',
      verificationCommand: 'sudo apt update',
      verificationOutput: 'Get:... https://artifacts.elastic.co/packages/8.x/apt stable InRelease [12.4 kB]',
    },
    {
      id: 'pre-err-2',
      title: 'DPKG Database Lock Collision',
      symptom: 'Could not get lock /var/lib/dpkg/lock-frontend - open (11: Resource temporarily unavailable)',
      whyItHappens: 'Another background task like unattended-upgrades is currently updating the system.',
      howToIdentify: 'Check which process holds the apt/dpkg lock.',
      diagnosticCommand: 'sudo lsof /var/lib/dpkg/lock-frontend',
      expectedErrorOutput: 'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME\napt-get 12345 root    4uW   REG    8,1        0 131341 /var/lib/dpkg/lock-frontend',
      fixExplanation: 'Wait for the background update to complete, or safely terminate the stuck unattended-upgrades job.',
      fixCommand: 'sudo kill -9 12345 && sudo dpkg --configure -a',
      verificationCommand: 'sudo apt update',
      verificationOutput: 'Reading package lists... Done',
    },
  ],
  handsOnLabs: [
    {
      id: 'lab-1-1',
      number: '1.1',
      title: 'Audit System Baseline & Network Readiness',
      objective: 'Discover the host interface name, verify static routing, and confirm port 22 is listening.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'List all network interfaces and note your primary interface (e.g. eth0, ens33, enp0s3).',
          command: 'ip -brief addr show',
          why: 'We will need this interface name for Netplan and later for Suricata packet sniffing.',
          expectedResult: 'UP state with assigned IPv4 address on the primary interface.',
        },
        {
          stepNumber: 2,
          instruction: 'Inspect active listening ports to ensure no conflicts exist.',
          command: 'sudo ss -tulpn',
          why: 'Guarantees port 9200 and 5044 are clear.',
          expectedResult: 'Only SSH on port 22 should be visible.',
        },
      ],
      verificationPrompt: 'Does your primary network interface show UP with an IP address in the local subnet?',
      expectedVerification: 'Yes, interface state is UP with valid IPv4 CIDR.',
    },
    {
      id: 'lab-1-2',
      number: '1.2',
      title: 'Install Java 17 and Configure Elastic GPG Key',
      objective: 'Install OpenJDK 17 and configure official Elastic 8.x repository source.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Install openjdk-17-jre-headless and verify Java 17 is active.',
          command: 'sudo apt install -y openjdk-17-jre-headless && java -version',
          why: 'Logstash requires Java 17 to execute its JRuby event pipeline.',
          expectedResult: 'openjdk version 17.0.x output displayed.',
        },
        {
          stepNumber: 2,
          instruction: 'Download Elastic signing key and verify the keyring file exists.',
          command: 'wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor --yes -o /usr/share/keyrings/elasticsearch-keyring.gpg && ls -l /usr/share/keyrings/elasticsearch-keyring.gpg',
          why: 'Enables verified package cryptographic signatures.',
          expectedResult: 'Keyring file exists and is non-zero bytes.',
        },
      ],
      verificationPrompt: 'Run "apt-cache policy elasticsearch" to verify the Elastic repo is ready.',
      expectedVerification: 'Version table lists candidate 8.x packages from artifacts.elastic.co.',
    },
  ],
  challenges: [
    {
      id: 'chal-1-1',
      title: 'Identify the Default Route Interface',
      scenario: 'You are setting up Suricata on a multi-homed server with 3 NICs. You must identify which interface handles internet-bound traffic.',
      question: 'Which Linux command reveals the default gateway and active outbound network device in one line?',
      hint: 'Use the ip command targeting routes.',
      acceptedAnswers: ['ip route', 'ip r', 'ip route show', 'ip route | grep default', 'ip route show default'],
      correctExplanation: 'Running "ip route" shows "default via <GATEWAY> dev <INTERFACE>", giving the exact egress network interface.',
      troubleshootingTip: 'Try typing "ip route" in the terminal simulator.',
      commandSuggestion: 'ip route',
    },
    {
      id: 'chal-1-2',
      title: 'Inspect Listening Sockets',
      scenario: 'You want to check if another team member has already started an HTTP service on the server.',
      question: 'What command flags for "ss" display TCP listening numeric sockets with process names?',
      hint: 'Remember: TCP (-t), UDP (-u), Listening (-l), Numeric (-n), Process (-p).',
      acceptedAnswers: ['ss -tulpn', 'sudo ss -tulpn', 'ss -tlpn', 'sudo ss -tlpn'],
      correctExplanation: '"ss -tulpn" displays TCP and UDP listening sockets without resolving hostnames (numeric) and shows process IDs.',
      troubleshootingTip: 'Use sudo so the process column is not blank.',
      commandSuggestion: 'sudo ss -tulpn',
    },
  ],
  quizQuestions: [
    {
      id: 'quiz-1-1',
      question: 'Why does Elasticsearch enforce a minimum disk watermark threshold (default 85% and 95%)?',
      options: [
        'To prevent indexing performance from dropping on slow mechanical drives.',
        'To protect index shards and metadata from catastrophic corruption caused by out-of-disk crashes.',
        'Because Linux kernel blocks TCP sockets when disk usage exceeds 80%.',
        'To force users to purchase enterprise Elastic subscriptions.',
      ],
      correctIndex: 1,
      explanation: 'If a database runs completely out of disk during a write, transaction logs and Lucene segment files corrupt. Elasticsearch transitions indices to read-only at 95% disk usage to preserve data integrity.',
    },
    {
      id: 'quiz-1-2',
      question: 'Which Java version is required as a baseline for the Elastic 8.x ecosystem in this lab?',
      options: ['Java 8 (1.8.0)', 'Java 11 LTS', 'Java 17 LTS', 'Java 21 Early Access'],
      correctIndex: 2,
      explanation: 'Logstash 8.x requires Java 17 LTS. Elasticsearch 8.x bundles its own internal Java 17 JDK.',
    },
    {
      id: 'quiz-1-3',
      question: 'Why is it essential to configure a STATIC IP on the SIEM server rather than DHCP?',
      options: [
        'Because Ubuntu Server disables the firewall on DHCP interfaces.',
        'Because Filebeat shippers and Kibana must connect to a predictable IP address; if DHCP changes the IP, all log ingest breaks.',
        'Because Elasticsearch only binds to 127.0.0.1 on DHCP interfaces.',
        'Because Suricata IDS cannot capture packets when DHCP is active.',
      ],
      correctIndex: 1,
      explanation: 'Agents running on workstations or servers send telemetry to Logstash/Elasticsearch IP. If DHCP leases expire and change the IP, all shipping pipelines fail.',
    },
  ],
  interviewQuestions: [
    {
      question: 'How do you troubleshoot a server that cannot reach external repositories during "sudo apt update"?',
      modelAnswer:
        'I follow a layered network diagnostic approach: 1) Check local link state with "ip link" to ensure the interface is UP. 2) Verify IPv4 address and subnet mask with "ip addr". 3) Check default gateway routing with "ip route" and ping the local router. 4) Test DNS name resolution with "dig" or "nslookup artifacts.elastic.co" or inspect /etc/resolv.conf. 5) Test outbound HTTPS connectivity via port 443 with "curl -I https://artifacts.elastic.co".',
      keyPoints: ['Layer 1/2: Link status and IP assignment', 'Layer 3: Gateway routing and ping', 'Layer 7: DNS resolution and HTTPS firewall rules'],
    },
    {
      question: 'What is the purpose of the Linux OOM (Out Of Memory) killer, and how does it affect a SOC server?',
      modelAnswer:
        'When Linux memory allocations exceed available physical RAM and swap, the kernel invokes the OOM killer. It calculates an oom_score for every process based on memory usage and kills the highest scoring process to prevent a total system freeze. Because Elasticsearch and Logstash consume multi-gigabyte JVM heaps, they are frequently the first targets killed. In a SOC, this stops all security log indexing. We verify this using "dmesg -T | grep -i oom" and prevent it by sizing RAM and setting explicit JVM heap limits (-Xms / -Xmx).',
      keyPoints: ['Kernel mechanism to prevent panic', 'Target selection via oom_score', 'Inspection via dmesg', 'Mitigation via JVM heap limits'],
    },
  ],
  checklist: [
    { id: 'chk-1-1', label: 'Ubuntu packages updated & upgraded', verifyCommand: 'sudo apt update' },
    { id: 'chk-1-2', label: 'Static IP and default gateway verified', verifyCommand: 'ip addr && ip route' },
    { id: 'chk-1-3', label: 'Available disk space exceeds 25GB', verifyCommand: 'df -h /' },
    { id: 'chk-1-4', label: 'Available physical RAM exceeds 4GB', verifyCommand: 'free -h' },
    { id: 'chk-1-5', label: 'OpenJDK 17 Headless installed and verified', verifyCommand: 'java -version' },
    { id: 'chk-1-6', label: 'Elastic 8.x GPG keyring configured', verifyCommand: 'ls -l /usr/share/keyrings/elasticsearch-keyring.gpg' },
    { id: 'chk-1-7', label: 'Elastic 8.x repository active in APT sources', verifyCommand: 'apt-cache policy elasticsearch' },
  ],
};
