// src/data/index.ts
/**
 * Ne restent ici que les données de BASE (people, groups) qui ne sont
 * pas encore migrées.
 */

// Base
export {
  getAllPeople,
  getPersonById,
  resolvePeople,
  getAllGroups,
  getGroupById,
} from './base';