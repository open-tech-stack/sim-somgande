// src/services/evenements.service.ts
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Evenement, EvenementKind, EvenementStatus } from '@/types/evenement';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface ListEvenementsParams {
  kind?: EvenementKind;
  status?: EvenementStatus;
  q?: string;
  period?: 'upcoming' | 'past' | 'all';
  page?: number;
  pageSize?: number;
}

export const evenementsService = {
  async list(
    params: ListEvenementsParams = {},
  ): Promise<PaginatedResponse<Evenement>> {
    const { data } = await apiClient.get<PaginatedResponse<Evenement>>(
      ENDPOINTS.evenements.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Evenement> {
    const { data } = await apiClient.get<Evenement>(
      ENDPOINTS.evenements.detail(id),
    );
    return data;
  },
};