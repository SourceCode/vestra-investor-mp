import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { TenantConfig } from '../types';

const defaultTenant: TenantConfig = {
  name: 'Vestra',
  marketplaceName: 'Vestra Marketplace',
  logoUrl: '', 
  primaryColor: '#0f172a',
  supportEmail: 'support@vestra.com'
};

const TenantContext = createContext<TenantConfig>(defaultTenant);

export const TenantConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSelector((state: RootState) => state.organization);

  const config: TenantConfig = settings ? {
      name: settings.name,
      marketplaceName: settings.marketplaceName,
      logoUrl: settings.logoUrl || '',
      primaryColor: settings.primaryColor,
      supportEmail: settings.supportEmail
  } : defaultTenant;

  return (
    <TenantContext.Provider value={config}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
