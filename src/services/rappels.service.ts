// src/services/rappels.service.ts
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Rappel, RappelPriority } from '@/types/rappel';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface ListRappelsParams {
  q?: string;
  priority?: RappelPriority;
  page?: number;
  pageSize?: number;
}

export const rappelsService = {
  async list(params: ListRappelsParams = {}): Promise<PaginatedResponse<Rappel>> {
    const { data } = await apiClient.get<PaginatedResponse<Rappel>>(
      ENDPOINTS.rappels.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Rappel> {
    const { data } = await apiClient.get<Rappel>(ENDPOINTS.rappels.detail(id));
    return data;
  },
};