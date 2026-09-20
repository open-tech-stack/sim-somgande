// src/components/notifications/NotificationsList.tsx
/**
 * Écran Notifications — refetch au focus + invalidate sur push.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyState from '@/components/ui/EmptyState';
import { FontSize, Spacing } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationsContext';
import { useTheme } from '@/context/ThemeContext';
import { notificationsService } from '@/services/notifications.service';
import type { Notification } from '@/types/notification.types';

function resolveRoute(linkTo: string | null): string | null {
  if (!linkTo) return null;
  const segment = linkTo.split('/').filter(Boolean)[0];
  switch (segment) {
    case 'programmes':  return '/(tabs)/programmes';
    case 'evenements':  return '/(tabs)/evenements';
    case 'infos':       return '/(tabs)/infos';
    case 'prieres':     return '/(tabs)/prieres';
    case 'rappels':     return '/(tabs)/rappels';
    default:            return null;
  }
}

export default function NotificationsList() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setUnreadCount, refresh: refreshCount } = useNotifications();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await notificationsService.list({ page: 1, pageSize: 200 });
      setItems(res.items);
      setUnreadCount(res.items.filter((n) => !n.read).length);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    load();
  }, [load]);

  // 🔄 Refetch au focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handlePress = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationsService.markRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
        );
        refreshCount();
      } catch {}
    }
    const route = resolveRoute(n.linkTo);
    if (route) router.push(route as any);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const hasUnread = items.some((n) => !n.read);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header avec bouton "tout marquer lu" */}
      {hasUnread && (
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>
            {items.filter((n) => !n.read).length} non lues
          </Text>
          <Pressable
            onPress={handleMarkAllRead}
            hitSlop={10}
            style={({ pressed }) => [
              styles.markAllBtn,
              {
                backgroundColor: pressed
                  ? colors.surfaceAlt
                  : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <CheckCheck size={16} color={colors.primary} strokeWidth={2.4} />
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              Tout marquer lu
            </Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.centeredText, { color: colors.textSecondary }]}>
            Chargement…
          </Text>
        </View>
      ) : error ? (
        <EmptyState
          image={require('@/assets/images/empty-search.png')}
          title="Connexion impossible"
          subtitle={error}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={handlePress} />
          )}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && { flexGrow: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              image={require('@/assets/images/empty-notifications.png')}
              title="Aucune notification"
              subtitle="Les notifications apparaîtront ici."
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  centeredText: { fontSize: FontSize.sm, textAlign: 'center' },
  listContent: { padding: Spacing.lg },
});