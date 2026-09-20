// src/components/home/NextEvenementCard.tsx
import { Calendar, ChevronRight, MapPin } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Evenement } from '@/types/evenement';
import { EVENEMENT_TYPE_LABEL } from '@/types/evenement';

const MONTHS_SHORT = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];
const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function dayLabel(iso?: string | null): string {
  if (!iso) return 'Date à préciser';
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

interface Props {
  evenement: Evenement;
  onPress: () => void;
}

export default function NextEvenementCard({ evenement, onPress }: Props) {
  const { colors } = useTheme();
  const accent = colors.info;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={[styles.sidebar, { backgroundColor: accent }]} />

      <View style={styles.body}>
        <Text style={[styles.tag, { color: accent }]}>
          {EVENEMENT_TYPE_LABEL[evenement.kind].toUpperCase()}
        </Text>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {evenement.title}
        </Text>

        <View style={styles.metaRow}>
          <Calendar size={13} color={colors.textSecondary} strokeWidth={2.2} />
          <Text
            style={[styles.metaText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {dayLabel(evenement.startsAt)}
          </Text>
        </View>

        {evenement.location && (
          <View style={styles.metaRow}>
            <MapPin size={13} color={colors.textSecondary} strokeWidth={2.2} />
            <Text
              style={[styles.metaText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {evenement.location}
            </Text>
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: accent }]}>
            Voir le détail
          </Text>
          <ChevronRight size={14} color={accent} strokeWidth={2.6} />
        </View>
      </View>

      <View style={[styles.sidebar, { backgroundColor: accent }]} />
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  sidebar: { width: 4 },
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  tag: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: FontSize.lg, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: FontSize.sm, flexShrink: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { fontSize: FontSize.sm, fontWeight: '800' },
});