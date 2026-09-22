// src/services/storage.service.ts
/**
 * Wrapper AsyncStorage centralisé.
 *
 * Toutes les clés de stockage de l'application sont déclarées ici
 * afin d'éviter les collisions et les incohérences.
 *
 * Catégories :
 *  - Session     : accessToken, refreshToken, user
 *  - Onboarding  : welcomeSeen
 *  - Préférences : theme
 *  - Cache       : queryCache (React Query persist)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// -----------------------------------------------------------------------------
// Clés de stockage
// -----------------------------------------------------------------------------

const KEYS = {
  // Session
  accessToken: '@ssi:accessToken',
  refreshToken: '@ssi:refreshToken',
  user: '@ssi:user',

  // Onboarding
  welcomeSeen: '@ssi:welcomeSeen',

  // Préférences
  theme: '@ssi:theme',

  // Cache React Query
  queryCache: '@ssi:queryCache',
} as const;

// -----------------------------------------------------------------------------
// Helpers internes
// -----------------------------------------------------------------------------

async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// -----------------------------------------------------------------------------
// Access token
// -----------------------------------------------------------------------------

export const accessTokenStorage = {
  get(): Promise<string | null> {
    return getItem(KEYS.accessToken);
  },

  set(value: string): Promise<void> {
    return setItem(KEYS.accessToken, value);
  },

  clear(): Promise<void> {
    return removeItem(KEYS.accessToken);
  },
};

// -----------------------------------------------------------------------------
// Refresh token
// -----------------------------------------------------------------------------

export const refreshTokenStorage = {
  get(): Promise<string | null> {
    return getItem(KEYS.refreshToken);
  },

  set(value: string): Promise<void> {
    return setItem(KEYS.refreshToken, value);
  },

  clear(): Promise<void> {
    return removeItem(KEYS.refreshToken);
  },
};

// -----------------------------------------------------------------------------
// Utilisateur connecté
// -----------------------------------------------------------------------------

export const userStorage = {
  async get<T = unknown>(): Promise<T | null> {
    const raw = await getItem(KEYS.user);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Donnée corrompue : on la supprime et on repart proprement.
      await removeItem(KEYS.user);
      return null;
    }
  },

  set(user: unknown): Promise<void> {
    return setItem(KEYS.user, JSON.stringify(user));
  },

  clear(): Promise<void> {
    return removeItem(KEYS.user);
  },
};

// -----------------------------------------------------------------------------
// Onboarding / Welcome
// -----------------------------------------------------------------------------

export const welcomeStorage = {
  async get(): Promise<boolean> {
    const value = await getItem(KEYS.welcomeSeen);
    return value === '1';
  },

  setSeen(): Promise<void> {
    return setItem(KEYS.welcomeSeen, '1');
  },

  reset(): Promise<void> {
    return removeItem(KEYS.welcomeSeen);
  },
};

// -----------------------------------------------------------------------------
// Thème
// -----------------------------------------------------------------------------

export const themeStorage = {
  get(): Promise<string | null> {
    return getItem(KEYS.theme);
  },

  set(value: string): Promise<void> {
    return setItem(KEYS.theme, value);
  },

  clear(): Promise<void> {
    return removeItem(KEYS.theme);
  },
};

// -----------------------------------------------------------------------------
// Cache React Query (persistance offline)
// -----------------------------------------------------------------------------

/**
 * Storage utilisé par `createAsyncStoragePersister` pour sauvegarder
 * et restaurer le cache React Query.
 *
 * L'interface attendue par le persister est :
 *  - getItem(key): Promise<string | null>
 *  - setItem(key, value): Promise<void>
 *  - removeItem(key): Promise<void>
 *
 * Le `key` est géré par le persister lui-même (voir `_layout.tsx`),
 * donc on utilise ici directement les helpers bruts.
 */
export const queryCacheStorage = {
  getItem(key: string): Promise<string | null> {
    return getItem(key);
  },

  setItem(key: string, value: string): Promise<void> {
    return setItem(key, value);
  },

  removeItem(key: string): Promise<void> {
    return removeItem(key);
  },

  /**
   * Vide UNIQUEMENT le cache React Query (les données métier en cache).
   * Ne touche PAS aux tokens, ni au welcome, ni au thème.
   *
   * Utile pour :
   *  - un bouton "Vider le cache" dans les paramètres
   *  - un nettoyage manuel en debug
   */
  async clear(): Promise<void> {
    await removeItem(KEYS.queryCache);
  },
};

// -----------------------------------------------------------------------------
// Session complète
// -----------------------------------------------------------------------------

export const authSession = {
  /**
   * Vide TOUTE la session (tokens + user).
   * Utilisé au logout et à l'expiration de session.
   *
   * ⚠️ N'efface PAS le cache React Query. Voir la note ci-dessous.
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      accessTokenStorage.clear(),
      refreshTokenStorage.clear(),
      userStorage.clear(),
    ]);
  },

  /**
   * Vide la session ET le cache React Query.
   *
   */
  async clearAllWithCache(): Promise<void> {
    await Promise.all([
      accessTokenStorage.clear(),
      refreshTokenStorage.clear(),
      userStorage.clear(),
      queryCacheStorage.clear(),
    ]);
  },
};