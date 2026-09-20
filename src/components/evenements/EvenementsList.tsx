// src/components/evenements/EvenementsList.tsx
/**
 * Liste des événements — refetch auto au focus + invalidate sur push.
 */

import { useFocusEffect } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import EmptyState from '@/components/ui/EmptyState';
import { BottomTabInset, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useEvenements } from '@/hooks/useEvenements';
import type { Evenement, EvenementKind } from '@/types/evenement';
import { EVENEMENT_TYPE_LABEL } from '@/types/evenement';

import EvenementCard from './EvenementCard';
import EvenementDetailModal from './EvenementDetailModal';

type TypeFilter = 'ALL' | EvenementKind;

const TYPE_FILTERS: TypeFilter[] = [
  'ALL',
  'MARIAGE',
  'CAMP',
  'SORTIE',
  'CONFERENCE',
  'FORMATION',
  'ACTION_DE_GRACE',
  'JOURNEE',
  'AUTRE',
];

export default function EvenementsList() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const [activeEvenement, setActiveEvenement] = useState<Evenement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useEvenements({
    period: 'all',
    page: 1,
    pageSize: 50,
  });

  const all = data?.items ?? [];

  // 🔄 Refetch au focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((e: Evenement) => {
      if (typeFilter !== 'ALL' && e.kind !== typeFilter) return false;
      if (!q) return true;
      const hay = [e.title, e.summary, e.location ?? ''];
      return hay.some((h) => h.toLowerCase().includes(q));
    });
  }, [all, query, typeFilter]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleOpen = useCallback((e: Evenement) => {
    setActiveEvenement(e);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setActiveEvenement(null), 200);
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
            placeholder="Rechercher un événement…"
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {TYPE_FILTERS.map((t) => {
            const active = typeFilter === t;
            const label = t === 'ALL' ? 'Tous' : EVENEMENT_TYPE_LABEL[t];
            return (
              <Pressable
                key={t}
                onPress={() => setTypeFilter(t)}
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
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.centeredText, { color: colors.textSecondary }]}>
            Chargement des événements…
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
            <EvenementCard evenement={item} onPress={handleOpen} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: BottomTabInset + Spacing.xl },
            filtered.length === 0 && { flexGrow: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
          ListEmptyComponent={
            <EmptyState
              image={require('@/assets/images/empty-evenements.png')}
              title={
                query.trim() || typeFilter !== 'ALL'
                  ? 'Aucun résultat'
                  : 'Aucun événement'
              }
              subtitle={
                query.trim() || typeFilter !== 'ALL'
                  ? 'Modifie ta recherche ou change de filtre.'
                  : 'Les prochains événements apparaîtront ici.'
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

      <EvenementDetailModal
        visible={modalVisible}
        evenement={activeEvenement}
        onClose={closeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
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
    marginHorizontal: Spacing.lg,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
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