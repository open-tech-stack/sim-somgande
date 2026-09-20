// src/components/prieres/PrieresList.tsx
/**
 * Écran Prières — refetch auto au focus + invalidate sur push.
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
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { usePrieres } from '@/hooks/usePrieres';
import type { Priere } from '@/types/priere';

import PriereCard from './PriereCard';

export default function PrieresList() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = usePrieres({
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
    if (!q) return all;
    return all.filter((p: Priere) => {
      const hay = [p.title, p.detail ?? '', p.location ?? ''];
      return hay.some((h) => h.toLowerCase().includes(q));
    });
  }, [all, query]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
            placeholder="Rechercher une prière…"
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
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.centeredText, { color: colors.textSecondary }]}>
            Chargement des prières…
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
          renderItem={({ item }) => <PriereCard priere={item} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Spacing.xxl },
            filtered.length === 0 && { flexGrow: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListEmptyComponent={
            <EmptyState
              image={require('@/assets/images/empty-prieres.png')}
              title={query.trim() ? 'Aucun résultat' : 'Aucune prière'}
              subtitle={
                query.trim()
                  ? 'Essaie une autre recherche.'
                  : 'Les sujets de prière apparaîtront ici.'
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
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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