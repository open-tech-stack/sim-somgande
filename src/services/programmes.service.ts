// src/services/programmes.service.ts
/**
 * Service Programmes — appels API liés aux programmes.
 */

import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResponse } from '@/types/pagination.types';
import { Programme } from '@/types/programme.types';

// ------------------------------------------------------------------
// Query params acceptés par GET /programmes
// ------------------------------------------------------------------
export interface ListProgrammesParams {
  kind?: 'CULTE_DIMANCHE' | 'PRIERE_VENDREDI';
  status?: 'A_VENIR' | 'EN_COURS' | 'TERMINE' | 'ANNULE' | 'EXPIRE';
  q?: string;
  period?: 'upcoming' | 'past' | 'all';
  page?: number;
  pageSize?: number;
}

export const programmesService = {
  /**
   * Liste paginée des programmes.
   */
  async list(
    params: ListProgrammesParams = {},
  ): Promise<PaginatedResponse<Programme>> {
    const { data } = await apiClient.get<PaginatedResponse<Programme>>(
      ENDPOINTS.programmes.list,
      { params },
    );
    return data;
  },

  /**
   * Détail d'un programme.
   */
  async detail(id: string): Promise<Programme> {
    const { data } = await apiClient.get<Programme>(
      ENDPOINTS.programmes.detail(id),
    );
    return data;
  },
};