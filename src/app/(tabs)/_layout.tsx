// src/app/(tabs)/_layout.tsx
import { Tabs, useRouter } from 'expo-router';
import { CalendarDays, Home, Megaphone, PartyPopper } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import AppHeader from '@/components/AppHeader';
import TabBar from '@/components/TabBar';
import ThemePickerModal from '@/components/ThemePickerModal';
import { BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        onThemePress={() => setThemeOpen(true)}
        onNotificationsPress={() => router.push('/notifications')}
      />

      <Tabs
        tabBar={(props: any) => <TabBar {...(props as any)} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: colors.background,
            paddingBottom: BottomTabInset,
          },
        }}
      >
        <Tabs.Screen
          name="programmes"
          options={{
            title: 'Programmes',
            tabBarIcon: ({ color, size }) => (
              <CalendarDays size={size} color={color} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="evenements"
          options={{
            title: 'Événements',
            tabBarIcon: ({ color, size }) => (
              <PartyPopper size={size} color={color} strokeWidth={2.2} />
            ),
          }}
        />
        <Tabs.Screen
          name="infos"
          options={{
            title: 'Infos',
            tabBarIcon: ({ color, size }) => (
              <Megaphone size={size} color={color} strokeWidth={2.2} />
            ),
          }}
        />

        {/* Routes cachées (accessibles via le "+") */}
        <Tabs.Screen name="prieres" options={{ href: null }} />
        <Tabs.Screen name="rappels" options={{ href: null }} />
      </Tabs>

      <ThemePickerModal
        visible={themeOpen}
        onClose={() => setThemeOpen(false)}
      />
    </View>
  );
}