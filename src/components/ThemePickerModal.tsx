// src/components/ThemePickerModal.tsx
/**
 * Modal de sélection du thème.
 * Bottom sheet avec les 4 palettes, preview + label, coche sur l'actif.
 * Le changement de thème est INSTANTANÉ et persisté (via ThemeContext).
 */

import { Check } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FontSize,
  Radius,
  Spacing,
  ThemeMeta,
  ThemeName,
} from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const ORDER: ThemeName[] = ['darkBlue', 'orangeRed', 'light', 'blueDark'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ThemePickerModal({ visible, onClose }: Props) {
  const { colors, name, setTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const pick = (next: ThemeName) => {
    setTheme(next);
    // petit délai pour laisser le thème s'appliquer
    setTimeout(onClose, 120);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        {/* Poignée */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <Text style={[styles.title, { color: colors.text }]}>
          Choisir un thème
        </Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Le thème s'applique immédiatement.
        </Text>

        <View style={styles.grid}>
          {ORDER.map((key) => {
            const meta = ThemeMeta[key];
            const active = key === name;
            return (
              <Pressable
                key={key}
                onPress={() => pick(key)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: active ? colors.primary : colors.border,
                    borderWidth: active ? 2 : 1,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                {/* Aperçu (2 pastilles : fond + accent) */}
                <View style={styles.previewRow}>
                  <View
                    style={[
                      styles.previewDot,
                      { backgroundColor: meta.preview, borderColor: colors.border },
                    ]}
                  />
                  <View
                    style={[styles.previewDot, { backgroundColor: meta.accent }]}
                  />
                </View>

                <Text style={[styles.cardLabel, { color: colors.text }]}>
                  {meta.label}
                </Text>

                {active && (
                  <View
                    style={[styles.check, { backgroundColor: colors.primary }]}
                  >
                    <Check size={12} color={colors.onPrimary} strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: 2,
  },
  sub: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 6,
  },
  previewDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  check: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});