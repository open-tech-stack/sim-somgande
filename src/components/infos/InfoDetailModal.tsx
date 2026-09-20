// src/components/infos/InfoDetailModal.tsx
/**
 * Modal de détail d'une info.
 * Affiche le titre, la priorité, le summary mis en avant et le détail complet.
 * Pas de date affichée ici — l'info est intemporelle dans son contenu.
 */

import { X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Info } from '@/types/info';

import InfoPriorityDot from './InfoPriorityDot';

interface Props {
  visible: boolean;
  info: Info | null;
  onClose: () => void;
}

export default function InfoDetailModal({ visible, info, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!info) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      />

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
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, gap: Spacing.sm }}>
            <InfoPriorityDot priority={info.priority} />
            <Text style={[styles.title, { color: colors.text }]}>
              {info.title}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [
              styles.closeBtn,
              {
                backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                borderColor: colors.border,
              },
            ]}
          >
            <X size={18} color={colors.text} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          style={{ maxHeight: 560 }}
          contentContainerStyle={{ paddingTop: Spacing.lg, gap: Spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary mis en valeur */}
          <View
            style={[
              styles.summaryBox,
              {
                backgroundColor: colors.primary + '14',
                borderColor: colors.primary + '44',
              },
            ]}
          >
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {info.summary}
            </Text>
          </View>

          {/* Détail long */}
          {info.detail && (
            <Text style={[styles.detailText, { color: colors.text }]}>
              {info.detail}
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill },
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  summaryText: { fontSize: FontSize.md, lineHeight: 21, fontWeight: '600' },

  detailText: { fontSize: FontSize.sm, lineHeight: 21 },
});