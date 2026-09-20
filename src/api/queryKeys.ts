// src/api/queryKeys.ts
/**
 * Clés React Query — centralisées pour éviter les fautes de frappe.
 */

export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  programmes: {
    all: ['programmes'] as const,
    list: (params?: unknown) => ['programmes', 'list', params] as const,
    detail: (id: string) => ['programmes', 'detail', id] as const,
  },
  evenements: {
    all: ['evenements'] as const,
    list: (params?: unknown) => ['evenements', 'list', params] as const,
    detail: (id: string) => ['evenements', 'detail', id] as const,
  },
  infos: {
    all: ['infos'] as const,
    list: (params?: unknown) => ['infos', 'list', params] as const,
    detail: (id: string) => ['infos', 'detail', id] as const,
  },
  prieres: {
    all: ['prieres'] as const,
    list: (params?: unknown) => ['prieres', 'list', params] as const,
    detail: (id: string) => ['prieres', 'detail', id] as const,
  },
  rappels: {
    all: ['rappels'] as const,
    list: (params?: unknown) => ['rappels', 'list', params] as const,
    detail: (id: string) => ['rappels', 'detail', id] as const,
  },
} as const;