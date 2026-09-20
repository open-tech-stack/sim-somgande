// src/hooks/useInfos.ts
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/queryKeys';
import { infosService, type ListInfosParams } from '@/services/infos.service';

export function useInfos(params: ListInfosParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.infos.list(params),
    queryFn: () => infosService.list(params),
  });
}

export function useInfo(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.infos.detail(id ?? ''),
    queryFn: () => infosService.detail(id as string),
    enabled: !!id,
  });
}