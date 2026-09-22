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

// -----------------------------------------------------------------------------
// Synchronisation du token push
// -----------------------------------------------------------------------------

async function syncPushToken(): Promise<void> {
  try {
    const pushToken = await registerForPushNotificationsAsync();

    if (!pushToken) {
      return;
    }

    await authService.registerPushToken(pushToken);
    console.log('✅ Push token enregistré');
  } catch (error) {
    // Le push ne doit jamais empêcher l'authentification.
    console.warn('Enregistrement push échoué', error);
  }
}

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Restauration de session au démarrage
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const [accessToken, refreshToken, storedUser] = await Promise.all([
          accessTokenStorage.get(),
          refreshTokenStorage.get(),
          userStorage.get<AuthUser>(),
        ]);

        if (!mounted) {
          return;
        }

        /**
         * La session est valide uniquement si les trois éléments existent.
         * Une session partielle est supprimée immédiatement.
         */
        if (accessToken && refreshToken && storedUser) {
          setUser(storedUser);

          // Le push est indépendant du chargement de la route.
          void syncPushToken();
        } else {
          /**
           * ⚠️ On utilise `clearAll` (SANS cache) ici :
           * si l'utilisateur relance l'app après une déconnexion serveur
           * silencieuse, on ne veut PAS perdre le cache React Query,
           * sinon l'app démarre offline avec un écran vide.
           *
           * Le cache sera purgé uniquement au logout explicite
           * (bouton "Se déconnecter").
           */
          await authSession.clearAll();
          setUser(null);
        }
      } catch {
        await authSession.clearAll();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Session expirée (déclenchée par http.service au refresh KO)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setSessionExpiredCallback(() => {
      /**
       * Important :
       * il ne faut pas seulement faire setUser(null).
       * Les tokens doivent également être supprimés du storage.
       *
       * ⚠️ On garde `clearAll` (SANS cache) : on ne veut pas jeter
       * le cache React Query simplement parce que la session a expiré.
       * Le cache reste utile si l'utilisateur se reconnecte.
       */
      setUser(null);
      void authSession.clearAll();
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  const login = useCallback(
    async (code: string): Promise<'ok' | 'invalid' | 'error'> => {
      try {
        const response = await authService.login(code);

        /**
         * On sauvegarde les données avant setUser.
         * Ainsi, si l'utilisateur ferme l'application immédiatement,
         * la session pourra être restaurée correctement.
         */
        await Promise.all([
          accessTokenStorage.set(response.accessToken),
          refreshTokenStorage.set(response.refreshToken),
          userStorage.set(response.user),
        ]);

        setUser(response.user);

        /**
         * Le token push est synchronisé après la connexion.
         * Une erreur push ne transforme pas le login en erreur.
         */
        await syncPushToken();

        return 'ok';
      } catch (error: any) {
        if (error?.response?.status === 401) {
          return 'invalid';
        }

        return 'error';
      }
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Logout (explicite, déclenché par le bouton "Se déconnecter")
  // ---------------------------------------------------------------------------

  const logout = useCallback(async () => {
    /**
     * On désinscrit le token push avant de supprimer la session.
     */
    try {
      await authService.unregisterPushToken();
    } catch {
      // Erreur silencieuse.
    }

    /**
     * Le logout serveur peut échouer.
     * La session locale doit tout de même être supprimée.
     */
    await authService.logout();

    /**
     * 🔒 On vide la session ET le cache React Query.
     *
     * Comme ça, si un AUTRE utilisateur se connecte ensuite sur le
     * même téléphone, il ne verra pas les données en cache du
     * précédent utilisateur.
     */
    await authSession.clearAllWithCache();

    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  }

  return context;
}