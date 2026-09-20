// src/components/programmes/ProgrammeDetailModal.tsx
import { BookOpen, Calendar, Clock, MapPin, X } from 'lucide-react-native';
import React, { useMemo } from 'react';
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

import ProgrammeSectionRow from './ProgrammeSectionRow';
import { Programme, ProgrammeSection } from '@/types/programme.types';

const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];

function formatDayLabel(iso?: string | null): string {
  if (!iso) return 'Date à préciser';
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
  visible: boolean;
  programme: Programme | null;
  onClose: () => void;
  onSectionPress?: (programme: Programme, section: ProgrammeSection) => void;
}

export default function ProgrammeDetailModal({
  visible,
  programme,
  onClose,
  onSectionPress,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const sections = useMemo(
    () => (programme ? [...programme.sections].sort((a, b) => a.order - b.order) : []),
    [programme],
  );

  if (!programme) return null;

  const status = programme.status;
  const showCommunion = typeof programme.hasHolyCommunion === 'boolean';
  const communionTone = programme.hasHolyCommunion
    ? colors.success
    : colors.textMuted;

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
          <View style={{ flex: 1, gap: Spacing.sm }}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      status === 'EN_COURS'
                        ? colors.success + '22'
                        : status === 'A_VENIR'
                        ? colors.info + '22'
                        : colors.surfaceAlt,
                    borderColor:
                      status === 'EN_COURS'
                        ? colors.success + '55'
                        : status === 'A_VENIR'
                        ? colors.info + '55'
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        status === 'EN_COURS'
                          ? colors.success
                          : status === 'A_VENIR'
                          ? colors.info
                          : colors.textMuted,
                    },
                  ]}
                >
                  {status === 'EN_COURS'
                    ? 'En cours'
                    : status === 'A_VENIR'
                    ? 'À venir'
                    : status === 'ANNULE'
                    ? 'Annulé'
                    : status === 'EXPIRE'
                    ? 'Expiré'
                    : 'Terminé'}
                </Text>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {programme.title}
            </Text>
            <Text style={[styles.summary, { color: colors.textSecondary }]}>
              {programme.summary}
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
          style={{ maxHeight: 580 }}
          contentContainerStyle={{ paddingTop: Spacing.md, gap: Spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.metaBox,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <View style={styles.metaRow}>
              <Calendar size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatDayLabel(programme.startsAt)}
              </Text>
            </View>
            {(programme.startsAt || programme.endsAt) && (
              <View style={styles.metaRow}>
                <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {formatTime(programme.startsAt)}
                  {programme.endsAt ? ` – ${formatTime(programme.endsAt)}` : ''}
                </Text>
              </View>
            )}
            {programme.location && (
              <View style={styles.metaRow}>
                <MapPin size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {programme.location}
                </Text>
              </View>
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
                  styles.communionIcon,
                  { backgroundColor: communionTone + '22' },
                ]}
              >
                <BookOpen size={16} color={communionTone} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.communionTitle, { color: communionTone }]}>
                  SAINTE-CÈNE{'  ·  '}
                  {programme.hasHolyCommunion ? 'OUI' : 'NON'}
                </Text>
                {programme.holyCommunionMessage && (
                  <Text style={[styles.communionMsg, { color: colors.text }]}>
                    {programme.holyCommunionMessage}
                  </Text>
                )}
              </View>
            </View>
          )}

          {sections.length > 0 && (
            <View>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                DÉROULEMENT
              </Text>
              {sections.map((s, idx) => (
                <View key={s.id}>
                  <ProgrammeSectionRow
                    section={s}
                    onPress={() => onSectionPress?.(programme, s)}
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
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  badgeRow: { flexDirection: 'row', gap: 6 },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  title: { fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  summary: { fontSize: FontSize.sm, lineHeight: 18 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: FontSize.sm, flexShrink: 1 },
  communionBox: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  communionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  communionMsg: { fontSize: FontSize.sm, lineHeight: 19 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
  notesBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  notesText: { fontSize: FontSize.sm, lineHeight: 19 },
});