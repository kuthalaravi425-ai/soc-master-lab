import React from 'react';
import { SocMasterLabProvider } from '../../context/SocMasterLabContext';
import { SocMasterLayout } from './layout/SocMasterLayout';

interface SocMasterLabAppProps {
  onSwitchToEnterprise?: () => void;
}

export const SocMasterLabApp: React.FC<SocMasterLabAppProps> = ({ onSwitchToEnterprise }) => {
  return (
    <SocMasterLabProvider>
      <SocMasterLayout onSwitchToEnterprise={onSwitchToEnterprise} />
    </SocMasterLabProvider>
  );
};
