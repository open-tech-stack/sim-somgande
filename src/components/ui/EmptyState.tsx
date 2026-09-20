// src/components/ui/EmptyState.tsx
/**
 * Composant réutilisable pour les états "vide".
 * Affiche une illustration (PNG) + un titre + un sous-titre.
 */

import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  /** Illustration (require('../assets/images/...png')) */
  image: number;
  title: string;
  subtitle?: string;
  /** Taille de l'image (défaut 160) */
  imageSize?: number;
}

export default function EmptyState({
  image,
  title,
  subtitle,
  imageSize = 160,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <Image
        source={image}
        style={{ width: imageSize, height: imageSize }}
        contentFit="contain"
        transition={200}
      />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});