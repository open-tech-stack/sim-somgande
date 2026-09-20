// src/components/home/HomeHeader.tsx
/**
 * En-tête de l'accueil : date du jour + salutation.
 * (Plus de badge notification — il est déjà dans le header global.)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const MONTHS = [
  'janvier','février','mars','avril','mai','juin',
  'juillet','août','septembre','octobre','novembre','décembre',
];
const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function todayLong(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function HomeHeader() {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.small, { color: colors.textSecondary }]}>
        {todayLong()}
      </Text>
      <Text style={[styles.big, { color: colors.text }]}>Bienvenue 👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  small: { fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.3 },
  big: {
    fontSize: FontSize.xxl + 2,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});