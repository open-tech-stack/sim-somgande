// src/components/home/HomeHeader.tsx
/**
 * En-tête de l'accueil : date du jour + salutation personnalisée.
 * Le nom vient du `fullName` de l'utilisateur connecté (via AuthContext).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const DAYS = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi',
];

function todayLong(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Ne garde que le PRÉNOM pour la salutation.
 * Ex : "Nestor COMPAORE" → "Nestor"
 *      "Ali" → "Ali"
 *      null → "" (pas de prénom)
 */
function firstName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  // On prend le premier mot, avec la première lettre en majuscule
  const first = parts[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export default function HomeHeader() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const name = firstName(user?.fullName);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.small, { color: colors.textSecondary }]}>
        {todayLong()}
      </Text>

      <Text style={[styles.big, { color: colors.text }]} numberOfLines={1}>
        Bienvenue {name ? `${name} 👋` : '👋'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  small: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  big: {
    fontSize: FontSize.xxl + 2,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});