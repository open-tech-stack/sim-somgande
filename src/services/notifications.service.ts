// src/services/notifications.service.ts
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Notification, ListNotificationsParams } from '@/types/notification.types';
import type { PaginatedResponse } from '@/types/pagination.types';

export const notificationsService = {
  async list(params: ListNotificationsParams = {}): Promise<PaginatedResponse<Notification>> {
    const { data } = await apiClient.get<PaginatedResponse<Notification>>(
      ENDPOINTS.notifications.list,
      { params },
    );
    return data;
  },

  async unreadCount(): Promise<{ count: number }> {
    const { data } = await apiClient.get<{ count: number }>(
      ENDPOINTS.notifications.unreadCount,
    );
    return data;
  },

  async markRead(id: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.patch<{ success: boolean }>(
      ENDPOINTS.notifications.markRead(id),
    );
    return data;
  },

  async markAllRead(): Promise<{ success: boolean; count: number }> {
    const { data } = await apiClient.patch<{ success: boolean; count: number }>(
      ENDPOINTS.notifications.markAllRead,
    );
    return data;
  },
};