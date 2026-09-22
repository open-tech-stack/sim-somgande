// src/api/client.ts
/**
 * Client HTTP Axios — MOBILE
 *
 * - Ajoute l'access token (Bearer) dans chaque requête.
 * - Ajoute le header `X-Client: mobile` pour que le backend sache qu'il
 *   doit renvoyer les tokens dans le body (et non pas poser des cookies).
 * - Intercepte les 401 pour tenter un refresh automatique.
 * - Si le refresh échoue → on vide la session et on notifie le contexte.
 *
 * Un système de "queue" empêche plusieurs refresh simultanés.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import { ENDPOINTS } from './endpoints';
import { ENV } from '@/config/env';
import {
  accessTokenStorage,
  authSession,
  refreshTokenStorage,
} from '@/services/storage.service';

// ------------------------------------------------------------------
// Instance principale
// ------------------------------------------------------------------
export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ------------------------------------------------------------------
// Interceptor requête : Bearer + X-Client: mobile
// ------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. Bearer token
    const token = await accessTokenStorage.get();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // 2. X-Client: mobile
    //    → le backend renvoie les tokens dans le body (pas de cookie)
    config.headers.set('X-Client', 'mobile');

    return config;
  },
  (error) => Promise.reject(error),
);

// ------------------------------------------------------------------
// Callback global : appelé quand la session est invalide
// ------------------------------------------------------------------
type SessionExpiredCallback = () => void;
let onSessionExpired: SessionExpiredCallback | null = null;
export function setSessionExpiredCallback(cb: SessionExpiredCallback) {
  onSessionExpired = cb;
}

// ------------------------------------------------------------------
// Interceptor réponse : gère le 401 → refresh → retry
// ------------------------------------------------------------------
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  pendingRequests.push(cb);
}

function onRefreshed(token: string | null) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

const AUTH_ENDPOINTS_TO_SKIP = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.refresh,
];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) return Promise.reject(error);

    const url = originalRequest.url ?? '';
    const isAuthRoute = AUTH_ENDPOINTS_TO_SKIP.some((p) => url.includes(p));

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) return reject(error);
            if (originalRequest.headers) {
              (
                originalRequest.headers as Record<string, string>
              )['Authorization'] = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await refreshTokenStorage.get();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // ⚠️ Le refresh MOBILE envoie le token dans le body.
        //    Le backend détecte X-Client ≠ 'web' → renvoie les tokens
        //    dans le body (pas de cookies).
        const { data } = await axios.post(
          `${ENV.API_URL}${ENDPOINTS.auth.refresh}`,
          { refreshToken },
          {
            timeout: 20000,
            headers: { 'X-Client': 'mobile' },
          },
        );

        const newAccessToken: string = data.accessToken;
        const newRefreshToken: string = data.refreshToken;

        await accessTokenStorage.set(newAccessToken);
        await refreshTokenStorage.set(newRefreshToken);

        isRefreshing = false;
        onRefreshed(newAccessToken);

        if (originalRequest.headers) {
          (
            originalRequest.headers as Record<string, string>
          )['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshed(null);
        await authSession.clearAll();
        onSessionExpired?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);