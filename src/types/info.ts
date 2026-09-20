// src/types/info.ts
/**
 * Types du module INFO — alignés sur le DTO de l'API NestJS.
 *
 * Une info = titre + summary + detail (+ priority).
 * Pas de catégorie, pas de type métier.
 */

export type InfoPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Info {
  id: string;
  title: string;
  summary: string;
  detail: string | null;
  priority: InfoPriority;
  createdAt: string;
  updatedAt: string;
}