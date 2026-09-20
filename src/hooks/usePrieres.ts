// src/hooks/usePrieres.ts
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/queryKeys';
import {
  prieresService,
  type ListPrieresParams,
} from '@/services/prieres.service';

export function usePrieres(params: ListPrieresParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.prieres.list(params),
    queryFn: () => prieresService.list(params),
  });
}

export function usePriere(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.prieres.detail(id ?? ''),
    queryFn: () => prieresService.detail(id as string),
    enabled: !!id,
  });
}