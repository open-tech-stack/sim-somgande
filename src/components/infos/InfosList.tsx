// src/components/infos/InfosList.tsx
/**
 * Liste des infos — refetch auto au focus + invalidate sur push.
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
import { useInfos } from '@/hooks/useInfos';
import type { Info } from '@/types/info';

import InfoCard from './InfoCard';
import InfoDetailModal from './InfoDetailModal';

export default function InfosList() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const [activeInfo, setActiveInfo] = useState<Info | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useInfos({
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
    return all.filter((i: Info) => {
      const hay = [i.title, i.summary, i.detail ?? ''];
      return hay.some((h) => h.toLowerCase().includes(q));
    });
  }, [all, query]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleOpen = useCallback((i: Info) => {
    setActiveInfo(i);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setActiveInfo(null), 200);
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
            placeholder="Rechercher une information…"
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
            Chargement des informations…
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
            <InfoCard info={item} onPress={handleOpen} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: BottomTabInset + Spacing.xl },
            filtered.length === 0 && { flexGrow: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListEmptyComponent={
            <EmptyState
              image={require('@/assets/images/empty-infos.png')}
              title={query.trim() ? 'Aucun résultat' : 'Aucune information'}
              subtitle={
                query.trim()
                  ? 'Essaie une autre recherche.'
                  : 'Les informations apparaîtront ici.'
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

      <InfoDetailModal
        visible={modalVisible}
        info={activeInfo}
        onClose={closeModal}
      />
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