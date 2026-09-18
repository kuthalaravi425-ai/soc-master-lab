export interface EventTraceStep {
  stepNumber: number;
  stageName: string;
  component: string;
  input: string;
  output: string;
  fileOrSocket: string;
  portOrProto: string;
  processName: string;
  verificationMethod: string;
  explanation: string;
  codeSnippet?: string;
}

export const END_TO_END_EVENT_TRACE: EventTraceStep[] = [
  {
    stepNumber: 1,
    stageName: 'Network Traffic Generation',
    component: 'Attacker Workstation (Kali)',
    input: 'Security Analyst / Attacker initiates Nmap SYN probe',
    output: 'Raw 802.3 Ethernet frame containing TCP SYN packet targeting port 22',
    fileOrSocket: 'Physical Wire / Virtual Switch Bridge',
    portOrProto: 'TCP Port 22 (SYN flag set)',
    processName: 'nmap',
    verificationMethod: 'Run "sudo tcpdump -nn -i <INTERFACE> port 22" on the SIEM server',
    explanation:
      'The packet leaves Kali Linux with source IP <KALI_IP> and destination IP <SIEM_IP>. It arrives at the network interface of our Ubuntu Server.',
    codeSnippet: 'sudo nmap -sS -p 22 <SIEM_IP>',
  },
  {
    stepNumber: 2,
    stageName: 'Raw Packet Capture & Signature Evaluation',
    component: 'Suricata IDS Engine',
    input: 'Raw Ethernet frames received by NIC kernel driver',
    output: 'Structured EVE JSON alert generated and appended to log file',
    fileOrSocket: '/var/log/suricata/eve.json',
    portOrProto: 'Kernel AF_PACKET promiscuous socket',
    processName: 'Suricata-Main (PID ...)',
    verificationMethod: 'Run "sudo tail -f /var/log/suricata/eve.json | jq ."',
    explanation:
      'Suricata pulls the packet from the AF_PACKET queue, decodes the TCP header, matches it against SID 2009582 (Nmap SYN scan rule), and appends a single-line JSON string into eve.json on the local disk.',
    codeSnippet: 'sudo tail -n 1 /var/log/suricata/eve.json | jq .alert',
  },
  {
    stepNumber: 3,
    stageName: 'Log Harvesting & Shipper Queuing',
    component: 'Filebeat Agent',
    input: 'New line appended to /var/log/suricata/eve.json',
    output: 'Serialized Lumberjack binary framed TCP payload sent over port 5044',
    fileOrSocket: 'Socket TCP -> 127.0.0.1:5044',
    portOrProto: 'TCP Port 5044',
    processName: 'filebeat',
    verificationMethod: 'Inspect journalctl logs: "sudo journalctl -u filebeat -n 10"',
    explanation:
      'Filebeat\'s filestream input detects the file modification via kernel inotify, reads the new byte slice, advances its registry offset in /var/lib/filebeat/registry, and transmits the batch to Logstash.',
    codeSnippet: 'sudo filebeat test output',
  },
  {
    stepNumber: 4,
    stageName: 'Pipeline Ingestion & Schema Transformation',
    component: 'Logstash Pipeline',
    input: 'Beats payload received on TCP 5044 listener',
    output: 'Normalized JSON document with parsed alert and timestamp fields',
    fileOrSocket: 'Socket TCP -> 127.0.0.1:9200',
    portOrProto: 'HTTP/HTTPS Port 9200 (Bulk REST API)',
    processName: 'java (Logstash)',
    verificationMethod: 'Inspect /var/log/logstash/logstash-plain.log',
    explanation:
      'Logstash receives the Beats stream, applies the JSON filter to unpack nested attributes, attaches environment tags, and issues an HTTP POST bulk write request to Elasticsearch.',
    codeSnippet: 'sudo tail -n 25 /var/log/logstash/logstash-plain.log',
  },
  {
    stepNumber: 5,
    stageName: 'Document Indexing & Inverted Index Creation',
    component: 'Elasticsearch Node',
    input: 'HTTP POST /_bulk request from Logstash containing JSON document',
    output: 'Lucene segment index files updated on disk (/var/lib/elasticsearch)',
    fileOrSocket: '/var/lib/elasticsearch/nodes/0/indices/...',
    portOrProto: 'TCP Port 9200',
    processName: 'java (Elasticsearch)',
    verificationMethod: 'Query REST API: curl -k -u elastic:pass https://localhost:9200/soc-telemetry-*/_search',
    explanation:
      'Elasticsearch routes the document to the designated primary shard, tokenizes text fields into Apache Lucene inverted indices, and writes transaction logs (translog) for durability. The record is now searchable in sub-seconds.',
    codeSnippet: 'curl -k -u elastic:YOUR_PASSWORD https://localhost:9200/soc-telemetry-*/_count',
  },
  {
    stepNumber: 6,
    stageName: 'Visual Dashboard Query & SOC Analyst Triage',
    component: 'Kibana UI & SOC Analyst',
    input: 'Analyst enters KQL query: alert.signature : *Nmap*',
    output: 'Rendered event card, attack histogram bar chart, and threat map',
    fileOrSocket: 'Web Browser DOM rendered via React/Canvas',
    portOrProto: 'TCP Port 5601',
    processName: 'node (Kibana) & Analyst Web Browser',
    verificationMethod: 'View alert in Discover table with full field hierarchy',
    explanation:
      'Kibana queries Elasticsearch REST API on behalf of the logged-in analyst, aggregates events by time bucket, and displays the high-severity alert so the analyst can validate, identify the attacker, and initiate containment.',
    codeSnippet: 'Open http://<SIEM_IP>:5601/app/discover',
  },
];
