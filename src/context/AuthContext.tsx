// src/context/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { setSessionExpiredCallback } from '@/api/client';
import { authService } from '@/services/auth.service';
import { registerForPushNotificationsAsync } from '@/services/push.service';
import {
  accessTokenStorage,
  authSession,
  refreshTokenStorage,
  userStorage,
} from '@/services/storage.service';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (code: string) => Promise<'ok' | 'invalid' | 'error'>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ------------------------------------------------------------------
// Helper : enregistre le push token en silence
// ------------------------------------------------------------------
async function syncPushToken() {
  try {
    const pushToken = await registerForPushNotificationsAsync();
    if (pushToken) {
      await authService.registerPushToken(pushToken);
      console.log('✅ Push token enregistré');
    }
  } catch (err) {
    console.warn('Enregistrement push échoué', err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------------
  // Restauration de session au démarrage
  // ------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const [access, refresh, storedUser] = await Promise.all([
          accessTokenStorage.get(),
          refreshTokenStorage.get(),
          userStorage.get<AuthUser>(),
        ]);

        if (access && refresh && storedUser) {
          setUser(storedUser);
          // Enregistre le push token en silence (au cas où)
          syncPushToken();
        } else {
          await authSession.clearAll();
        }
      } catch {
        await authSession.clearAll();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------------------------------------------------------------------
  // Callback global : session expirée
  // ------------------------------------------------------------------
  useEffect(() => {
    setSessionExpiredCallback(() => {
      setUser(null);
    });
  }, []);

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  const login = useCallback(
    async (code: string): Promise<'ok' | 'invalid' | 'error'> => {
      try {
        const res = await authService.login(code);

        await Promise.all([
          accessTokenStorage.set(res.accessToken),
          refreshTokenStorage.set(res.refreshToken),
          userStorage.set(res.user),
        ]);

        setUser(res.user);

        // Enregistre le push token (await pour être sûr)
        await syncPushToken();

        return 'ok';
      } catch (err: any) {
        if (err?.response?.status === 401) return 'invalid';
        return 'error';
      }
    },
    [],
  );

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    // Désinscris le push token AVANT de nettoyer la session
    try {
      await authService.unregisterPushToken();
    } catch {
      // silencieux
    }

    await authService.logout();
    await authSession.clearAll();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}