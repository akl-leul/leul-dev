import { createContext, useContext, ReactNode } from 'react';
import { usePerformanceMode, PerformanceLevel, PerformanceSettings } from '@/hooks/usePerformanceMode';

interface PerformanceContextType {
  performanceLevel: PerformanceLevel;
  setPerformanceLevel: (level: PerformanceLevel) => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  settings: PerformanceSettings;
  detectPerformance: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const performanceMode = usePerformanceMode();

  return (
    <PerformanceContext.Provider value={performanceMode}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}
