// src/services/storage.service.ts
/**
 * Wrapper AsyncStorage centralisé.
 * Toutes les clés de stockage passent par ici.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------------------------------------------------
// Clés
// ------------------------------------------------------------------
const KEYS = {
  accessToken: '@ssi:accessToken',
  refreshToken: '@ssi:refreshToken',
  user: '@ssi:user',
  welcomeSeen: '@ssi:welcomeSeen',
  theme: '@ssi:theme',
} as const;

// ------------------------------------------------------------------
// Helpers génériques
// ------------------------------------------------------------------
async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// ------------------------------------------------------------------
// Access token
// ------------------------------------------------------------------
export const accessTokenStorage = {
  get: () => getItem(KEYS.accessToken),
  set: (v: string) => setItem(KEYS.accessToken, v),
  clear: () => removeItem(KEYS.accessToken),
};

// ------------------------------------------------------------------
// Refresh token
// ------------------------------------------------------------------
export const refreshTokenStorage = {
  get: () => getItem(KEYS.refreshToken),
  set: (v: string) => setItem(KEYS.refreshToken, v),
  clear: () => removeItem(KEYS.refreshToken),
};

// ------------------------------------------------------------------
// User (profil connecté)
// ------------------------------------------------------------------
export const userStorage = {
  get: async <T = unknown>(): Promise<T | null> => {
    const raw = await getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  set: (user: unknown) => setItem(KEYS.user, JSON.stringify(user)),
  clear: () => removeItem(KEYS.user),
};

// ------------------------------------------------------------------
// Nettoyage total de la session
// ⚠️ Renommé "authSession" (au lieu de "sessionStorage") pour éviter
//    la collision avec la Web API globale sur Expo Web.
// ------------------------------------------------------------------
export const authSession = {
  clearAll: async (): Promise<void> => {
    await Promise.all([
      accessTokenStorage.clear(),
      refreshTokenStorage.clear(),
      userStorage.clear(),
    ]);
  },
};