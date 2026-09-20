// src/hooks/useRappels.ts
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/queryKeys';
import {
  rappelsService,
  type ListRappelsParams,
} from '@/services/rappels.service';

export function useRappels(params: ListRappelsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.rappels.list(params),
    queryFn: () => rappelsService.list(params),
  });
}

export function useRappel(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.rappels.detail(id ?? ''),
    queryFn: () => rappelsService.detail(id as string),
    enabled: !!id,
  });
}