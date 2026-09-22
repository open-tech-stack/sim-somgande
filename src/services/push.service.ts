// src/services/push.service.ts
/**
 * Service Push — gère l'enregistrement du token Expo et la réception.
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ------------------------------------------------------------------
// 🆔 ID du canal Android
//
// ⚠️ Cet ID DOIT être identique à celui utilisé côté backend
//    dans `notifications.helper.ts` (ANDROID_CHANNEL_ID).
// ------------------------------------------------------------------
export const ANDROID_CHANNEL_ID = 'ssi-default-v2';

// ------------------------------------------------------------------
// Handler global — comportement en foreground
// ------------------------------------------------------------------
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// ------------------------------------------------------------------
// Android : crée le canal par défaut avec son + vibration
//
// ⚠️ SUR ANDROID : `sound: 'default'` N'EST PAS le son système.
//    Android attend soit `null` (son par défaut du système),
//    soit le nom d'un fichier audio bundlé (ex: 'notification.wav').
//
//    Pour utiliser le son système Android → `sound: null`.
// ------------------------------------------------------------------
export async function configureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Notifications SSI',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563EB',
    sound: null,           // 🔊 Son système Android
    enableVibrate: true,   // 📳 Vibration
    lockscreenVisibility:
      Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
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

  // 2) Canal Android (obligatoire AVANT le token)
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

  console.log('✅ Expo Push Token:', token);

  // 🔍 Debug : liste les canaux Android actifs
  if (Platform.OS === 'android') {
    const channels = await Notifications.getNotificationChannelsAsync();
    console.log('✅ Canaux Android actifs:', channels);
  }

  return token;
}