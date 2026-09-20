// src/components/programmes/SectionDetailModal.tsx
/**
 * Modal de détail d'une section du déroulement.
 * Les personnes/groupes sont déjà inclus dans la section (venant de l'API).
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
import { ProgrammeSection } from '@/types/programme.types';

interface Props {
  visible: boolean;
  section: ProgrammeSection | null;
  onClose: () => void;
}

export default function SectionDetailModal({ visible, section, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!section) return null;

  const people = section.persons ?? [];
  const group = section.group;

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

        <View style={styles.header}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {section.label}
          </Text>
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
          style={{ maxHeight: 400 }}
          contentContainerStyle={{ paddingTop: Spacing.sm, gap: Spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cas 1 : personnes */}
          {people.length > 0 &&
            people.map((p) => (
              <PersonRow key={p.id} fullName={p.fullName} />
            ))}

          {/* Cas 2 : groupe */}
          {people.length === 0 && group && (
            <View
              style={[
                styles.singleBox,
                {
                  backgroundColor: colors.primary + '14',
                  borderColor: colors.primary + '44',
                },
              ]}
            >
              <Text style={[styles.singleText, { color: colors.primary }]}>
                {group.name}
              </Text>
            </View>
          )}

          {/* Cas 3 : valeur simple */}
          {people.length === 0 && !group && section.value && (
            <View
              style={[
                styles.singleBox,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.singleText, { color: colors.text }]}>
                {section.value}
              </Text>
            </View>
          )}

          {/* Cas 4 : rien */}
          {people.length === 0 && !group && !section.value && (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Aucune personne assignée à cette section.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ------------------------------------------------------------------
// Ligne personne (nom complet uniquement)
// ------------------------------------------------------------------
function PersonRow({ fullName }: { fullName: string }) {
  const { colors } = useTheme();
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.personRow,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.personAvatar,
          { backgroundColor: colors.primary + '33' },
        ]}
      >
        <Text style={[styles.personInitials, { color: colors.primary }]}>
          {initials}
        </Text>
      </View>
      <Text style={[styles.personName, { color: colors.text }]}>
        {fullName}
      </Text>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: { fontSize: 14, fontWeight: '800' },
  personName: { fontSize: FontSize.md, fontWeight: '700' },
  singleBox: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
    alignItems: 'center',
  },
  singleText: { fontSize: FontSize.lg, fontWeight: '800' },
  empty: { padding: Spacing.lg, alignItems: 'center' },
  emptyText: { fontSize: FontSize.sm, textAlign: 'center' },
});