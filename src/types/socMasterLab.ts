export type ModuleId =
  | 'prerequisites'
  | 'elasticsearch'
  | 'logstash'
  | 'kibana'
  | 'filebeat'
  | 'suricata'
  | 'harden-verify'
  | 'detection-labs'
  | 'troubleshooting'
  | 'capstone';

export type ViewMode =
  | 'dashboard'
  | 'module'
  | 'detection-labs'
  | 'troubleshooting'
  | 'capstone'
  | 'event-trace'
  | 'port-map'
  | 'config-library'
  | 'log-explorer'
  | 'interview-prep'
  | 'portfolio'
  | 'settings';

export type ComponentStatus = 'not-started' | 'in-progress' | 'completed' | 'failed' | 'verified';

export interface CommandItem {
  id: string;
  command: string;
  description: string;
  whyThisCommand: string;
  expectedOutput?: string;
  whatOutputMeans?: string;
  commonMistake?: string;
  troubleshooting?: string;
  note?: string;
  requiresSudo?: boolean;
}

export interface ConfigParameter {
  key: string;
  value: string;
  purpose: string;
  safeDefault: string;
}

export interface ConfigFileDef {
  path: string;
  component: string;
  purpose: string;
  whatItControls: string;
  parameters: ConfigParameter[];
  safeSnippet: string;
  nanoCommand: string;
  validationCommand?: string;
  commonErrors: string[];
}

export interface PortDef {
  component: string;
  port: number | string;
  protocol: 'TCP' | 'UDP' | 'HTTPS' | 'HTTP' | 'TCP/TLS';
  purpose: string;
  configFile: string;
  verificationCommand: string;
  troubleshootingCommands: string[];
  relatedComponents: string[];
}

export interface ErrorLab {
  id: string;
  title: string;
  symptom: string;
  whyItHappens: string;
  howToIdentify: string;
  diagnosticCommand: string;
  expectedErrorOutput: string;
  fixExplanation: string;
  fixCommand?: string;
  verificationCommand: string;
  verificationOutput: string;
}

export interface HandsOnLab {
  id: string;
  number: string;
  title: string;
  objective: string;
  prerequisites?: string[];
  steps: {
    stepNumber: number;
    instruction: string;
    command?: string;
    why: string;
    expectedResult: string;
  }[];
  verificationPrompt: string;
  expectedVerification: string;
}

export interface Challenge {
  id: string;
  title: string;
  scenario: string;
  question: string;
  hint: string;
  acceptedAnswers: string[];
  correctExplanation: string;
  troubleshootingTip: string;
  commandSuggestion?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  verifyCommand?: string;
}

export interface ModuleData {
  id: ModuleId;
  moduleNumber: string;
  title: string;
  tagline: string;
  badge: string;
  level: 'Level 1: Foundation' | 'Level 2: SIEM Stack' | 'Level 3: SOC Detection';
  estimatedMinutes: number;
  overview: {
    whatIsIt: string;
    whyDoWeNeedIt: string;
    problemSolved: string;
    architectureRole: string;
    diagramText?: string;
  };
  prerequisites: string[];
  importantPorts: PortDef[];
  configurationFile: ConfigFileDef;
  serviceManagement: {
    serviceName: string;
    startCommand: string;
    stopCommand: string;
    restartCommand: string;
    enableCommand: string;
    statusCommand: string;
    logsCommand: string;
    explanation: string;
  };
  installationSteps: CommandItem[];
  verificationSteps: CommandItem[];
  logsExplanation: {
    primaryPath: string;
    inspectionCommands: CommandItem[];
    keyLogPatterns: { pattern: string; meaning: string }[];
  };
  commonErrors: ErrorLab[];
  handsOnLabs: HandsOnLab[];
  challenges: Challenge[];
  quizQuestions: QuizQuestion[];
  interviewQuestions: {
    question: string;
    modelAnswer: string;
    keyPoints: string[];
  }[];
  checklist: ChecklistItem[];
}

export interface DetectionLabScenario {
  id: string;
  number: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'Reconnaissance' | 'Credential Access' | 'Web Attack';
  objective: string;
  targetEnvironment: string;
  kaliAttackerCommand: string;
  attackerExplanation: string;
  suricataSignature: {
    sid: number;
    rule: string;
    explanation: string;
  };
  eveJsonSample: Record<string, any>;
  jsonExplanation: { field: string; meaning: string }[];
  kqlQuery: string;
  investigationQuestions: {
    question: string;
    answer: string;
    socTip: string;
  }[];
  containmentRecommendation: string;
}

export interface TroubleshootingScenario {
  id: string;
  title: string;
  component: string;
  symptom: string;
  rootCause: string;
  detectionCommand: string;
  expectedErrorSnippet: string;
  stepByStepResolution: string[];
  verifyFixCommand: string;
  expectedFixOutput: string;
  preventionTip: string;
}

export interface CapstoneStage {
  stageNumber: number;
  title: string;
  objective: string;
  analystTask: string;
  commandToRun?: string;
  simulatedResult?: string;
  challengeQuestion: string;
  acceptedAnswer: string;
  acceptedAlternatives?: string[];
  hint: string;
  socInsight: string;
}

export interface LabEnvironmentVariables {
  siemIp: string;
  kaliIp: string;
  windowsIp: string;
  elasticsearchPort: string;
  logstashPort: string;
  kibanaPort: string;
  suricataInterface: string;
}

export interface UserProgressState {
  completedModules: Record<string, boolean>;
  checklistProgress: Record<string, boolean>;
  completedChallenges: Record<string, boolean>;
  quizScores: Record<string, number>;
  completedLabs: Record<string, boolean>;
  capstoneStageProgress: number;
  capstoneCompleted: boolean;
  notes: Record<string, string>;
}
