export interface InterviewQuestionItem {
  id: string;
  category: string;
  question: string;
  interviewerIntent: string;
  strongAnswer: string;
  keyPoints: string[];
  candidateMistakeToAvoid: string;
}

export const SOC_INTERVIEW_QUESTIONS: InterviewQuestionItem[] = [
  {
    id: 'int-1',
    category: 'Architecture & Pipeline',
    question: 'Can you walk me through the complete lifecycle of a network attack packet from the wire until it appears on a SOC analyst’s dashboard in your lab?',
    interviewerIntent: 'Assesses whether the candidate understands the end-to-end data pipeline or merely memorized individual tools.',
    strongAnswer:
      'In our lab pipeline, traffic passes through 6 coordinated stages: 1) The attack packet reaches the Ubuntu Server network interface. 2) Suricata sniffs the packet in promiscuous mode via AF_PACKET, decodes the protocol headers, matches it against signature rules, and writes a structured JSON alert to /var/log/suricata/eve.json. 3) Filebeat tails eve.json via inotify, tracks its byte offset in its registry, and transmits the payload over TCP port 5044. 4) Logstash receives the event on port 5044, parses the nested JSON string using its filter plugin, adds metadata tags, and executes an HTTP bulk POST to Elasticsearch on port 9200. 5) Elasticsearch stores the record in a daily index (soc-telemetry-YYYY.MM.DD) and updates Lucene inverted indices. 6) Kibana queries port 9200 via authenticated REST API, displaying the alert in Discover and dashboard histograms in sub-seconds.',
    keyPoints: [
      'Promiscuous sniffing via Suricata AF_PACKET',
      'Disk logging to eve.json',
      'Harvester offset tracking in Filebeat',
      'TCP 5044 transport to Logstash',
      'JSON filter parsing and HTTP bulk indexing to ES 9200',
      'Kibana REST retrieval and analyst triage',
    ],
    candidateMistakeToAvoid: 'Don\'t say Filebeat sends directly to Kibana. Kibana is a visualization layer; all data lives in Elasticsearch.',
  },
  {
    id: 'int-2',
    category: 'Architecture & Pipeline',
    question: 'What is the architectural difference between Filebeat and Logstash, and why wouldn’t you just use one or the other?',
    interviewerIntent: 'Tests understanding of resource management, edge vs. centralized processing, and data transformation limits.',
    strongAnswer:
      'Filebeat is written in Go; it is an ultra-lightweight agent designed to run on edge servers or endpoints with minimal footprint (<50MB RAM and negligible CPU). Its primary job is reliable harvesting, backpressure handling, and shipping. Logstash is a heavyweight JVM application that consumes significant memory (1-4GB+ RAM) but offers extensive data transformation capabilities: complex Grok regex parsing, GeoIP lookup, threat intelligence enrichment, and conditional branching to multiple outputs (Elasticsearch, Kafka, S3). In an enterprise architecture, we deploy Filebeat on edge hosts to avoid bogging down servers, while centralizing Logstash on dedicated ingest nodes to handle heavy parsing.',
    keyPoints: [
      'Filebeat: Go-based, lightweight (<50MB RAM), edge shipping, backpressure handling',
      'Logstash: JVM-based, heavy transformation, GeoIP enrichment, grok parsing',
      'Hybrid architecture provides efficiency at the edge and power at the core',
    ],
    candidateMistakeToAvoid: 'Claiming Filebeat cannot send directly to Elasticsearch. Filebeat CAN send directly to Elasticsearch, but lacks heavy enrichment plugins.',
  },
  {
    id: 'int-3',
    category: 'Troubleshooting & Operations',
    question: 'Your Filebeat agent is running, but "filebeat test output" fails with "Connection Refused" to port 5044. Walk me through your troubleshooting steps.',
    interviewerIntent: 'Evaluates logical, evidence-based diagnostic methodology rather than guessing.',
    strongAnswer:
      'I follow a systematic 5-step diagnostic process: 1) Verify Logstash process status: Run "sudo systemctl status logstash" on the receiving server to confirm the service is actually in "active (running)" state. 2) Check socket listener: Run "sudo ss -tulpn | grep 5044" to confirm Logstash is listening on 0.0.0.0:5044 and not accidentally restricted to 127.0.0.1 or bound by another process. 3) Network reachability: Test TCP handshake from the Filebeat host using "nc -zv <LOGSTASH_IP> 5044". 4) Firewall rules: Check host firewall with "sudo ufw status" to ensure port 5044 is allowed. 5) Inspect Logstash logs: Review /var/log/logstash/logstash-plain.log to ensure the pipeline didn\'t crash during JRuby boot due to syntax errors in 01-beats.conf.',
    keyPoints: [
      'Check systemctl status logstash',
      'Verify port 5044 binding via ss -tulpn',
      'Test TCP handshake with netcat',
      'Verify host firewall (UFW) rules',
      'Inspect application logs for pipeline compilation faults',
    ],
    candidateMistakeToAvoid: 'Suggesting to immediately reinstall Logstash or reboot the server. Diagnosing evidence always comes before reinstallation.',
  },
  {
    id: 'int-4',
    category: 'Troubleshooting & Operations',
    question: 'Elasticsearch is reported as running by systemctl, but when an analyst tries to run curl or open Kibana, port 9200 is completely unreachable. What would you investigate?',
    interviewerIntent: 'Tests understanding of network binding, loopback vs external interfaces, and UFW firewall rules.',
    strongAnswer:
      'I would investigate three primary areas: 1) Network Binding Address: By default, Elasticsearch binds only to "localhost" (127.0.0.1). If the request originates from another machine, it will be dropped. I would inspect /etc/elasticsearch/elasticsearch.yml to ensure "network.host: 0.0.0.0" is set. 2) Listening Sockets: Run "sudo ss -tulpn | grep 9200" to verify whether Java has actually bound port 9200 and check the bound IP. 3) Bootstrap Checks: If network.host was changed to a non-loopback IP, Elasticsearch enforces production bootstrap checks. If vm.max_map_count is too low, the service exits. I would check "sudo journalctl -u elasticsearch -n 50" for bootstrap failure logs. 4) Host Firewall: Check "sudo ufw status" to confirm whether port 9200 is allowed or blocked.',
    keyPoints: [
      'Check network.host in elasticsearch.yml (0.0.0.0 vs 127.0.0.1)',
      'Run ss -tulpn | grep 9200',
      'Check journalctl for bootstrap check aborts',
      'Verify host firewall rules',
    ],
    candidateMistakeToAvoid: 'Forgetting that binding to a routable IP activates production bootstrap checks in Elasticsearch.',
  },
  {
    id: 'int-5',
    category: 'Detection & IDS',
    question: 'What is the purpose of Suricata\'s eve.json file, and why is it superior to legacy fast.log?',
    interviewerIntent: 'Tests understanding of log parsing, structured vs unstructured data, and SIEM ingestion performance.',
    strongAnswer:
      'eve.json (Extensible Event Format) is Suricata’s all-in-one structured JSON output. Unlike the legacy fast.log—which is flat, human-readable text requiring complex regex grok filters to extract source IPs and ports—eve.json natively preserves rich hierarchical metadata for alerts, DNS queries, HTTP headers, TLS SNI certificates, and flow metrics. Because each line is a valid JSON object, shippers like Filebeat can ingest it directly into Elasticsearch with zero parsing overhead, preserving ECS data types and preventing regex-induced grok parse failures.',
    keyPoints: [
      'eve.json is fully structured JSON format',
      'Preserves L7 metadata: HTTP, DNS, TLS, flows, alerts',
      'Zero regex overhead for log shippers',
      'fast.log is legacy flat text that drops detailed metadata',
    ],
    candidateMistakeToAvoid: 'Saying fast.log is faster for the SIEM. fast.log is only easier for human eyes in a terminal; eve.json is exponentially superior for SIEM processing.',
  },
  {
    id: 'int-6',
    category: 'Incident Triage & Response',
    question: 'Kibana is running, but when you open Discover, no new events appear. How do you isolate where in the pipeline the data broke?',
    interviewerIntent: 'Tests ability to troubleshoot a multi-tier pipeline from front to back.',
    strongAnswer:
      'I use a divide-and-conquer strategy starting from the data source and following it down: 1) Verify packet generation: Run "sudo tail -f /var/log/suricata/eve.json" while triggering test traffic. If no lines append, Suricata is sniffing the wrong interface or rules are missing. 2) Verify shipper: Check Filebeat logs with "sudo journalctl -u filebeat -n 20" to ensure the harvester is active and not stuck in backoff. 3) Verify processor: Check Logstash logs for pipeline errors or 401 auth errors contacting Elasticsearch. 4) Verify database: Query Elasticsearch directly with "curl -k -u elastic:pass https://localhost:9200/_cat/indices" to see if document counts in the index are increasing. 5) Verify UI: Check the Kibana time picker. In 40% of cases, events exist, but the analyst’s time filter is set to "Last 15 minutes" for an attack that occurred an hour ago, or the index pattern Data View is mismatched.',
    keyPoints: [
      'Check eve.json updates on disk',
      'Check Filebeat publishing logs',
      'Check Logstash pipeline and HTTP responses',
      'Query Elasticsearch _cat/indices directly',
      'Check Kibana time picker and Data View pattern',
    ],
    candidateMistakeToAvoid: 'Focusing exclusively on Kibana without verifying whether documents exist in the underlying Elasticsearch index.',
  },
];
