// src/components/programmes/ProgrammeSectionRow.tsx
/**
 * Une ligne du déroulement : Rôle → résumé.
 *
 * ⚠️ Les personnes et le groupe sont DÉJÀ inclus dans la réponse API.
 * Plus besoin d'appeler resolvePeople/getGroupById.
 */

import {
  Car,
  ChevronRight,
  Mic,
  Music,
  ScrollText,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

import PersonChip from './PersonChip';
import { ProgrammeSection } from '@/types/programme.types';

/** Icône associée à chaque clé de section (les clés API sont en MAJ) */
const SECTION_ICONS: Record<string, LucideIcon> = {
  ACCUEIL: UserCheck,
  ANIMATION: Mic,
  LOUANGE_ADORATION: Music,
  PREDICATION: ScrollText,
  INTERPRETATION: Users,
  PARKING: Car,
  LIBRE: Users,
};

interface Props {
  section: ProgrammeSection;
  onPress: () => void;
}

export default function ProgrammeSectionRow({ section, onPress }: Props) {
  const { colors } = useTheme();
  const Icon = SECTION_ICONS[section.key] ?? Users;

  const people = section.persons ?? [];
  const group = section.group;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
      ]}
    >
      {/* Colonne gauche */}
      <View style={styles.left}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: colors.primary + '18',
              borderColor: colors.border,
            },
          ]}
        >
          <Icon size={14} color={colors.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {section.label}
        </Text>
      </View>

      {/* Colonne droite */}
      <View style={styles.right}>
        <View style={styles.valuesRow}>
          {/* 1 personne → chip nom complet */}
          {people.length === 1 && <PersonChip person={people[0]} />}

          {/* 2+ personnes → compteur */}
          {people.length >= 2 && (
            <View
              style={[
                styles.countChip,
                {
                  backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '55',
                },
              ]}
            >
              <Users size={12} color={colors.primary} strokeWidth={2.4} />
              <Text style={[styles.countText, { color: colors.primary }]}>
                {people.length} personnes
              </Text>
            </View>
          )}

          {/* Pas de personnes mais un groupe */}
          {people.length === 0 && group && (
            <View
              style={[
                styles.groupChip,
                {
                  backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '55',
                },
              ]}
            >
              <Music size={12} color={colors.primary} strokeWidth={2.4} />
              <Text style={[styles.groupText, { color: colors.primary }]}>
                {group.name}
              </Text>
            </View>
          )}

          {/* Valeur simple */}
          {people.length === 0 && !group && section.value && (
            <Text style={[styles.value, { color: colors.text }]}>
              {section.value}
            </Text>
          )}

          {/* Rien */}
          {people.length === 0 && !group && !section.value && (
            <Text style={[styles.empty, { color: colors.textMuted }]}>—</Text>
          )}
        </View>

        <ChevronRight size={16} color={colors.textMuted} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: Radius.sm,
    gap: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: FontSize.sm, fontWeight: '600' },

  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  valuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  countText: { fontSize: FontSize.sm, fontWeight: '700' },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  groupText: { fontSize: FontSize.sm, fontWeight: '700' },
  value: { fontSize: FontSize.sm, fontWeight: '700' },
  empty: { fontSize: FontSize.sm },
});