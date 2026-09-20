// src/data/base/index.ts
/**
 * Données de BASE, partagées par tous les modules.
 * Ne dépend d'aucun module spécifique (programme, événement…).
 */

import groupsRaw from './groups.json';
import peopleRaw from './people.json';

import type { Group, Person } from '@/types/base';

const people = peopleRaw as unknown as Person[];
const groups = groupsRaw as unknown as Group[];

// ------------------------------------------------------------------
// Personnes
// ------------------------------------------------------------------
export function getAllPeople(): Person[] {
  return people;
}

export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function resolvePeople(ids: string[]): Person[] {
  return ids
    .map((id) => getPersonById(id))
    .filter((p): p is Person => Boolean(p));
}

// ------------------------------------------------------------------
// Groupes
// ------------------------------------------------------------------
export function getAllGroups(): Group[] {
  return groups;
}

export function getGroupById(id: string): Group | undefined {
  return groups.find((g) => g.id === id);
}