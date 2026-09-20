// src/types/programme.ts
/**
 * Types du module PROGRAMME — alignés sur le DTO renvoyé par l'API NestJS.
 *
 * ⚠️ Le statut (`status`) est CALCULÉ côté serveur et renvoyé dans la réponse.
 * Le mobile ne recalcule RIEN.
 */

// ------------------------------------------------------------------
// Enums (miroir de ce que renvoie l'API)
// ------------------------------------------------------------------

export type ProgrammeKind = 'CULTE_DIMANCHE' | 'PRIERE_VENDREDI';

export type ProgrammeStatus =
  | 'A_VENIR'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ANNULE'
  | 'EXPIRE';

export type Priority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type ProgrammeSectionKey =
  | 'ACCUEIL'
  | 'ANIMATION'
  | 'LOUANGE_ADORATION'
  | 'PREDICATION'
  | 'INTERPRETATION'
  | 'PARKING'
  | 'LIBRE';

// ------------------------------------------------------------------
// Section (telle que renvoyée par l'API)
// ------------------------------------------------------------------

export interface ProgrammePersonRef {
  id: string;
  fullName: string;
}

export interface ProgrammeGroupRef {
  id: string;
  name: string;
}

export interface ProgrammeSection {
  id: string;
  key: ProgrammeSectionKey | string;
  label: string;
  order: number;
  value: string | null;
  persons: ProgrammePersonRef[];
  group: ProgrammeGroupRef | null;
}

// ------------------------------------------------------------------
// Programme (réponse API)
// ------------------------------------------------------------------

export interface Programme {
  id: string;
  kind: ProgrammeKind;
  title: string;
  summary: string;
  content: string | null;
  priority: Priority;

  /** Statut CALCULÉ côté serveur — à afficher tel quel */
  status: ProgrammeStatus;
  /** Statut brut en base (rarement utile) */
  rawStatus: string;

  location: string | null;

  hasHolyCommunion: boolean | null;
  holyCommunionMessage: string | null;
  notes: string | null;

  startsAt: string | null;
  endsAt: string | null;
  expiresAt: string | null;
  publishedAt: string | null;

  notification: boolean;

  sections: ProgrammeSection[];

  createdAt: string;
  updatedAt: string;
}