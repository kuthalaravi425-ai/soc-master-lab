import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ModuleId,
  ViewMode,
  LabEnvironmentVariables,
  UserProgressState,
} from '../types/socMasterLab';

const DEFAULT_LAB_VARS: LabEnvironmentVariables = {
  siemIp: '192.168.1.50',
  kaliIp: '192.168.1.100',
  windowsIp: '192.168.1.75',
  elasticsearchPort: '9200',
  logstashPort: '5044',
  kibanaPort: '5601',
  suricataInterface: 'eth0',
};

const DEFAULT_PROGRESS: UserProgressState = {
  completedModules: {},
  checklistProgress: {},
  completedChallenges: {},
  quizScores: {},
  completedLabs: {},
  capstoneStageProgress: 1,
  capstoneCompleted: false,
  notes: {},
};

interface SocMasterLabContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  activeModuleId: ModuleId;
  setActiveModuleId: (id: ModuleId) => void;
  labVars: LabEnvironmentVariables;
  updateLabVar: (key: keyof LabEnvironmentVariables, val: string) => void;
  resetLabVars: () => void;
  interpolate: (text: string) => string;
  progress: UserProgressState;
  toggleChecklistItem: (itemId: string) => void;
  markModuleCompleted: (modId: string, val?: boolean) => void;
  markChallengeCompleted: (challengeId: string) => void;
  saveQuizScore: (modId: string, score: number) => void;
  markLabCompleted: (labId: string) => void;
  setCapstoneStage: (stage: number) => void;
  setCapstoneCompleted: (val: boolean) => void;
  saveNote: (key: string, note: string) => void;
  resetAllProgress: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  isNanoModalOpen: boolean;
  setIsNanoModalOpen: (val: boolean) => void;
  isTerminalModalOpen: boolean;
  setIsTerminalModalOpen: (val: boolean) => void;
  terminalInitialCommand?: string;
  openTerminalWithCommand: (cmd?: string) => void;
  overallPercentage: number;
  totalCompletedModulesCount: number;
  currentRank: 'Beginner' | 'Lab Builder' | 'SIEM Operator' | 'SOC Investigator';
}

const SocMasterLabContext = createContext<SocMasterLabContextType | undefined>(undefined);

const STORAGE_VARS_KEY = 'soc_master_lab_vars_v1';
const STORAGE_PROGRESS_KEY = 'soc_master_lab_progress_v1';

export const SocMasterLabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('prerequisites');

  const [labVars, setLabVars] = useState<LabEnvironmentVariables>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_VARS_KEY);
      return stored ? { ...DEFAULT_LAB_VARS, ...JSON.parse(stored) } : DEFAULT_LAB_VARS;
    } catch {
      return DEFAULT_LAB_VARS;
    }
  });

  const [progress, setProgress] = useState<UserProgressState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROGRESS_KEY);
      return stored ? { ...DEFAULT_PROGRESS, ...JSON.parse(stored) } : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNanoModalOpen, setIsNanoModalOpen] = useState(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [terminalInitialCommand, setTerminalInitialCommand] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VARS_KEY, JSON.stringify(labVars));
    } catch (e) {
      console.error('Failed to save lab variables to localStorage', e);
    }
  }, [labVars]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }, [progress]);

  const updateLabVar = (key: keyof LabEnvironmentVariables, val: string) => {
    setLabVars(prev => ({ ...prev, [key]: val }));
  };

  const resetLabVars = () => {
    setLabVars(DEFAULT_LAB_VARS);
  };

  const interpolate = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/<SIEM_IP>/g, labVars.siemIp || '192.168.1.50')
      .replace(/<LAB_TARGET_IP>/g, labVars.siemIp || '192.168.1.50')
      .replace(/<KALI_IP>/g, labVars.kaliIp || '192.168.1.100')
      .replace(/<WINDOWS_IP>/g, labVars.windowsIp || '192.168.1.75')
      .replace(/<ES_PORT>/g, labVars.elasticsearchPort || '9200')
      .replace(/<LOGSTASH_PORT>/g, labVars.logstashPort || '5044')
      .replace(/<KIBANA_PORT>/g, labVars.kibanaPort || '5601')
      .replace(/<INTERFACE>/g, labVars.suricataInterface || 'eth0');
  };

  const toggleChecklistItem = (itemId: string) => {
    setProgress(prev => ({
      ...prev,
      checklistProgress: {
        ...prev.checklistProgress,
        [itemId]: !prev.checklistProgress[itemId],
      },
    }));
  };

  const markModuleCompleted = (modId: string, val?: boolean) => {
    setProgress(prev => ({
      ...prev,
      completedModules: {
        ...prev.completedModules,
        [modId]: val !== undefined ? val : !prev.completedModules[modId],
      },
    }));
  };

  const markChallengeCompleted = (challengeId: string) => {
    setProgress(prev => ({
      ...prev,
      completedChallenges: {
        ...prev.completedChallenges,
        [challengeId]: true,
      },
    }));
  };

  const saveQuizScore = (modId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [modId]: score,
      },
    }));
  };

  const markLabCompleted = (labId: string) => {
    setProgress(prev => ({
      ...prev,
      completedLabs: {
        ...prev.completedLabs,
        [labId]: true,
      },
    }));
  };

  const setCapstoneStage = (stage: number) => {
    setProgress(prev => ({
      ...prev,
      capstoneStageProgress: Math.max(prev.capstoneStageProgress, stage),
    }));
  };

  const setCapstoneCompleted = (val: boolean) => {
    setProgress(prev => ({
      ...prev,
      capstoneCompleted: val,
      completedModules: {
        ...prev.completedModules,
        capstone: val,
      },
    }));
  };

  const saveNote = (key: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [key]: note,
      },
    }));
  };

  const resetAllProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress, checklists, and challenge completions?')) {
      setProgress(DEFAULT_PROGRESS);
      localStorage.removeItem(STORAGE_PROGRESS_KEY);
    }
  };

  const openTerminalWithCommand = (cmd?: string) => {
    setTerminalInitialCommand(cmd);
    setIsTerminalModalOpen(true);
  };

  const totalCompletedModulesCount = useMemo(() => {
    const mainKeys = [
      'prerequisites',
      'elasticsearch',
      'logstash',
      'kibana',
      'filebeat',
      'suricata',
      'harden-verify',
      'detection-labs',
      'troubleshooting',
      'capstone',
    ];
    return mainKeys.filter(k => progress.completedModules[k]).length;
  }, [progress.completedModules]);

  const overallPercentage = useMemo(() => {
    const totalModules = 10;
    return Math.round((totalCompletedModulesCount / totalModules) * 100);
  }, [totalCompletedModulesCount]);

  const currentRank = useMemo((): 'Beginner' | 'Lab Builder' | 'SIEM Operator' | 'SOC Investigator' => {
    if (progress.capstoneCompleted || totalCompletedModulesCount >= 9) return 'SOC Investigator';
    if (totalCompletedModulesCount >= 6) return 'SIEM Operator';
    if (totalCompletedModulesCount >= 2) return 'Lab Builder';
    return 'Beginner';
  }, [totalCompletedModulesCount, progress.capstoneCompleted]);

  return (
    <SocMasterLabContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeModuleId,
        setActiveModuleId,
        labVars,
        updateLabVar,
        resetLabVars,
        interpolate,
        progress,
        toggleChecklistItem,
        markModuleCompleted,
        markChallengeCompleted,
        saveQuizScore,
        markLabCompleted,
        setCapstoneStage,
        setCapstoneCompleted,
        saveNote,
        resetAllProgress,
        isSearchOpen,
        setIsSearchOpen,
        isNanoModalOpen,
        setIsNanoModalOpen,
        isTerminalModalOpen,
        setIsTerminalModalOpen,
        terminalInitialCommand,
        openTerminalWithCommand,
        overallPercentage,
        totalCompletedModulesCount,
        currentRank,
      }}
    >
      {children}
    </SocMasterLabContext.Provider>
  );
};

export const useSocMasterLab = (): SocMasterLabContextType => {
  const context = useContext(SocMasterLabContext);
  if (!context) {
    throw new Error('useSocMasterLab must be used within a SocMasterLabProvider');
  }
  return context;
};
