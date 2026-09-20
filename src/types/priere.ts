// src/types/priere.ts
/**
 * Types du module PRIÈRE — alignés sur le DTO de l'API NestJS.
 * Tous les champs sont optionnels sauf `title`.
 */

export type PrierePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Priere {
  id: string;
  title: string;
  /** Date de la prière (ISO) — optionnel */
  date: string | null;
  /** Lieu — optionnel */
  location: string | null;
  /** Détail long — optionnel */
  detail: string | null;
  priority: PrierePriority;
  createdAt: string;
  updatedAt: string;
}