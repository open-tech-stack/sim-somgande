// src/types/pagination.types.ts
/**
 * Types des réponses paginées renvoyées par l'API.
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}