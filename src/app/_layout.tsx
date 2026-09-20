// src/app/_layout.tsx
/**
 * Layout racine.
 */

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlertProvider } from '@/context/AlertContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationsProvider, useNotifications } from '@/context/NotificationsContext';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { configureNotificationHandler } from '@/services/push.service';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

// ------------------------------------------------------------------
// Deep link resolver
// ------------------------------------------------------------------
function resolveRoute(linkTo: string | null | undefined): string | null {
  if (!linkTo) return null;
  const segment = linkTo.split('/').filter(Boolean)[0];
  switch (segment) {
    case 'programmes':  return '/(tabs)/programmes';
    case 'evenements':  return '/(tabs)/evenements';
    case 'infos':       return '/(tabs)/infos';
    case 'prieres':     return '/(tabs)/prieres';
    case 'rappels':     return '/(tabs)/rappels';
    default:            return null;
  }
}

// ------------------------------------------------------------------
// React Query
// ------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

// ------------------------------------------------------------------
// RootNavigator
// ------------------------------------------------------------------
function RootNavigator() {
  const { colors, loading: themeLoading } = useTheme();
  const { welcomeSeen } = useOnboarding();
  const { user, loading: authLoading } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();

  const segments = useSegments();
  const router = useRouter();
  const qc = useQueryClient();

  const ready = !themeLoading && !authLoading && welcomeSeen !== null;

  // 🔔 Notification reçue en foreground → refresh compteur + invalide les queries
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      refreshNotifications();
      // Invalide TOUTES les queries → refetch auto de toutes les listes
      qc.invalidateQueries();
    });
    return () => sub.remove();
  }, [refreshNotifications, qc]);

  // 👆 Tap sur notification → deep link
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data as {
          linkTo?: string;
        };
        const route = resolveRoute(data?.linkTo);
        if (route) {
          router.push(route as never);
        }
      },
    );
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    const inWelcome = segments[0] === 'welcome';
    const inLogin = segments[0] === 'login';

    if (!welcomeSeen) {
      if (!inWelcome) router.replace('/welcome');
      return;
    }

    if (!user) {
      if (!inLogin) router.replace('/login');
      return;
    }

    if (inWelcome || inLogin) {
      router.replace('/(tabs)');
    }
  }, [ready, welcomeSeen, user, segments, router]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="notifications"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

// ------------------------------------------------------------------
// RootLayout
// ------------------------------------------------------------------
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <QueryClientProvider client={queryClient}>
            <OnboardingProvider>
              <AuthProvider>
                <NotificationsProvider>
                  <StatusBar style="light" />
                  <RootNavigator />
                </NotificationsProvider>
              </AuthProvider>
            </OnboardingProvider>
          </QueryClientProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}