// src/components/prieres/PriereCard.tsx
/**
 * Carte d'une prière.
 * Barre colorée à droite, icône cœur, titre, date relative, lieu, détail.
 */

import { Calendar, Heart, MapPin } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Priere } from '@/types/priere';

// ------------------------------------------------------------------
// Date relative
// ------------------------------------------------------------------
const MONTHS_SHORT = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];

function relativeDate(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - Date.parse(iso);
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  if (diff < MIN) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MIN)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return 'hier';
  if (diff < 7 * DAY) return `il y a ${Math.floor(diff / DAY)} jours`;
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

// Format date précise
const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function formatPreciseDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}  ·  ${d
    .getHours()
    .toString()
    .padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function PriereCard({ priere }: { priere: Priere }) {
  const { colors } = useTheme();
  const accent =
    priere.priority === 'URGENT'
      ? colors.danger
      : priere.priority === 'IMPORTANT'
      ? colors.warning
      : '#A855F7';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.body}>
        {/* En-tête : icône + priorité + date relative */}
        <View style={styles.topRow}>
          <View style={styles.leftGroup}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: accent + '22', borderColor: accent + '55' },
              ]}
            >
              <Heart size={14} color={accent} strokeWidth={2.4} />
            </View>
            {priere.priority && priere.priority !== 'NORMAL' && (
              <View
                style={[
                  styles.priorityPill,
                  {
                    backgroundColor:
                      priere.priority === 'URGENT'
                        ? colors.danger + '22'
                        : colors.warning + '22',
                    borderColor:
                      priere.priority === 'URGENT'
                        ? colors.danger + '66'
                        : colors.warning + '66',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        priere.priority === 'URGENT'
                          ? colors.danger
                          : colors.warning,
                    },
                  ]}
                >
                  {priere.priority}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.relativeDate, { color: colors.textMuted }]}>
            {relativeDate(priere.createdAt)}
          </Text>
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: colors.text }]}>
          {priere.title}
        </Text>

        {/* Date + lieu */}
        {(priere.date || priere.location) && (
          <View
            style={[
              styles.metaBox,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            {priere.date && (
              <View style={styles.metaRow}>
                <Calendar
                  size={13}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  {formatPreciseDate(priere.date)}
                </Text>
              </View>
            )}
            {priere.location && (
              <View style={styles.metaRow}>
                <MapPin
                  size={13}
                  color={colors.textSecondary}
                  strokeWidth={2}
                />
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  {priere.location}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Détail */}
        {priere.detail && (
          <Text style={[styles.detail, { color: colors.text }]}>
            {priere.detail}
          </Text>
        )}
      </View>

      <View style={[styles.accentBar, { backgroundColor: accent }]} />
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

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  priorityText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  relativeDate: { fontSize: FontSize.xs, fontWeight: '600' },

  title: { fontSize: FontSize.lg, fontWeight: '800' },

  metaBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 6,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: FontSize.sm, flexShrink: 1 },

  detail: { fontSize: FontSize.sm, lineHeight: 20 },
});