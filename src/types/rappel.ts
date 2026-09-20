// src/types/rappel.ts
/**
 * Types du module RAPPEL — alignés sur le DTO de l'API NestJS.
 * Tous les champs sont optionnels sauf `title`.
 */

export type RappelPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface RappelElement {
  id: string;
  text: string;
  order: number;
}

export interface Rappel {
  id: string;
  title: string;
  detail: string | null;
  priority: RappelPriority;
  elements: RappelElement[];
  createdAt: string;
  updatedAt: string;
}