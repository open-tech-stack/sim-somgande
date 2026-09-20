// src/components/infos/InfoPriorityDot.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { InfoPriority } from '@/types/info';

export default function InfoPriorityDot({
  priority,
}: {
  priority: InfoPriority;
}) {
  const { colors } = useTheme();
  if (priority === 'NORMAL') return null;

  const isUrgent = priority === 'URGENT';
  const tone = isUrgent ? colors.danger : colors.warning;

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: tone + '22', borderColor: tone + '55' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={[styles.text, { color: tone }]}>
        {isUrgent ? 'URGENT' : 'IMPORTANT'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
});