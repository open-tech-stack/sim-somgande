// src/components/evenements/EvenementCard.tsx
/**
 * Carte d'un événement.
 * Le statut vient de l'API (`evenement.status`).
 */

import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type {
  Evenement,
  EvenementKind,
  EvenementStatus,
  PublicCible,
} from '@/types/evenement';
import { EVENEMENT_TYPE_LABEL, PUBLIC_CIBLE_LABEL } from '@/types/evenement';

import EvenementStatusBadge from './EvenementStatusBadge';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const MONTHS_SHORT = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];
const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function formatDayLabel(iso?: string | null): string {
  if (!iso) return 'Date à préciser';
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function formatTimeRange(startIso?: string | null, endIso?: string | null): string | null {
  if (!startIso) return null;
  const s = new Date(startIso);
  const start = `${s.getHours().toString().padStart(2, '0')}h${s
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
  if (!endIso) return start;
  const e = new Date(endIso);
  return `${start} – ${e.getHours().toString().padStart(2, '0')}h${e
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

function audienceLabel(a?: PublicCible | null, other?: string | null): string | null {
  if (!a) return null;
  if (a === 'AUTRE' && other) return other;
  return PUBLIC_CIBLE_LABEL[a];
}

function accentOf(
  kind: EvenementKind,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (kind) {
    case 'MARIAGE':         return '#EC4899';
    case 'CAMP':            return colors.success;
    case 'SORTIE':          return colors.info;
    case 'CONFERENCE':      return colors.primary;
    case 'FORMATION':       return colors.warning;
    case 'ACTION_DE_GRACE': return '#A855F7';
    case 'JOURNEE':         return '#F97316';
    case 'AUTRE':
    default:                return colors.textSecondary;
  }
}

// ------------------------------------------------------------------
// Infos (2 colonnes) — anti-doublon
// ------------------------------------------------------------------
type InfoItem = {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
  key: string;
};

function buildInfos(e: Evenement): {
  left: InfoItem | null;
  right: InfoItem | null;
} {
  switch (e.kind) {
    case 'MARIAGE': {
      const left: InfoItem = {
        icon: Users,
        label: 'MARIÉS',
        value: `${e.groomName ?? '—'}  &  ${e.brideName ?? '—'}`,
        key: 'couple',
      };
      if (e.ceremonyPlace) {
        return {
          left,
          right: {
            icon: MapPin,
            label: 'CÉRÉMONIE',
            value: `${e.ceremonyTime ?? ''}  ·  ${e.ceremonyPlace}`,
            key: 'ceremony',
          },
        };
      }
      if (e.townHallPlace) {
        return {
          left,
          right: {
            icon: MapPin,
            label: 'MAIRIE',
            value: `${e.townHallTime ?? ''}  ·  ${e.townHallPlace}`,
            key: 'townhall',
          },
        };
      }
      if (e.receptionPlace) {
        return {
          left,
          right: {
            icon: MapPin,
            label: 'RÉCEPTION',
            value: e.receptionPlace,
            key: 'reception',
          },
        };
      }
      return { left, right: null };
    }

    case 'CAMP':
    case 'SORTIE': {
      const left: InfoItem = {
        icon: Users,
        label: 'POUR',
        value: audienceLabel(e.audience, e.audienceOther) ?? '—',
        key: 'audience',
      };
      const right = e.location
        ? { icon: MapPin, label: 'LIEU', value: e.location, key: 'location' }
        : null;
      return { left, right };
    }

    case 'CONFERENCE': {
      const left: InfoItem = {
        icon: Users,
        label: 'CONFÉRENCIER',
        value: e.speaker ?? '—',
        key: 'speaker',
      };
      const right = e.location
        ? { icon: MapPin, label: 'LIEU', value: e.location, key: 'location' }
        : null;
      return { left, right };
    }

    case 'FORMATION': {
      const left: InfoItem = {
        icon: Users,
        label: 'FORMATEUR',
        value: e.trainer ?? '—',
        key: 'trainer',
      };
      if (e.location) {
        return {
          left,
          right: {
            icon: MapPin,
            label: 'LIEU',
            value: e.location,
            key: 'location',
          },
        };
      }
      const time = formatTimeRange(e.startsAt);
      if (time) {
        return {
          left,
          right: { icon: Clock, label: 'HEURE', value: time, key: 'time' },
        };
      }
      return { left, right: null };
    }

    case 'ACTION_DE_GRACE': {
      if (e.location) {
        return {
          left: {
            icon: MapPin,
            label: 'LIEU',
            value: e.location,
            key: 'location',
          },
          right: null,
        };
      }
      return { left: null, right: null };
    }

    case 'JOURNEE': {
      const left: InfoItem = {
        icon: Users,
        label: 'POUR',
        value: audienceLabel(e.audience, e.audienceOther) ?? '—',
        key: 'audience',
      };
      const right = e.location
        ? { icon: MapPin, label: 'LIEU', value: e.location, key: 'location' }
        : null;
      return { left, right };
    }

    case 'AUTRE':
    default: {
      if (e.location) {
        return {
          left: {
            icon: MapPin,
            label: 'LIEU',
            value: e.location,
            key: 'location',
          },
          right: null,
        };
      }
      const time = formatTimeRange(e.startsAt, e.endsAt);
      if (time) {
        return {
          left: { icon: Clock, label: 'HEURE', value: time, key: 'time' },
          right: null,
        };
      }
      return { left: null, right: null };
    }
  }
}

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
interface Props {
  evenement: Evenement;
  onPress: (e: Evenement) => void;
}

export default function EvenementCard({ evenement, onPress }: Props) {
  const { colors } = useTheme();
  const accent = accentOf(evenement.kind, colors);
  const { left, right } = useMemo(() => buildInfos(evenement), [evenement]);

  const dateLabel = formatDayLabel(evenement.startsAt);

  return (
    <Pressable
      onPress={() => onPress(evenement)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={styles.body}>
        {/* ---------- Ligne badges ---------- */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: accent + '22', borderColor: accent + '55' },
            ]}
          >
            <Text style={[styles.typeBadgeText, { color: accent }]}>
              {EVENEMENT_TYPE_LABEL[evenement.kind]}
            </Text>
          </View>

          <EvenementStatusBadge status={evenement.status} />
        </View>

        {/* ---------- Titre + résumé ---------- */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {evenement.title}
        </Text>
        <Text
          style={[styles.summary, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {evenement.summary}
        </Text>

        {/* ---------- Bloc méta ---------- */}
        <View
          style={[
            styles.metaBox,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={styles.metaRow}>
            <Calendar size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[styles.metaText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {dateLabel}
            </Text>
          </View>
        </View>

        {/* ---------- Grille 2 colonnes ---------- */}
        {(left || right) && (
          <View style={styles.grid}>
            {left && (
              <View style={styles.gridCell}>
                <left.icon size={15} color={accent} strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cellLabel, { color: colors.textMuted }]}
                  >
                    {left.label}
                  </Text>
                  <Text
                    style={[styles.cellValue, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {left.value}
                  </Text>
                </View>
              </View>
            )}

            {right && (
              <View style={styles.gridCell}>
                <right.icon size={15} color={accent} strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cellLabel, { color: colors.textMuted }]}
                  >
                    {right.label}
                  </Text>
                  <Text
                    style={[styles.cellValue, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {right.value}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ---------- Pied ---------- */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: accent }]}>
            Voir les détails
          </Text>
          <ArrowRight size={15} color={accent} strokeWidth={2.6} />
        </View>
      </View>

      {/* Barre colorée à droite */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
    </Pressable>
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
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  title: { fontSize: FontSize.lg, fontWeight: '800' },
  summary: { fontSize: FontSize.sm, lineHeight: 18, marginTop: -2 },

  metaBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: FontSize.sm, flexShrink: 1 },

  grid: { flexDirection: 'row', gap: Spacing.md },
  gridCell: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  cellValue: { fontSize: FontSize.sm, fontWeight: '700', lineHeight: 17 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { fontSize: FontSize.sm, fontWeight: '800' },
});