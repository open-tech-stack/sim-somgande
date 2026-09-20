// src/services/push.service.ts
/**
 * Service Push — gère l'enregistrement du token Expo et la réception.
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ------------------------------------------------------------------
// Handler global — détermine le comportement en foreground
// ------------------------------------------------------------------
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,      // 🔊 son
      shouldSetBadge: true,       // 🔴 badge
    }),
  });
}

// ------------------------------------------------------------------
// Android : crée le canal par défaut avec vibration
// ------------------------------------------------------------------
export async function configureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications SSI',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],   // 📳 vibration
      lightColor: '#2563EB',
    });
  }
}

// ------------------------------------------------------------------
// Récupère le token Expo
// ------------------------------------------------------------------
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push : nécessite un appareil physique.');
    return null;
  }

  // 1) Permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push : permission refusée.');
    return null;
  }

  // 2) Canal Android (obligatoire avant le token)
  await configureAndroidChannel();

  // 3) Token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('Push : projectId manquant (lance `npx eas init`).');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}