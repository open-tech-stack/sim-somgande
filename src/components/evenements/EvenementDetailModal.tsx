// src/components/evenements/EvenementDetailModal.tsx
import {
  Calendar,
  Clock,
  MapPin,
  ScrollText,
  Users,
  X,
} from 'lucide-react-native';
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
import type { Evenement, PublicCible } from '@/types/evenement';
import { PUBLIC_CIBLE_LABEL } from '@/types/evenement';

import EvenementStatusBadge from './EvenementStatusBadge';
import InfoRow from './InfoRow';

const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS = [
  'janv.','févr.','mars','avr.','mai','juin',
  'juil.','août','sept.','oct.','nov.','déc.',
];

function formatFullDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}h${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}
function audienceLabel(a?: PublicCible | null, other?: string | null): string {
  if (!a) return '—';
  if (a === 'AUTRE' && other) return other;
  return PUBLIC_CIBLE_LABEL[a];
}

interface Props {
  visible: boolean;
  evenement: Evenement | null;
  onClose: () => void;
}

export default function EvenementDetailModal({
  visible,
  evenement,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!evenement) return null;

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
            <EvenementStatusBadge status={evenement.status} />
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={2}
            >
              {evenement.title}
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
          contentContainerStyle={{ paddingTop: Spacing.md, gap: Spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            {evenement.kind === 'MARIAGE' && (
              <>
                <InfoRow
                  icon={Users}
                  label="MARIÉS"
                  value={`${evenement.groomName ?? '—'}  &  ${evenement.brideName ?? '—'}`}
                />
                {evenement.townHallPlace && (
                  <InfoRow
                    icon={MapPin}
                    label="MAIRIE"
                    value={`${evenement.townHallTime ?? ''}  ·  ${evenement.townHallPlace}`}
                  />
                )}
                {evenement.ceremonyPlace && (
                  <InfoRow
                    icon={MapPin}
                    label="CÉRÉMONIE"
                    value={`${evenement.ceremonyTime ?? ''}  ·  ${evenement.ceremonyPlace}`}
                  />
                )}
                {evenement.receptionPlace && (
                  <InfoRow
                    icon={MapPin}
                    label="RÉCEPTION"
                    value={evenement.receptionPlace}
                  />
                )}
              </>
            )}

            {(evenement.kind === 'CAMP' || evenement.kind === 'SORTIE') && (
              <>
                <InfoRow
                  icon={Users}
                  label="POUR"
                  value={audienceLabel(evenement.audience, evenement.audienceOther)}
                />
                <InfoRow
                  icon={Calendar}
                  label="DÉBUT"
                  value={formatFullDate(evenement.startsAt)}
                />
                {evenement.endsAt && (
                  <InfoRow
                    icon={Calendar}
                    label="FIN"
                    value={formatFullDate(evenement.endsAt)}
                  />
                )}
                {evenement.location && (
                  <InfoRow icon={MapPin} label="LIEU" value={evenement.location} />
                )}
                {evenement.theme && (
                  <InfoRow
                    icon={ScrollText}
                    label="THÈME PRINCIPAL"
                    value={evenement.theme}
                  />
                )}
              </>
            )}

            {evenement.kind === 'CONFERENCE' && (
              <>
                <InfoRow
                  icon={Calendar}
                  label="DATE"
                  value={formatFullDate(evenement.startsAt)}
                />
                {evenement.startsAt && (
                  <InfoRow
                    icon={Clock}
                    label="HEURE"
                    value={formatTime(evenement.startsAt)}
                  />
                )}
                {evenement.speaker && (
                  <InfoRow
                    icon={Users}
                    label="CONFÉRENCIER"
                    value={evenement.speaker}
                  />
                )}
                {evenement.theme && (
                  <InfoRow
                    icon={ScrollText}
                    label="THÈME"
                    value={evenement.theme}
                  />
                )}
                {evenement.location && (
                  <InfoRow icon={MapPin} label="LIEU" value={evenement.location} />
                )}
              </>
            )}

            {evenement.kind === 'FORMATION' && (
              <>
                <InfoRow
                  icon={Calendar}
                  label="DATE"
                  value={formatFullDate(evenement.startsAt)}
                />
                {evenement.startsAt && (
                  <InfoRow
                    icon={Clock}
                    label="HEURE"
                    value={formatTime(evenement.startsAt)}
                  />
                )}
                {evenement.location && (
                  <InfoRow icon={MapPin} label="LIEU" value={evenement.location} />
                )}
                {evenement.trainer && (
                  <InfoRow
                    icon={Users}
                    label="FORMATEUR"
                    value={evenement.trainer}
                  />
                )}
              </>
            )}

            {evenement.kind === 'ACTION_DE_GRACE' && (
              <>
                <InfoRow
                  icon={Calendar}
                  label="DATE"
                  value={formatFullDate(evenement.startsAt)}
                />
                {evenement.location && (
                  <InfoRow icon={MapPin} label="LIEU" value={evenement.location} />
                )}
              </>
            )}

            {evenement.kind === 'JOURNEE' && (
              <>
                <InfoRow
                  icon={Users}
                  label="POUR"
                  value={audienceLabel(evenement.audience, evenement.audienceOther)}
                />
                <InfoRow
                  icon={Calendar}
                  label="DATE"
                  value={formatFullDate(evenement.startsAt)}
                />
                {evenement.location && (
                  <InfoRow icon={MapPin} label="LIEU" value={evenement.location} />
                )}
              </>
            )}

            {evenement.kind === 'AUTRE' && (
              <>
                <InfoRow
                  icon={Calendar}
                  label="DATE"
                  value={formatFullDate(evenement.startsAt)}
                />
                {evenement.location && (
                  <InfoRow icon={MapPin} label="LIEU" value={evenement.location} />
                )}
              </>
            )}
          </View>

          {evenement.detail && (
            <View
              style={[
                styles.detailBox,
                {
                  backgroundColor: colors.primary + '14',
                  borderColor: colors.primary + '44',
                },
              ]}
            >
              <View style={styles.detailHeader}>
                <ScrollText size={14} color={colors.primary} strokeWidth={2.4} />
                <Text style={[styles.detailLabel, { color: colors.primary }]}>
                  DÉTAILS
                </Text>
              </View>
              <Text style={[styles.detailText, { color: colors.text }]}>
                {evenement.detail}
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
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  detailBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  detailText: { fontSize: FontSize.sm, lineHeight: 20 },
});