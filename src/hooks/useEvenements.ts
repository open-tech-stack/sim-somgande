// src/hooks/useEvenements.ts
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/queryKeys';
import {
  evenementsService,
  type ListEvenementsParams,
} from '@/services/evenements.service';

export function useEvenements(params: ListEvenementsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.evenements.list(params),
    queryFn: () => evenementsService.list(params),
  });
}

export function useEvenement(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.evenements.detail(id ?? ''),
    queryFn: () => evenementsService.detail(id as string),
    enabled: !!id,
  });
}