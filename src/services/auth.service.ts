// src/services/auth.service.ts
/**
 * Service Auth — appels API liés à l'authentification.
 * Ne gère PAS la persistance (c'est le rôle du AuthContext).
 */

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { AuthTokensResponse, LoginRequest, RefreshRequest, MeResponse } from "@/types/auth.types";


export const authService = {
  /**
   * Login avec un code à 10 caractères.
   * Renvoie access + refresh + user.
   */
  async login(code: string): Promise<AuthTokensResponse> {
    const { data } = await apiClient.post<AuthTokensResponse>(
      ENDPOINTS.auth.login,
      { code } satisfies LoginRequest,
    );
    return data;
  },

  /**
   * Rafraîchit les tokens à partir du refresh token.
   */
  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const { data } = await apiClient.post<AuthTokensResponse>(
      ENDPOINTS.auth.refresh,
      { refreshToken } satisfies RefreshRequest,
    );
    return data;
  },

  async registerPushToken(expoPushToken: string): Promise<void> {
    await apiClient.post(ENDPOINTS.pushTokens.register, { expoPushToken });
  },

  async unregisterPushToken(): Promise<void> {
    try {
      await apiClient.delete(ENDPOINTS.pushTokens.unregister);
    } catch {
      // silencieux
    }
  },

  /**
   * Récupère le profil de l'utilisateur connecté.
   */
  async me(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>(ENDPOINTS.auth.me);
    return data;
  },

  /**
   * Déconnecte côté serveur (révoque le refresh en base).
   * Peut échouer silencieusement (on nettoie le storage quand même).
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.auth.logout);
    } catch {
      // silencieux : l'important c'est de nettoyer côté mobile
    }
  },
};