// src/components/home/EmptyCard.tsx
/**
 * Carte "vide" affichée quand aucune donnée n'est disponible
 * dans une section de l'accueil.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  text: string;
}

export default function EmptyCard({ icon: Icon, text }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Icon size={22} color={colors.textMuted} strokeWidth={2} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: { fontSize: FontSize.sm, textAlign: 'center' },
});