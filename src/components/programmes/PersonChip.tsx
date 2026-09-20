// src/components/programmes/PersonChip.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { ProgrammePersonRef } from '@/types/programme.types';

function initialsFromFullName(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export default function PersonChip({ person }: { person: ProgrammePersonRef }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + '33' }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {initialsFromFullName(person.fullName)}
        </Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {person.fullName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 9, fontWeight: '800' },
  name: { fontSize: FontSize.sm, fontWeight: '600' },
});