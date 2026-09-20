// src/types/evenement.ts
/**
 * Types du module ÉVÉNEMENT — alignés sur le DTO renvoyé par l'API NestJS.
 * ⚠️ Le statut (`status`) est CALCULÉ côté serveur et renvoyé dans la réponse.
 */

// ------------------------------------------------------------------
// Enums (miroir exact de l'API)
// ------------------------------------------------------------------

export type EvenementKind =
  | 'MARIAGE'
  | 'CAMP'
  | 'SORTIE'
  | 'CONFERENCE'
  | 'FORMATION'
  | 'ACTION_DE_GRACE'
  | 'JOURNEE'
  | 'AUTRE';

export type PublicCible =
  | 'ENFANTS_ET_ADOS'
  | 'ADOS'
  | 'FEMMES_AFEC'
  | 'JEUNESSE'
  | 'ENFANTS_DE_PASTEURS'
  | 'FEMMES'
  | 'HOMMES_MARIES'
  | 'PERSONNES_AGEES'
  | 'CONSEIL'
  | 'PASTEUR'
  | 'VEUVES_ET_ORPHELINS'
  | 'AUTRE';

export type EvenementStatus =
  | 'A_VENIR'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ANNULE'
  | 'EXPIRE';

export type Priority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

// ------------------------------------------------------------------
// Événement (réponse API)
// ------------------------------------------------------------------

export interface Evenement {
  id: string;
  kind: EvenementKind;
  title: string;
  summary: string;
  detail: string | null;
  priority: Priority;

  /** Statut CALCULÉ côté serveur — à afficher tel quel */
  status: EvenementStatus;
  /** Statut brut en base (rarement utile) */
  rawStatus: string;

  location: string | null;

  startsAt: string | null;
  endsAt: string | null;
  expiresAt: string | null;
  publishedAt: string | null;
  notification: boolean;

  // ---- MARIAGE (null pour les autres types) ----
  brideName: string | null;
  groomName: string | null;
  townHallTime: string | null;
  townHallPlace: string | null;
  ceremonyTime: string | null;
  ceremonyPlace: string | null;
  receptionPlace: string | null;

  // ---- CAMP / SORTIE / JOURNEE ----
  audience: PublicCible | null;
  audienceOther: string | null;
  theme: string | null;

  // ---- CONFERENCE ----
  speaker: string | null;

  // ---- FORMATION ----
  trainer: string | null;

  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------
// Libellés d'affichage
// ------------------------------------------------------------------

export const EVENEMENT_TYPE_LABEL: Record<EvenementKind, string> = {
  MARIAGE: 'Mariage',
  CAMP: 'Camp',
  SORTIE: 'Sortie',
  CONFERENCE: 'Conférence',
  FORMATION: 'Formation',
  ACTION_DE_GRACE: 'Action de grâce',
  JOURNEE: 'Journée',
  AUTRE: 'Autres',
};

export const PUBLIC_CIBLE_LABEL: Record<PublicCible, string> = {
  ENFANTS_ET_ADOS: 'Enfants et ados',
  ADOS: 'Ados',
  FEMMES_AFEC: 'Femmes (AFEC)',
  JEUNESSE: 'Jeunesse',
  ENFANTS_DE_PASTEURS: 'Enfants de pasteurs',
  FEMMES: 'Femmes',
  HOMMES_MARIES: 'Hommes mariés',
  PERSONNES_AGEES: 'Personnes âgées',
  CONSEIL: 'Conseil',
  PASTEUR: 'Pasteur',
  VEUVES_ET_ORPHELINS: 'Veuves et orphelins',
  AUTRE: 'Autres',
};