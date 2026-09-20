// src/hooks/useProgrammes.ts
/**
 * Hooks React Query pour les programmes.
 */

import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/api/queryKeys';
import {
  programmesService,
  type ListProgrammesParams,
} from '@/services/programmes.service';

/**
 * Liste des programmes (paginée + filtrée).
 */
export function useProgrammes(params: ListProgrammesParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.programmes.list(params),
    queryFn: () => programmesService.list(params),
  });
}

/**
 * Détail d'un programme.
 */
export function useProgramme(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.programmes.detail(id ?? ''),
    queryFn: () => programmesService.detail(id as string),
    enabled: !!id,
  });
}