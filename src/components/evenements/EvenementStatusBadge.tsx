// src/components/evenements/EvenementStatusBadge.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { EvenementStatus } from '@/types/evenement';

const LABELS: Record<EvenementStatus, string> = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
  EXPIRE: 'Expiré',
};

export default function EvenementStatusBadge({
  status,
}: {
  status: EvenementStatus;
}) {
  const { colors } = useTheme();

  const tone =
    status === 'EN_COURS'
      ? colors.success
      : status === 'A_VENIR'
      ? colors.info
      : status === 'ANNULE'
      ? colors.danger
      : status === 'EXPIRE'
      ? colors.warning
      : colors.textMuted;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: tone + '22', borderColor: tone + '55' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={[styles.text, { color: tone }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.3 },
});