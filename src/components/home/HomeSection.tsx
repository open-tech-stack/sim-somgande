// src/components/home/HomeSection.tsx
/**
 * Wrapper de section de l'accueil :
 *  - Icône + titre à gauche
 *  - Lien "Voir tout →" à droite
 *  - Contenu au-dessous
 */

import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  title: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  onSeeAll: () => void;
  children: React.ReactNode;
}

export default function HomeSection({
  title,
  icon: Icon,
  onSeeAll,
  children,
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon size={16} color={colors.primary} strokeWidth={2.4} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        <Pressable onPress={onSeeAll} hitSlop={8} style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>
            Voir tout
          </Text>
          <ArrowRight size={12} color={colors.primary} strokeWidth={2.6} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 0.2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: FontSize.sm, fontWeight: '800' },
});