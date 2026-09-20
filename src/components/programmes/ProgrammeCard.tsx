// src/components/programmes/ProgrammeCard.tsx
/**
 * Carte d'un programme.
 * Le statut vient de l'API (`programme.status`), pas de calcul local.
 */

import { BookOpen, Calendar, Clock, MapPin } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

import ProgrammeSectionRow from './ProgrammeSectionRow';
import ProgrammeStatusBadge from './ProgrammeStatusBadge';
import { Programme, ProgrammeSection } from '@/types/programme.types';

const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];

function formatDayLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function formatTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}h${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

interface Props {
  programme: Programme;
  onSectionPress: (programme: Programme, section: ProgrammeSection) => void;
}

export default function ProgrammeCard({ programme, onSectionPress }: Props) {
  const { colors } = useTheme();

  const sections = useMemo(
    () => [...programme.sections].sort((a, b) => a.order - b.order),
    [programme.sections],
  );

  const accent =
    programme.priority === 'URGENT'
      ? colors.danger
      : programme.priority === 'IMPORTANT'
      ? colors.warning
      : colors.primary;

  const showCommunion = typeof programme.hasHolyCommunion === 'boolean';
  const communionTone = programme.hasHolyCommunion
    ? colors.success
    : colors.textMuted;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {programme.title}
          </Text>
          <ProgrammeStatusBadge status={programme.status} />
        </View>

        <Text style={[styles.summary, { color: colors.textSecondary }]}>
          {programme.summary}
        </Text>

        <View
          style={[
            styles.metaBox,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <MetaLine
            icon={<Calendar size={14} color={colors.textSecondary} strokeWidth={2} />}
            text={formatDayLabel(programme.startsAt) || 'Date à préciser'}
          />
          {(programme.startsAt || programme.endsAt) && (
            <MetaLine
              icon={<Clock size={14} color={colors.textSecondary} strokeWidth={2} />}
              text={`${formatTime(programme.startsAt)}${
                programme.endsAt ? ` – ${formatTime(programme.endsAt)}` : ''
              }`}
            />
          )}
          {programme.location && (
            <MetaLine
              icon={<MapPin size={14} color={colors.textSecondary} strokeWidth={2} />}
              text={programme.location}
            />
          )}
        </View>

        {showCommunion && (
          <View
            style={[
              styles.communionBox,
              {
                backgroundColor: communionTone + '14',
                borderColor: communionTone + '55',
              },
            ]}
          >
            <View
              style={[
                styles.communionIconWrap,
                { backgroundColor: communionTone + '22' },
              ]}
            >
              <BookOpen size={16} color={communionTone} strokeWidth={2.4} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.communionHeaderRow}>
                <Text style={[styles.communionTitle, { color: communionTone }]}>
                  SAINTE-CÈNE
                </Text>
                <View
                  style={[
                    styles.communionBoolBadge,
                    {
                      backgroundColor: communionTone + '22',
                      borderColor: communionTone + '66',
                    },
                  ]}
                >
                  <Text
                    style={[styles.communionBoolText, { color: communionTone }]}
                  >
                    {programme.hasHolyCommunion ? 'OUI' : 'NON'}
                  </Text>
                </View>
              </View>

              {programme.holyCommunionMessage && (
                <Text style={[styles.communionMessage, { color: colors.text }]}>
                  {programme.holyCommunionMessage}
                </Text>
              )}
            </View>
          </View>
        )}

        {sections.length > 0 && (
          <View style={[styles.sectionsBox, { borderColor: colors.border }]}>
            <Text style={[styles.sectionsTitle, { color: colors.textMuted }]}>
              DÉROULEMENT
            </Text>
            {sections.map((s, idx) => (
              <View key={s.id}>
                <ProgrammeSectionRow
                  section={s}
                  onPress={() => onSectionPress(programme, s)}
                />
                {idx < sections.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {programme.notes && (
          <View
            style={[
              styles.notesBox,
              {
                backgroundColor: colors.primary + '14',
                borderColor: colors.primary + '33',
              },
            ]}
          >
            <Text style={[styles.notesText, { color: colors.text }]}>
              {programme.notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function MetaLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaLine}>
      {icon}
      <Text
        style={[styles.metaText, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {text}
      </Text>
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
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  accentBar: { width: 4 },
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.md },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: { flex: 1, fontSize: FontSize.lg, fontWeight: '800' },
  summary: { fontSize: FontSize.sm, lineHeight: 18, marginTop: -4 },

  metaBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: FontSize.sm, flexShrink: 1 },

  communionBox: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  communionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  communionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  communionBoolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  communionBoolText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  communionMessage: { fontSize: FontSize.sm, lineHeight: 19 },

  sectionsBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  sectionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.6 },

  notesBox: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  notesText: { fontSize: FontSize.sm, lineHeight: 19 },
});