// src/components/home/RecentInfosList.tsx
/**
 * Liste compacte des dernières infos sur l'accueil.
 * Chaque ligne a un trait coloré à GAUCHE et à DROITE.
 */

import { ChevronRight, Info as InfoIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Info } from '@/types/info';

const MONTHS_SHORT = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];

function relativeDate(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - Date.parse(iso);
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  if (diff < MIN) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return 'hier';
  if (diff < 7 * DAY) return `il y a ${Math.floor(diff / DAY)} j`;
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

interface Props {
  infos: Info[];
  onPress: (info: Info) => void;
}

export default function RecentInfosList({ infos, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.list}>
      {infos.map((info) => {
        const tone =
          info.priority === 'URGENT'
            ? colors.danger
            : info.priority === 'IMPORTANT'
            ? colors.warning
            : colors.primary;

        return (
          <Pressable
            key={info.id}
            onPress={() => onPress(info)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            {/* Trait gauche */}
            <View style={[styles.sidebar, { backgroundColor: tone }]} />

            <View style={styles.body}>
              <View style={styles.top}>
                <InfoIcon size={12} color={colors.primary} strokeWidth={2.4} />
                <Text style={[styles.date, { color: colors.textMuted }]}>
                  {relativeDate(info.updatedAt ?? info.createdAt)}
                </Text>
              </View>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={1}
              >
                {info.title}
              </Text>
              <Text
                style={[styles.summary, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {info.summary}
              </Text>
            </View>

            <ChevronRight
              size={16}
              color={colors.textMuted}
              strokeWidth={2.4}
            />

            {/* Trait droit */}
            <View style={[styles.sidebar, { backgroundColor: tone }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sidebar: { width: 3, alignSelf: 'stretch' },
  body: { flex: 1, padding: Spacing.md, gap: 2, paddingRight: Spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  title: { fontSize: FontSize.sm, fontWeight: '800', marginTop: 2 },
  summary: { fontSize: FontSize.xs, marginTop: 1 },
});