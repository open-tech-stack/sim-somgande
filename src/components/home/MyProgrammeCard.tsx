// src/components/home/MyProgrammeCard.tsx
/**
 * Carte "Mon programme" sur l'accueil.
  *  - Si l'utilisateur est au programme : liste des sections à venir
  * - Si l'utilisateur n'est pas au programme : message "aucune tâche assignée"
 */

import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Programme, ProgrammeSection } from '@/types/programme.types';

const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];
const DAYS = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi',
];

function dayLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

interface MySlot {
  programme: Programme;
  section: ProgrammeSection;
}

interface Props {
  /** `personId` de l'utilisateur connecté (peut être null) */
  personId: string | null;

  /**
   * Liste des programmes à venir (reçue du parent).
   * ⚠️ Le parent doit fournir au moins 20 items pour couvrir
   *    tous les programmes à venir du mois.
   */
  programmes: Programme[];
}

export default function MyProgrammeCard({ personId, programmes }: Props) {
  const { colors } = useTheme();

  const slots = useMemo<MySlot[]>(() => {
    if (!personId) return [];
    const out: MySlot[] = [];

    for (const prog of programmes) {
      if (prog.status !== 'A_VENIR') continue;
      for (const section of prog.sections) {
        if (section.persons.some((p) => p.id === personId)) {
          out.push({ programme: prog, section });
        }
      }
    }

    return out;
  }, [programmes, personId]);

  const hasSlot = slots.length > 0;

  // -------- Cas 1 : au programme --------
  if (hasSlot) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.success + '55',
          },
        ]}
      >
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconBubble,
                {
                  backgroundColor: colors.success + '22',
                  borderColor: colors.success + '55',
                },
              ]}
            >
              <CalendarCheck
                size={16}
                color={colors.success}
                strokeWidth={2.4}
              />
            </View>
            <Text style={[styles.tag, { color: colors.success }]}>
              VOUS ÊTES AU PROGRAMME
            </Text>
          </View>

          <View style={styles.slots}>
            {slots.map(({ programme, section }, i) => (
              <View
                key={programme.id + ':' + section.id + ':' + i}
                style={[
                  styles.slotRow,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <CheckCircle2
                  size={14}
                  color={colors.success}
                  strokeWidth={2.6}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotLabel, { color: colors.text }]}>
                    {section.label}
                  </Text>
                  <View style={styles.slotMeta}>
                    <CalendarDays
                      size={11}
                      color={colors.textSecondary}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.slotMetaText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {programme.title}  ·  {dayLabel(programme.startsAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.accentBar, { backgroundColor: colors.success }]} />
      </View>
    );
  }

  // -------- Cas 2 : pas au programme --------
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <CalendarDays
              size={16}
              color={colors.textMuted}
              strokeWidth={2.4}
            />
          </View>
          <Text style={[styles.tag, { color: colors.textMuted }]}>
            MON PROGRAMME
          </Text>
        </View>

        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Vous n&apos;êtes pas au programme
        </Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          Aucune tâche ne vous est assignée dans les prochains programmes.
        </Text>
      </View>

      <View style={[styles.accentBar, { backgroundColor: colors.textMuted }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  accentBar: { width: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  slots: { gap: Spacing.sm, marginTop: Spacing.xs },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  slotLabel: { fontSize: FontSize.md, fontWeight: '800' },
  slotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  slotMetaText: { fontSize: FontSize.xs, flexShrink: 1 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '800' },
  emptySub: { fontSize: FontSize.sm, lineHeight: 19 },
});