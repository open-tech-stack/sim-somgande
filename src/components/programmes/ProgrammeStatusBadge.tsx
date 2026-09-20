// src/components/programmes/ProgrammeStatusBadge.tsx
/**
 * Badge de statut d'un programme.
 * Le statut est renvoyé par l'API et affiché tel quel.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { ProgrammeStatus } from '@/types/programme.types';

const LABELS: Record<ProgrammeStatus, string> = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
  EXPIRE: 'Expiré',
};

export default function ProgrammeStatusBadge({
  status,
}: {
  status: ProgrammeStatus;
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