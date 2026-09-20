// src/api/endpoints.ts
/**
 * Constantes des endpoints API.
 * Une seule source de vérité pour toutes les routes.
 */

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  programmes: {
    list: '/programmes',
    detail: (id: string) => `/programmes/${id}`,
  },
  evenements: {
    list: '/evenements',
    detail: (id: string) => `/evenements/${id}`,
  },
  infos: {
    list: '/infos',
    detail: (id: string) => `/infos/${id}`,
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    detail: (id: string) => `/notifications/${id}`,
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  pushTokens: {
    register: '/users/me/push-token',
    unregister: '/users/me/push-token', 
  },
  prieres: {
    list: '/prieres',
    detail: (id: string) => `/prieres/${id}`,
  },
  rappels: {
    list: '/rappels',
    detail: (id: string) => `/rappels/${id}`,
  },
  health: '/health',
} as const;