// src/config/env.ts
/**
 * Configuration d'environnement du mobile.
 * Toutes les variables EXPO_PUBLIC_* sont exposées par Expo.
 */

export const ENV = {
    API_URL:
        process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
} as const;