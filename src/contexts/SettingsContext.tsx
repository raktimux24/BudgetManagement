import React, { createContext, useContext } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Profile } from '../types/profile';

interface SettingsContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  reloadProfile: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const {
    profile,
    loading,
    error,
    updateProfile,
    uploadProfilePicture,
    reloadProfile
  } = useProfile();

  const value = {
    profile,
    loading,
    error,
    updateProfile,
    uploadProfilePicture,
    reloadProfile
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}