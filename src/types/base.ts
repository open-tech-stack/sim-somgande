// src/types/base.ts
/**
 * Types de BASE, communs à toutes les informations du projet.
 * ⚠️ Ce fichier ne doit JAMAIS contenir de type spécifique à un module
 * (programme, événement, annonce…). Uniquement le socle commun.
 */

// ------------------------------------------------------------------
// Enums (union types)
// ------------------------------------------------------------------

export type InfoType =
  | 'PROGRAMME'
  | 'EVENEMENT'
  | 'ANNONCE'
  | 'PRIERE'
  | 'BONNE_NOUVELLE'
  | 'TRISTE_NOUVELLE'
  | 'RAPPEL';

export type InfoPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export type InfoStatus =
  | 'A_VENIR'
  | 'EN_COURS'
  | 'TERMINE'
  | 'ANNULE'
  | 'EXPIRE';

// ------------------------------------------------------------------
// Personnes
// ------------------------------------------------------------------

export interface Person {
  /** Identifiant unique stable, ex: "p-ali-diallo" */
  id: string;
  /** Prénom, ex: "Ali" */
  firstName: string;
  /** Nom de famille, ex: "Diallo" (peut être vide) */
  lastName?: string;
  /** Nom affiché complet, ex: "Ali Diallo" */
  fullName: string;
  /**
   * Rôle habituel dans l'église.
   * Exemples : "Pasteur", "Diacre", "Choriste", "Membre", "Ancien"…
   */
  role?: string;
  /** Chemin optionnel vers un avatar */
  avatar?: string;
}

// ------------------------------------------------------------------
// Groupes (musical, protocole, etc.)
// ------------------------------------------------------------------

export interface Group {
  id: string;
  name: string;
  description?: string;
}

// ------------------------------------------------------------------
// Bloc commun à toute information
// ------------------------------------------------------------------

export interface InfoBase {
  id: string;
  type: InfoType;
  title: string;
  summary: string;
  content?: string;
  priority: InfoPriority;
  status: InfoStatus;

  createdAt: string;
  publishedAt?: string;
  startsAt?: string;
  endsAt?: string;
  expiresAt?: string;

  /** Envoyer une notification push ? */
  notification?: boolean;

  /** Lieu principal */
  location?: string;
}