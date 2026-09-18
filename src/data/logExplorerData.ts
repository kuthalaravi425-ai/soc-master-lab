export interface LogSample {
  id: string;
  title: string;
  sourceFile: string;
  category: string;
  jsonContent: Record<string, any>;
  fieldExplanations: { field: string; type: string; meaning: string }[];
}

export const SAMPLE_LOGS: LogSample[] = [
  {
    id: 'log-eve-alert',
    title: 'Suricata EVE JSON Intrusion Alert',
    sourceFile: '/var/log/suricata/eve.json',
    category: 'Network IDS',
    jsonContent: {
      timestamp: '2026-09-18T14:32:01.819201+0000',
      flow_id: 10928374192834,
      in_iface: 'eth0',
      event_type: 'alert',
      src_ip: '192.168.1.100',
      src_port: 51240,
      dest_ip: '192.168.1.50',
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
      tcp: {
        tcp_flags: '02',
        syn: true,
      },
    },
    fieldExplanations: [
      { field: 'timestamp', type: 'string (ISO 8601)', meaning: 'Exact microsecond timestamp when packet reached the NIC.' },
      { field: 'flow_id', type: 'integer', meaning: 'Unique 64-bit integer grouping all packets in this 5-tuple bi-directional TCP session.' },
      { field: 'event_type', type: 'string', meaning: 'Classifies this record: "alert", "flow", "http", "dns", or "tls".' },
      { field: 'src_ip / dest_ip', type: 'ip', meaning: 'Originating source host and destination targeted host.' },
      { field: 'dest_port', type: 'integer', meaning: 'Service port targeted (22 = SSH).' },
      { field: 'alert.signature', type: 'string', meaning: 'Descriptive title of the intrusion rule that matched.' },
      { field: 'alert.signature_id', type: 'integer', meaning: 'Suricata SID used in ruleset management and suppression.' },
      { field: 'tcp.syn', type: 'boolean', meaning: 'Confirms the packet had the SYN control bit set.' },
    ],
  },
  {
    id: 'log-filebeat-publish',
    title: 'Filebeat Normalized Event Payload',
    sourceFile: 'Streaming Memory Buffer',
    category: 'Log Shipper',
    jsonContent: {
      '@timestamp': '2026-09-18T14:32:02.100Z',
      agent: {
        type: 'filebeat',
        version: '8.12.2',
        hostname: 'soc-siem-node01',
      },
      log: {
        offset: 89412,
        file: {
          path: '/var/log/suricata/eve.json',
        },
      },
      fields: {
        log_type: 'suricata',
      },
      message: '{"timestamp":"2026-09-18T14:32:01.819201+0000","event_type":"alert","src_ip":"192.168.1.100"...}',
    },
    fieldExplanations: [
      { field: '@timestamp', type: 'date', meaning: 'Time Filebeat read and ingested the event from disk.' },
      { field: 'agent.version', type: 'string', meaning: 'Active Filebeat agent version.' },
      { field: 'log.offset', type: 'integer', meaning: 'Byte pointer in the file; used by registry to resume after restart.' },
      { field: 'log.file.path', type: 'string', meaning: 'Absolute file path harvested on the host OS.' },
      { field: 'message', type: 'string', meaning: 'Raw unparsed line harvested before Logstash unpacks it.' },
    ],
  },
  {
    id: 'log-es-doc',
    title: 'Elasticsearch Indexed Security Document',
    sourceFile: 'GET /soc-telemetry-*/_doc/1',
    category: 'Database / Storage',
    jsonContent: {
      _index: 'soc-telemetry-2026.09.18',
      _id: 'd9G7xokB_WqZ80X',
      _score: 1.0,
      _source: {
        '@timestamp': '2026-09-18T14:32:01.819Z',
        source: {
          ip: '192.168.1.100',
          port: 51240,
        },
        destination: {
          ip: '192.168.1.50',
          port: 22,
        },
        event: {
          category: 'intrusion_detection',
          action: 'alert',
          severity: 2,
        },
        suricata: {
          alert: {
            signature: 'ET SCAN Potential Nmap SYN Scan to Critical Ports',
            signature_id: 2009582,
          },
        },
      },
    },
    fieldExplanations: [
      { field: '_index', type: 'string', meaning: 'Target Elasticsearch index where document lives.' },
      { field: '_id', type: 'string', meaning: 'Unique Lucene document identifier.' },
      { field: '_source', type: 'object', meaning: 'The original structured JSON document stored on disk.' },
      { field: 'source.ip', type: 'ip', meaning: 'ECS-normalized source IP field enabling CIDR and geo queries.' },
      { field: 'event.category', type: 'keyword', meaning: 'Categorization taxonomy used in Kibana SIEM.' },
    ],
  },
  {
    id: 'log-ssh-auth',
    title: 'Linux OpenSSH Authentication Failure Log',
    sourceFile: '/var/log/auth.log',
    category: 'Host Telemetry',
    jsonContent: {
      timestamp: 'Sep 18 14:48:10',
      hostname: 'siem-master-node',
      process: 'sshd',
      pid: 9241,
      auth_event: 'Failed password',
      target_user: 'root',
      src_ip: '192.168.1.100',
      src_port: 48920,
      protocol: 'ssh2',
    },
    fieldExplanations: [
      { field: 'auth_event', type: 'string', meaning: 'Indicates the authentication attempt was rejected.' },
      { field: 'target_user', type: 'string', meaning: 'Username submitted by the attacker.' },
      { field: 'src_ip', type: 'ip', meaning: 'IP of the attacking workstation trying passwords.' },
      { field: 'pid', type: 'integer', meaning: 'Process ID spawned by sshd to handle the connection.' },
    ],
  },
];
