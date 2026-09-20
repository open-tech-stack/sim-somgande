// src/components/infos/InfoCard.tsx
import { ChevronRight, Info as InfoIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Info } from '@/types/info';

import InfoPriorityDot from './InfoPriorityDot';

// ------------------------------------------------------------------
// Helper : date relative
// ------------------------------------------------------------------
function relativeDate(iso?: string): string {
  if (!iso) return '';
  const now = Date.now();
  const t = Date.parse(iso);
  const diff = now - t;

  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  if (diff < MIN) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return 'hier';
  if (diff < 7 * DAY) return `il y a ${Math.floor(diff / DAY)} jours`;

  const d = new Date(t);
  const MONTHS = [
    'janv.','févr.','mars','avr.','mai','juin',
    'juil.','août','sept.','oct.','nov.','déc.',
  ];
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

interface Props {
  info: Info;
  onPress: (info: Info) => void;
}

export default function InfoCard({ info, onPress }: Props) {
  const { colors } = useTheme();
  const ref = info.updatedAt ?? info.createdAt;

  return (
    <Pressable
      onPress={() => onPress(info)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={[styles.sidebar, { backgroundColor: colors.primary }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.leftGroup}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '44',
                },
              ]}
            >
              <InfoIcon size={13} color={colors.primary} strokeWidth={2.4} />
            </View>
            <InfoPriorityDot priority={info.priority} />
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {relativeDate(ref)}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {info.title}
        </Text>

        <Text
          style={[styles.summary, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {info.summary}
        </Text>

        {info.detail && (
          <View style={styles.footerRow}>
            <Text style={[styles.more, { color: colors.primary }]}>
              Lire la suite
            </Text>
            <ChevronRight size={14} color={colors.primary} strokeWidth={2.6} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  sidebar: { width: 4 },
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  iconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: { fontSize: FontSize.xs, fontWeight: '600' },
  title: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 0.2 },
  summary: { fontSize: FontSize.sm, lineHeight: 19 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  more: { fontSize: FontSize.sm, fontWeight: '800' },
});