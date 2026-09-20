// src/services/prieres.service.ts
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Priere, PrierePriority } from '@/types/priere';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface ListPrieresParams {
  q?: string;
  priority?: PrierePriority;
  page?: number;
  pageSize?: number;
}

export const prieresService = {
  async list(params: ListPrieresParams = {}): Promise<PaginatedResponse<Priere>> {
    const { data } = await apiClient.get<PaginatedResponse<Priere>>(
      ENDPOINTS.prieres.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Priere> {
    const { data } = await apiClient.get<Priere>(ENDPOINTS.prieres.detail(id));
    return data;
  },
};