// src/context/ThemeContext.tsx
/**
 * Fournit le thème actif à toute l'app.
 * - Persiste le choix dans AsyncStorage.
 * - Expose setTheme(name) et le thème courant.
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

import { ThemeColors, ThemeName, Themes } from '@/constants/theme';

const STORAGE_KEY = '@ssi:theme';

interface ThemeContextValue {
  /** Nom du thème actif */
  name: ThemeName;
  /** Couleurs du thème actif */
  colors: ThemeColors;
  /** Change le thème (persisté) */
  setTheme: (name: ThemeName) => void;
  /** true tant que le thème n'a pas été chargé depuis le storage */
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState<ThemeName>('darkBlue');
  const [loading, setLoading] = useState(true);

  // Chargement initial depuis AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && stored in Themes) {
          setName(stored as ThemeName);
        }
      } catch {
        // silencieux : on garde le thème par défaut
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setName(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      name,
      colors: Themes[name],
      setTheme,
      loading,
    }),
    [name, setTheme, loading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
}