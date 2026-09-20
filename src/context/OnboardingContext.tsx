// src/context/OnboardingContext.tsx
/**
 * Gère le flag "a déjà vu le welcome".
 * - Au 1er lancement : welcomeSeen = false → on affiche /welcome
 * - Ensuite : welcomeSeen = true → on va direct sur les tabs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = '@ssi:welcomeSeen';

interface OnboardingContextValue {
  welcomeSeen: boolean | null; // null = pas encore lu
  markWelcomeSeen: () => void;
  resetWelcome: () => void; // utile pour tester
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(STORAGE_KEY);
      setWelcomeSeen(v === '1');
    })();
  }, []);

  const markWelcomeSeen = useCallback(() => {
    setWelcomeSeen(true);
    AsyncStorage.setItem(STORAGE_KEY, '1').catch(() => {});
  }, []);

  const resetWelcome = useCallback(() => {
    setWelcomeSeen(false);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ welcomeSeen, markWelcomeSeen, resetWelcome }),
    [welcomeSeen, markWelcomeSeen, resetWelcome]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error('useOnboarding doit être utilisé dans <OnboardingProvider>');
  return ctx;
}