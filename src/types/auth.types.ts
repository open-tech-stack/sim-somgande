// src/types/auth.types.ts

/**
 * Rôles possibles.
 */
export type UserRole = 'ADMIN' | 'MEMBRE';

/**
 * Utilisateur tel que renvoyé par l'API.
 *
 *    Il n'apparaît que dans les endpoints admin /users/* (web seulement).
 */
export interface AuthUser {
  id: string;
  role: UserRole;
  personId: string | null;
  fullName: string | null;
}

/**
 * Réponse du login mobile : tokens + user.
 *
 * ⚠️ Le mobile reçoit les tokens dans le body (pas de cookies).
 *    C'est le comportement du backend quand X-Client ≠ 'web'.
 */
export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * Payload envoyé pour le login.
 */
export interface LoginRequest {
  code: string;
}

/**
 * Payload envoyé pour le refresh (mobile uniquement).
 * Le web utilise un cookie httpOnly.
 */
export interface RefreshRequest {
  refreshToken: string;
}

/**
 * Réponse de /auth/me.
 * Identique à AuthUser (même forme).
 */
export type MeResponse = AuthUser;