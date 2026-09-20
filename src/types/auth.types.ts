// src/types/auth.types.ts
export type UserRole = 'ADMIN' | 'MEMBRE';

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  code: string;
  role: UserRole;
  personId: string | null;
  fullName: string | null;
}

export interface MeResponse {
  id: string;
  code: string;
  role: UserRole;
  personId: string | null;
  fullName: string | null;
}

export interface LoginRequest {
  code: string;
}

export interface RefreshRequest {
  refreshToken: string;
}