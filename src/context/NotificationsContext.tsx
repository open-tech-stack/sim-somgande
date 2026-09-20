// src/context/NotificationsContext.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { notificationsService } from '@/services/notifications.service';

interface NotificationsContextValue {
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  setUnreadCount: (n: number) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationsService.unreadCount();
      setUnreadCount(res.count);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo(
    () => ({ unreadCount, loading, refresh, setUnreadCount }),
    [unreadCount, loading, refresh],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications doit être dans <NotificationsProvider>');
  return ctx;
}