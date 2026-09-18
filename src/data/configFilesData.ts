import { ConfigFileDef } from '../types/socMasterLab';

export const CONFIG_FILE_LIBRARY: ConfigFileDef[] = [
  {
    path: '/etc/elasticsearch/elasticsearch.yml',
    component: 'Elasticsearch Daemon',
    purpose: 'Core configuration file governing node identity, cluster formation, network listeners, and xpack security.',
    whatItControls:
      'Defines the cluster name, node identifier, IPv4 interface bindings, discovery mechanisms, memory locking, and TLS certificate options.',
    parameters: [
      { key: 'cluster.name', value: 'soc-master-lab', purpose: 'Logical cluster grouping name', safeDefault: 'soc-master-lab' },
      { key: 'node.name', value: 'soc-siem-node01', purpose: 'Human-readable node name', safeDefault: 'soc-siem-node01' },
      { key: 'network.host', value: '0.0.0.0', purpose: 'Interface binding address (0.0.0.0 binds to all)', safeDefault: '0.0.0.0' },
      { key: 'http.port', value: '9200', purpose: 'HTTP REST API port', safeDefault: '9200' },
      { key: 'discovery.type', value: 'single-node', purpose: 'Disables multi-node bootstrap quorum check', safeDefault: 'single-node' },
      { key: 'xpack.security.enabled', value: 'true', purpose: 'Enforces user credentials and RBAC', safeDefault: 'true' },
    ],
    safeSnippet: `# ======================== Elasticsearch Configuration =========================
cluster.name: soc-master-lab
node.name: soc-siem-node01
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch

# Network binding
network.host: 0.0.0.0
http.port: 9200

# Standalone single-node mode (essential for single-VM lab)
discovery.type: single-node

# Security configuration
xpack.security.enabled: true
xpack.security.enrollment.enabled: true
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false`,
    nanoCommand: 'sudo nano /etc/elasticsearch/elasticsearch.yml',
    validationCommand: 'sudo -u elasticsearch /usr/share/elasticsearch/bin/elasticsearch-keystore list',
    commonErrors: [
      'Using tabs instead of 2 spaces causes immediate YAML scanner parser failure.',
      'Setting network.host to 0.0.0.0 without discovery.type: single-node triggers strict bootstrap check failures.',
      'Incorrect file ownership blocking read permissions for user "elasticsearch".',
    ],
  },
  {
    path: '/etc/logstash/conf.d/01-beats.conf',
    component: 'Logstash Pipeline',
    purpose: 'Defines the end-to-end Logstash event ingestion, parsing filter logic, and destination indexing rules.',
    whatItControls:
      'Input listeners (Beats port 5044), data transformation filters (json, grok, mutate), and output targets (Elasticsearch HTTP REST API).',
    parameters: [
      { key: 'input.beats.port', value: '5044', purpose: 'TCP port Logstash listens on for incoming Beats streams', safeDefault: '5044' },
      { key: 'filter.json.source', value: 'message', purpose: 'Unpacks raw JSON string into queryable Elasticsearch fields', safeDefault: 'message' },
      { key: 'output.elasticsearch.hosts', value: '["http://localhost:9200"]', purpose: 'Elasticsearch connection URL', safeDefault: '["http://localhost:9200"]' },
      { key: 'output.elasticsearch.index', value: 'soc-telemetry-%{+YYYY.MM.dd}', purpose: 'Dynamic daily index name format', safeDefault: 'soc-telemetry-%{+YYYY.MM.dd}' },
      { key: 'output.elasticsearch.user', value: 'elastic', purpose: 'Superuser account for indexing', safeDefault: 'elastic' },
      { key: 'output.elasticsearch.password', value: 'YOUR_PASSWORD', purpose: 'Password placeholder for Elasticsearch', safeDefault: 'YOUR_PASSWORD' },
    ],
    safeSnippet: `# ========================= Logstash Pipeline Configuration =========================
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][log_type] == "suricata" or [event][module] == "suricata" {
    json {
      source => "message"
      target => "suricata"
    }
  }

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
      'Missing closing bracket "}" in filter or output blocks.',
      'Unquoted string values in mutate blocks.',
      'Specifying incorrect password causes HTTP 401 response loop.',
    ],
  },
  {
    path: '/etc/kibana/kibana.yml',
    component: 'Kibana Web Interface',
    purpose: 'Directs the Kibana Node.js web server to its listener port and establishes the link to the Elasticsearch backend.',
    whatItControls:
      'Web server binding address (server.host), port (server.port), Elasticsearch connection endpoints, and encryption settings.',
    parameters: [
      { key: 'server.port', value: '5601', purpose: 'HTTP port served to analyst web browsers', safeDefault: '5601' },
      { key: 'server.host', value: '0.0.0.0', purpose: 'Binds to all interfaces so external browsers can connect', safeDefault: '0.0.0.0' },
      { key: 'elasticsearch.hosts', value: '["http://localhost:9200"]', purpose: 'Elasticsearch endpoint location', safeDefault: '["http://localhost:9200"]' },
      { key: 'elasticsearch.username', value: 'kibana_system', purpose: 'Dedicated internal system user', safeDefault: 'kibana_system' },
      { key: 'elasticsearch.password', value: 'YOUR_KIBANA_PASSWORD', purpose: 'Password for kibana_system account', safeDefault: 'YOUR_KIBANA_PASSWORD' },
    ],
    safeSnippet: `# ========================= Kibana Web Configuration =========================
server.port: 5601
server.host: "0.0.0.0"

elasticsearch.hosts: ["http://localhost:9200"]
elasticsearch.username: "kibana_system"
elasticsearch.password: "YOUR_KIBANA_PASSWORD"`,
    nanoCommand: 'sudo nano /etc/kibana/kibana.yml',
    validationCommand: 'sudo -u kibana /usr/share/kibana/bin/kibana-keystore list',
    commonErrors: [
      'Leaving server.host set to "localhost" blocks external browser connections.',
      'Attempting to use the "elastic" superuser instead of "kibana_system" for daemon credentials.',
    ],
  },
  {
    path: '/etc/filebeat/filebeat.yml',
    component: 'Filebeat Shipper',
    purpose: 'Specifies which log files on disk to harvest and designates where to transmit the streaming records.',
    whatItControls:
      'Harvester filestream paths, custom metadata tags, and output plugins (Logstash port 5044 or Elasticsearch port 9200).',
    parameters: [
      { key: 'filebeat.inputs[0].type', value: 'filestream', purpose: 'Modern file harvesting engine', safeDefault: 'filestream' },
      { key: 'filebeat.inputs[0].paths', value: '["/var/log/suricata/eve.json"]', purpose: 'Disk path of target log file', safeDefault: '["/var/log/suricata/eve.json"]' },
      { key: 'output.logstash.hosts', value: '["localhost:5044"]', purpose: 'Logstash TCP receiver address', safeDefault: '["localhost:5044"]' },
    ],
    safeSnippet: `# ============================== Filebeat Configuration ==============================
filebeat.inputs:
- type: filestream
  id: suricata-eve-stream
  enabled: true
  paths:
    - /var/log/suricata/eve.json
  fields:
    log_type: suricata
  fields_under_root: true

# ------------------------------ Logstash Output ------------------------------
output.logstash:
  hosts: ["localhost:5044"]

# --------------------------- Elasticsearch Output ----------------------------
# output.elasticsearch:
#   hosts: ["http://localhost:9200"]
#   username: "elastic"
#   password: "YOUR_PASSWORD"`,
    nanoCommand: 'sudo nano /etc/filebeat/filebeat.yml',
    validationCommand: 'sudo filebeat test config',
    commonErrors: [
      'Enabling both output.logstash and output.elasticsearch simultaneously causes startup crash.',
      'Indentation errors in YAML lists (must use 2 spaces).',
    ],
  },
  {
    path: '/etc/suricata/suricata.yaml',
    component: 'Suricata IDS Engine',
    purpose: 'Directs the network threat engine, establishes HOME_NET boundaries, attaches to network interfaces, and configures eve.json.',
    whatItControls:
      'af-packet capture interface, HOME_NET variables, rule file directories, and EVE JSON logging types.',
    parameters: [
      { key: 'vars.address-groups.HOME_NET', value: '[<SIEM_IP>/24]', purpose: 'Subnet considered protected internal network', safeDefault: '[<SIEM_IP>/24]' },
      { key: 'af-packet[0].interface', value: '<INTERFACE>', purpose: 'Network device to sniff in promiscuous mode', safeDefault: '<INTERFACE>' },
      { key: 'default-rule-path', value: '/var/lib/suricata/rules', purpose: 'Path where community rules are installed', safeDefault: '/var/lib/suricata/rules' },
    ],
    safeSnippet: `# ========================= Suricata Core Configuration =========================
vars:
  address-groups:
    HOME_NET: "[<SIEM_IP>/24, 192.168.1.0/24]"
    EXTERNAL_NET: "!$HOME_NET"

default-rule-path: /var/lib/suricata/rules
rule-files:
  - suricata.rules

af-packet:
  - interface: <INTERFACE>
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes

outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: /var/log/suricata/eve.json
      types:
        - alert:
            payload: yes
            metadata: yes
        - http
        - dns
        - tls`,
    nanoCommand: 'sudo nano /etc/suricata/suricata.yaml',
    validationCommand: 'sudo suricata -T -c /etc/suricata/suricata.yaml',
    commonErrors: [
      'Specifying an interface that does not exist in "ip link".',
      'Missing hyphen in outputs array.',
    ],
  },
];
