// src/components/evenements/InfoRow.tsx
/**
 * Ligne "icône + label + valeur" utilisée dans la carte et le modal.
 */

import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  icon: LucideIcon;
  label?: string;
  value: string;
}

export default function InfoRow({ icon: Icon, label, value }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Icon size={14} color={colors.textSecondary} strokeWidth={2.2} />
      <View style={{ flex: 1 }}>
        {label && (
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {label}
          </Text>
        )}
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  value: { fontSize: FontSize.sm, lineHeight: 18 },
});