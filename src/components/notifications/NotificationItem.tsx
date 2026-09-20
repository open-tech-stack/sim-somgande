// src/components/notifications/NotificationItem.tsx
import {
  Bell, CalendarDays, Heart, Info as InfoIcon, Megaphone, PartyPopper,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Notification, NotificationType } from '@/types/notification.types';

function iconOf(type: NotificationType) {
  switch (type) {
    case 'PROGRAMME':  return CalendarDays;
    case 'EVENEMENT':  return PartyPopper;
    case 'INFO':       return Megaphone;
    case 'PRIERE':     return Heart;
    case 'RAPPEL':     return Bell;
    default:           return InfoIcon;
  }
}

function toneOf(type: NotificationType, colors: any): string {
  switch (type) {
    case 'PROGRAMME': return colors.primary;
    case 'EVENEMENT': return colors.info;
    case 'INFO':      return colors.primary;
    case 'PRIERE':    return '#A855F7';
    case 'RAPPEL':    return colors.warning;
    default:          return colors.textSecondary;
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const M = 60_000, H = 60 * M, D = 24 * H;
  if (diff < M) return "à l'instant";
  if (diff < H) return `il y a ${Math.floor(diff / M)} min`;
  if (diff < D) return `il y a ${Math.floor(diff / H)} h`;
  if (diff < 2 * D) return 'hier';
  if (diff < 7 * D) return `il y a ${Math.floor(diff / D)} j`;
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

interface Props {
  notification: Notification;
  onPress: (n: Notification) => void;
}

export default function NotificationItem({ notification, onPress }: Props) {
  const { colors } = useTheme();
  const Icon = iconOf(notification.type);
  const tone = toneOf(notification.type, colors);

  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: notification.read ? colors.surface : colors.primary + '08',
          borderColor: notification.read ? colors.border : colors.primary + '44',
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tone + '22' }]}>
        <Icon size={18} color={tone} strokeWidth={2.4} />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          <View style={styles.rightGroup}>
            {!notification.read && (
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            )}
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {relativeDate(notification.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 8,
  },
  title: { flex: 1, fontSize: FontSize.sm, fontWeight: '800' },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  date: { fontSize: 10, fontWeight: '700' },
  message: { fontSize: FontSize.sm, lineHeight: 18 },
});