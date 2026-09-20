// src/services/infos.service.ts
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Info, InfoPriority } from '@/types/info';
import type { PaginatedResponse } from '@/types/pagination.types';

export interface ListInfosParams {
  q?: string;
  priority?: InfoPriority;
  page?: number;
  pageSize?: number;
}

export const infosService = {
  async list(params: ListInfosParams = {}): Promise<PaginatedResponse<Info>> {
    const { data } = await apiClient.get<PaginatedResponse<Info>>(
      ENDPOINTS.infos.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Info> {
    const { data } = await apiClient.get<Info>(ENDPOINTS.infos.detail(id));
    return data;
  },
};