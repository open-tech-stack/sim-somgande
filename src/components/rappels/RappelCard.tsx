// src/components/rappels/RappelCard.tsx
import { Bell, CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Rappel } from '@/types/rappel';

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

export default function RappelCard({ rappel }: { rappel: Rappel }) {
  const { colors } = useTheme();
  const accent =
    rappel.priority === 'URGENT'
      ? colors.danger
      : rappel.priority === 'IMPORTANT'
      ? colors.warning
      : colors.primary;

  const elements = rappel.elements ?? [];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.leftGroup}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: accent + '22', borderColor: accent + '55' },
              ]}
            >
              <Bell size={14} color={accent} strokeWidth={2.4} />
            </View>
            {rappel.priority !== 'NORMAL' && (
              <View
                style={[
                  styles.priorityPill,
                  {
                    backgroundColor:
                      rappel.priority === 'URGENT'
                        ? colors.danger + '22'
                        : colors.warning + '22',
                    borderColor:
                      rappel.priority === 'URGENT'
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
                        rappel.priority === 'URGENT'
                          ? colors.danger
                          : colors.warning,
                    },
                  ]}
                >
                  {rappel.priority}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.relativeDate, { color: colors.textMuted }]}>
            {relativeDate(rappel.createdAt)}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {rappel.title}
        </Text>

        {elements.length > 0 && (
          <View
            style={[
              styles.listBox,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            {elements.map((el) => (
              <View key={el.id} style={styles.listRow}>
                <CheckCircle2 size={14} color={accent} strokeWidth={2.4} />
                <Text style={[styles.listText, { color: colors.text }]}>
                  {el.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {rappel.detail && (
          <Text style={[styles.detail, { color: colors.text }]}>
            {rappel.detail}
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
  listBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listText: { fontSize: FontSize.sm, lineHeight: 19, flex: 1 },
  detail: { fontSize: FontSize.sm, lineHeight: 20 },
});