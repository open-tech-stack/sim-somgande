// src/config/env.ts
/**
 * Configuration d'environnement du mobile.
 *
 * ⚠️ Toutes les variables EXPO_PUBLIC_* sont exposées dans le bundle.
 *    Ne JAMAIS y mettre de secrets.
 *
 * Variables attendues dans le .env :
 *   EXPO_PUBLIC_API_URL=https://ssi-backend-two.vercel.app/api
 *   EXPO_PUBLIC_APP_ENV=production
 */

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

if (!apiUrl) {
  throw new Error(
    '[config/env] EXPO_PUBLIC_API_URL est manquante. ' +
      'Vérifie ton .env à la racine du projet mobile.',
  );
}

export const ENV = {
  API_URL: apiUrl,
  APP_ENV: appEnv as 'development' | 'production',
  IS_PROD: appEnv === 'production',
} as const;