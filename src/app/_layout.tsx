// src/app/_layout.tsx
/**
 * Layout racine de l'application.
 *
 * Objectifs :
 *  - Ne jamais afficher les tabs avant la fin de la restauration de session.
 *  - Attendre que la bonne route soit affichée avant de masquer le splash.
 *  - Éviter le flash "(tabs)" → "/login".
 *  - Persister le cache React Query pour un usage offline en lecture.
 */

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlertProvider } from '@/context/AlertContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  NotificationsProvider,
  useNotifications,
} from '@/context/NotificationsContext';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { configureNotificationHandler } from '@/services/push.service';
import { queryCacheStorage } from '@/services/storage.service';

// -----------------------------------------------------------------------------
// Splash & notifications
// -----------------------------------------------------------------------------

void SplashScreen.preventAutoHideAsync();

configureNotificationHandler();

// -----------------------------------------------------------------------------
// React Query — instance + persistance
// -----------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Les données sont "stale" après 5 minutes.
      // → au boot online, refetch silencieux en arrière-plan.
      // → au boot offline, le cache est servi immédiatement.
      staleTime: 1000 * 60 * 5,

      // On garde le cache en mémoire 7 jours (aligné avec le persister).
      gcTime: 1000 * 60 * 60 * 24 * 7,

      // 1 retry pour ne pas spammer en cas de coupure réseau.
      retry: 1,

      // Refetch au retour de focus / reconnexion.
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      // ⚠️ offlineFirst : React Query sert le cache sans tenter un fetch
      //    si on est offline. Dès qu'on repasse online, il refetch.
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Persister : sauvegarde automatiquement le cache React Query
 * dans AsyncStorage.
 */
const persister = createAsyncStoragePersister({
  storage: queryCacheStorage,
  key: '@ssi:queryCache',
  // Écrit sur disque au maximum 1 fois par seconde.
  // Évite les écritures trop fréquentes en cas de refetch massif.
  throttleTime: 1000,
});

/** Durée de vie du cache sur disque (7 jours). */
const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

/**
 * Version du cache. À incrémenter si la STRUCTURE des données change
 * (ex: refacto d'un type), pour forcer un rechargement complet
 * et éviter de restaurer un cache incompatible.
 */
const PERSIST_BUSTER = 'v1';

// -----------------------------------------------------------------------------
// Deep links / notifications
// -----------------------------------------------------------------------------

function resolveRoute(linkTo: string | null | undefined): string | null {
  if (!linkTo) return null;

  const segment = linkTo.split('/').filter(Boolean)[0];

  switch (segment) {
    case 'programmes':
      return '/(tabs)/programmes';
    case 'evenements':
      return '/(tabs)/evenements';
    case 'infos':
      return '/(tabs)/infos';
    case 'prieres':
      return '/(tabs)/prieres';
    case 'rappels':
      return '/(tabs)/rappels';
    default:
      return null;
  }
}

// -----------------------------------------------------------------------------
// Root navigator
// -----------------------------------------------------------------------------

function RootNavigator() {
  const { colors, loading: themeLoading } = useTheme();
  const { welcomeSeen } = useOnboarding();
  const { user, loading: authLoading } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const queryClientInstance = useQueryClient();

  /**
   * Mémorise la dernière redirection demandée pour éviter
   * d'appeler `router.replace` plusieurs fois pendant une transition.
   */
  const lastRedirectRef = useRef<string | null>(null);

  const navigationReady = Boolean(navigationState?.key);

  const appReady =
    !themeLoading &&
    !authLoading &&
    welcomeSeen !== null &&
    navigationReady;

  type TargetRoute = 'welcome' | 'login' | '(tabs)';

  const targetRoute: TargetRoute | null = !appReady
    ? null
    : !welcomeSeen
      ? 'welcome'
      : !user
        ? 'login'
        : '(tabs)';

  // ---------------------------------------------------------------------------
  // Notifications reçues (app au premier plan)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      refreshNotifications();
      queryClientInstance.invalidateQueries();
    });

    return () => {
      subscription.remove();
    };
  }, [refreshNotifications, queryClientInstance]);

  // ---------------------------------------------------------------------------
  // Tap sur une notification → deep link
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          linkTo?: string;
        };

        const route = resolveRoute(data?.linkTo);

        if (route) {
          router.push(route as never);
        }
      });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // ---------------------------------------------------------------------------
  // App revient au premier plan → refetch tout + refresh notifications
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        queryClientInstance.invalidateQueries();
        refreshNotifications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [queryClientInstance, refreshNotifications]);

  // ---------------------------------------------------------------------------
  // Vérifie si la route actuelle correspond à la cible
  // ---------------------------------------------------------------------------

  const isCurrentRouteCorrect = (): boolean => {
    const currentSegment = segments[0];

    if (targetRoute === 'welcome') return currentSegment === 'welcome';
    if (targetRoute === 'login') return currentSegment === 'login';
    if (targetRoute === '(tabs)') return currentSegment === '(tabs)';

    return false;
  };

  // ---------------------------------------------------------------------------
  // Redirection contrôlée
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!appReady || !targetRoute) {
      return;
    }

    const routeIsCorrect = isCurrentRouteCorrect();

    if (routeIsCorrect) {
      // La bonne route est affichée → on peut masquer le splash.
      lastRedirectRef.current = null;
      void SplashScreen.hideAsync();
      return;
    }

    const targetPath =
      targetRoute === '(tabs)' ? '/(tabs)' : `/${targetRoute}`;

    // Évite de rediriger plusieurs fois vers la même cible.
    if (lastRedirectRef.current === targetPath) {
      return;
    }

    lastRedirectRef.current = targetPath;

    router.replace(targetPath as never);
  }, [appReady, targetRoute, segments, router]);

  // ---------------------------------------------------------------------------
  // Tant qu'on n'est pas prêt, on affiche un écran vide
  // (le splash screen est encore par-dessus).
  // ---------------------------------------------------------------------------

  if (!appReady || !targetRoute) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Stack principal
  // ---------------------------------------------------------------------------

  return (
    <Stack
      key={targetRoute}
      initialRouteName={targetRoute}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}

// -----------------------------------------------------------------------------
// Layout racine
// -----------------------------------------------------------------------------

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister,
              maxAge: PERSIST_MAX_AGE,
              buster: PERSIST_BUSTER,
              /**
               * On ne persiste QUE les queries réussies.
               * Les queries en erreur ou en cours ne sont pas sauvées
               * (inutile de restaurer un état transitoire).
               */
              dehydrateOptions: {
                shouldDehydrateQuery: (query) =>
                  query.state.status === 'success',
              },
            }}
          >
            <OnboardingProvider>
              <AuthProvider>
                <NotificationsProvider>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NotificationsProvider>
              </AuthProvider>
            </OnboardingProvider>
          </PersistQueryClientProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}