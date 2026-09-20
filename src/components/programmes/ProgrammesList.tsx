// src/components/programmes/ProgrammesList.tsx
/**
 * Liste des programmes — refetch auto au focus + invalidate sur push.
 */

import { useFocusEffect } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import EmptyState from '@/components/ui/EmptyState';
import { BottomTabInset, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useProgrammes } from '@/hooks/useProgrammes';

import ProgrammeCard from './ProgrammeCard';
import SectionDetailModal from './SectionDetailModal';
import {
  Programme,
  ProgrammeSection,
  ProgrammeStatus,
} from '@/types/programme.types';

type StatusFilter = Extract<
  ProgrammeStatus,
  'A_VENIR' | 'EN_COURS' | 'TERMINE'
>;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'A_VENIR', label: 'À venir' },
  { key: 'EN_COURS', label: 'En cours' },
  { key: 'TERMINE', label: 'Terminés' },
];

export default function ProgrammesList() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('A_VENIR');

  const [activeSection, setActiveSection] = useState<ProgrammeSection | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useProgrammes({
    period: 'all',
    page: 1,
    pageSize: 50,
  });

  const all = data?.items ?? [];

  // 🔄 Refetch automatique quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p: Programme) => {
      if (p.status !== status) return false;
      if (!q) return true;

      const hay: string[] = [p.title, p.summary, p.location ?? ''];
      p.sections.forEach((s) => {
        s.persons.forEach((person) => hay.push(person.fullName));
        if (s.group) hay.push(s.group.name);
      });
      return hay.some((h) => h.toLowerCase().includes(q));
    });
  }, [all, query, status]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSectionPress = useCallback(
    (_programme: Programme, section: ProgrammeSection) => {
      setActiveSection(section);
      setModalVisible(true);
    },
    [],
  );

  const closeSectionModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setActiveSection(null), 200);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={18} color={colors.textMuted} strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un programme, une personne…"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} strokeWidth={2.4} />
            </Pressable>
          )}
        </View>

        <View style={styles.filtersRow}>
          {FILTERS.map((f) => {
            const active = status === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setStatus(f.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.centeredText, { color: colors.textSecondary }]}>
            Chargement des programmes…
          </Text>
        </View>
      ) : isError ? (
        <EmptyState
          image={require('@/assets/images/empty-search.png')}
          title="Connexion impossible"
          subtitle="Vérifie ta connexion puis tire vers le bas pour réessayer."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProgrammeCard programme={item} onSectionPress={handleSectionPress} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: BottomTabInset + Spacing.xl },
            filtered.length === 0 && { flexGrow: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          ListEmptyComponent={
            <EmptyState
              image={require('@/assets/images/empty-programmes.png')}
              title={
                query.trim() || status !== 'A_VENIR'
                  ? 'Aucun résultat'
                  : 'Aucun programme'
              }
              subtitle={
                query.trim() || status !== 'A_VENIR'
                  ? 'Modifie ta recherche ou change de filtre.'
                  : 'Les prochains programmes apparaîtront ici.'
              }
            />
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
        />
      )}

      <SectionDetailModal
        visible={modalVisible}
        section={activeSection}
        onClose={closeSectionModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },
  filtersRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  filterText: { fontSize: FontSize.sm, fontWeight: '700' },
  listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  centeredText: { fontSize: FontSize.sm, textAlign: 'center' },
});