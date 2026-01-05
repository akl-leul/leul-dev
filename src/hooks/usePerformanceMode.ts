import { useState, useEffect, useCallback } from 'react';

type PerformanceLevel = 'high' | 'medium' | 'low';

interface PerformanceSettings {
  particleCount: number;
  animationSpeed: number;
  enableBloom: boolean;
  enableShadows: boolean;
  maxObjects: number;
}

const performancePresets: Record<PerformanceLevel, PerformanceSettings> = {
  high: {
    particleCount: 100,
    animationSpeed: 1,
    enableBloom: true,
    enableShadows: true,
    maxObjects: 20,
  },
  medium: {
    particleCount: 50,
    animationSpeed: 0.8,
    enableBloom: false,
    enableShadows: true,
    maxObjects: 12,
  },
  low: {
    particleCount: 20,
    animationSpeed: 0.5,
    enableBloom: false,
    enableShadows: false,
    maxObjects: 6,
  },
};

const STORAGE_KEY = 'performance-mode';

export function usePerformanceMode() {
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('high');
  const [isEnabled, setIsEnabled] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPerformanceLevel(parsed.level || 'high');
        setIsEnabled(parsed.enabled !== false);
      } catch {
        // Ignore parse errors
      }
    }

    // Auto-detect performance on first load
    if (!saved) {
      detectPerformance();
    }
  }, []);

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      level: performanceLevel,
      enabled: isEnabled,
    }));
  }, [performanceLevel, isEnabled]);

  const detectPerformance = useCallback(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPerformanceLevel('low');
      return;
    }

    // Check device memory (if available)
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory) {
      if (nav.deviceMemory < 4) {
        setPerformanceLevel('low');
        return;
      } else if (nav.deviceMemory < 8) {
        setPerformanceLevel('medium');
        return;
      }
    }

    // Check hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency <= 2) {
        setPerformanceLevel('low');
        return;
      } else if (navigator.hardwareConcurrency <= 4) {
        setPerformanceLevel('medium');
        return;
      }
    }

    // Default to high
    setPerformanceLevel('high');
  }, []);

  const settings = performancePresets[performanceLevel];

  return {
    performanceLevel,
    setPerformanceLevel,
    isEnabled,
    setIsEnabled,
    settings: isEnabled ? settings : performancePresets.low,
    detectPerformance,
  };
}

export type { PerformanceLevel, PerformanceSettings };
