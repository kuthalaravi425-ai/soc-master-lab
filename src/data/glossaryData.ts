export interface GlossaryTerm {
  term: string;
  category: 'Fundamentals' | 'Detection & IDS' | 'SIEM & Analytics' | 'Triage & Response';
  definition: string;
  beginnerExample: string;
  socRelevance: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'SIEM (Security Information & Event Management)',
    category: 'SIEM & Analytics',
    definition: 'A centralized platform that aggregates, normalizes, correlates, and analyzes security telemetry across an organization\'s entire infrastructure.',
    beginnerExample: 'Like an airport air traffic control tower: it watches radar from every airplane, luggage sensor, and gate camera simultaneously.',
    socRelevance: 'Elasticsearch + Kibana form the SIEM core where analysts triage alerts, run threat hunts, and construct investigation timelines.',
  },
  {
    term: 'IDS (Intrusion Detection System)',
    category: 'Detection & IDS',
    definition: 'A device or software application that passively monitors network traffic for malicious activity or policy violations and generates alerts.',
    beginnerExample: 'Like a home burglar alarm that rings loudly when an unauthorized window is opened, but doesn\'t physically wrestle the burglar.',
    socRelevance: 'Suricata acts as our IDS, sniffing raw wire packets and writing alerts to eve.json.',
  },
  {
    term: 'IPS (Intrusion Prevention System)',
    category: 'Detection & IDS',
    definition: 'An active security system that inspects network traffic inline and has the capability to drop, reject, or block packets in real time.',
    beginnerExample: 'Like a bouncer at a club door who physically stops individuals on a blacklist from entering.',
    socRelevance: 'Suricata can be placed inline using NFQUEUE or AF_PACKET IPS mode to reject exploit payloads.',
  },
  {
    term: 'EDR (Endpoint Detection & Response)',
    category: 'Detection & IDS',
    definition: 'Software installed on endpoints (workstations, servers) that continuously records process creation, file modifications, and memory injections.',
    beginnerExample: 'Like a black-box flight recorder installed inside every individual computer cockpit.',
    socRelevance: 'Complements network IDS by confirming whether an exploit packet actually executed a shell or malicious process on the host.',
  },
  {
    term: 'Telemetry',
    category: 'Fundamentals',
    definition: 'The automated collection and transmission of data, metrics, and logs from remote devices to a centralized receiving system.',
    beginnerExample: 'The continuous speed, tire pressure, and oil temperature gauges streaming from a Formula 1 car to the pit crew.',
    socRelevance: 'In a SOC, telemetry includes firewall drops, DNS requests, SSH login attempts, and Suricata alerts.',
  },
  {
    term: 'Event vs Alert vs Incident',
    category: 'Triage & Response',
    definition: 'An Event is any observable occurrence (e.g. user logged in). An Alert is an event flagged as potentially suspicious by a rule. An Incident is a confirmed security breach with adverse impact.',
    beginnerExample: 'Event: Door opens. Alert: Door opens at 3:00 AM. Incident: Door was kicked in and jewelry is missing.',
    socRelevance: 'SOC analysts triage thousands of alerts to find the handful of true security incidents.',
  },
  {
    term: 'False Positive (FP) vs True Positive (TP)',
    category: 'Triage & Response',
    definition: 'A False Positive is an alert that triggers on benign, legitimate activity. A True Positive is an alert that correctly identifies genuine malicious activity.',
    beginnerExample: 'False Positive: Fire alarm goes off because someone burned toast. True Positive: Fire alarm goes off because the kitchen curtains are burning.',
    socRelevance: 'Tuning SIEM rules to minimize false positives prevents analyst alert fatigue.',
  },
  {
    term: 'Signature / Indicator of Compromise (IoC)',
    category: 'Detection & IDS',
    definition: 'A distinct fingerprint, pattern, byte sequence, hash, or IP address that uniquely identifies known malicious behavior.',
    beginnerExample: 'Like a fugitive\'s fingerprint or license plate number entered into a highway camera scanner.',
    socRelevance: 'Suricata uses 40,000+ signatures to spot known CVE exploits and botnet command-and-control beacons.',
  },
  {
    term: 'Triage',
    category: 'Triage & Response',
    definition: 'The initial evaluation process of incoming alerts to assess priority, validate legitimacy, eliminate false positives, and route genuine threats for deep investigation.',
    beginnerExample: 'Hospital emergency room nurses checking vital signs to treat heart attack patients before minor scrapes.',
    socRelevance: 'Level 1 SOC analysts spend 80% of their time conducting alert triage in Kibana.',
  },
  {
    term: 'Least Privilege',
    category: 'Fundamentals',
    definition: 'A foundational security principle stating that users, processes, and programs must be granted only the minimum permissions required to perform their specific task.',
    beginnerExample: 'A hotel guest keycard opens only their room and the elevator, not the manager\'s office or hotel safe.',
    socRelevance: 'Enforced via UFW firewall rules, restricting Elasticsearch access to localhost, and running services under non-root service users.',
  },
];
