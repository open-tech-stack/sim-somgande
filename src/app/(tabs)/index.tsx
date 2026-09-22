// src/app/(tabs)/index.tsx
/**
 * Écran ACCUEIL — refetch auto au focus + invalidate sur push.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import {
  CalendarDays,
  Info as InfoIcon,
  PartyPopper,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import EvenementDetailModal from '@/components/evenements/EvenementDetailModal';
import EmptyCard from '@/components/home/EmptyCard';
import HomeHeader from '@/components/home/HomeHeader';
import HomeSection from '@/components/home/HomeSection';
import MyProgrammeCard from '@/components/home/MyProgrammeCard';
import NextEvenementCard from '@/components/home/NextEvenementCard';
import NextProgrammeCard from '@/components/home/NextProgrammeCard';
import RecentInfosList from '@/components/home/RecentInfosList';
import InfoDetailModal from '@/components/infos/InfoDetailModal';
import ProgrammeDetailModal from '@/components/programmes/ProgrammeDetailModal';
import SectionDetailModal from '@/components/programmes/SectionDetailModal';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvenements } from '@/hooks/useEvenements';
import { useInfos } from '@/hooks/useInfos';
import { useProgrammes } from '@/hooks/useProgrammes';
import type { Evenement } from '@/types/evenement';
import type { Info } from '@/types/info';
import type { Programme, ProgrammeSection } from '@/types/programme.types';

export default function AccueilScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // ⚠️ pageSize: 20 pour couvrir MyProgrammeCard (qui a besoin de
  //    tous les programmes à venir du mois pour trouver les slots
  //    de l'utilisateur connecté).
  const programmesQuery = useProgrammes({
    period: 'upcoming',
    page: 1,
    pageSize: 20,
  });
  const evenementsQuery = useEvenements({
    period: 'upcoming',
    page: 1,
    pageSize: 5,
  });
  const infosQuery = useInfos({ page: 1, pageSize: 5 });

  // 🔄 Refetch au focus
  useFocusEffect(
    useCallback(() => {
      programmesQuery.refetch();
      evenementsQuery.refetch();
      infosQuery.refetch();
    }, [
      programmesQuery.refetch,
      evenementsQuery.refetch,
      infosQuery.refetch,
    ]),
  );

  const nextProgramme = useMemo<Programme | null>(() => {
    const items = programmesQuery.data?.items ?? [];
    return items.find((p) => p.status === 'A_VENIR') ?? null;
  }, [programmesQuery.data]);

  const nextEvenement = useMemo<Evenement | null>(() => {
    const items = evenementsQuery.data?.items ?? [];
    return items.find((e) => e.status === 'A_VENIR') ?? null;
  }, [evenementsQuery.data]);

  const recentInfos = useMemo<Info[]>(
    () => (infosQuery.data?.items ?? []).slice(0, 5),
    [infosQuery.data],
  );

  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);
  const [programmeModalVisible, setProgrammeModalVisible] = useState(false);
  const [activeEvenement, setActiveEvenement] = useState<Evenement | null>(null);
  const [evenementModalVisible, setEvenementModalVisible] = useState(false);
  const [activeInfo, setActiveInfo] = useState<Info | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<ProgrammeSection | null>(
    null,
  );
  const [sectionModalVisible, setSectionModalVisible] = useState(false);

  const refreshing =
    programmesQuery.isRefetching ||
    evenementsQuery.isRefetching ||
    infosQuery.isRefetching;

  const onRefresh = useCallback(() => {
    programmesQuery.refetch();
    evenementsQuery.refetch();
    infosQuery.refetch();
  }, [programmesQuery, evenementsQuery, infosQuery]);

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />

      
        <MyProgrammeCard
          personId={user?.personId ?? null}
          programmes={programmesQuery.data?.items ?? []}
        />

        <HomeSection
          title="Prochain programme"
          icon={CalendarDays}
          onSeeAll={() => router.push('/(tabs)/programmes')}
        >
          {nextProgramme ? (
            <NextProgrammeCard
              programme={nextProgramme}
              onPress={() => {
                setActiveProgramme(nextProgramme);
                setProgrammeModalVisible(true);
              }}
            />
          ) : (
            <EmptyCard
              icon={CalendarDays}
              text="Aucun programme à venir pour le moment."
            />
          )}
        </HomeSection>

        <HomeSection
          title="Prochain événement"
          icon={PartyPopper}
          onSeeAll={() => router.push('/(tabs)/evenements')}
        >
          {nextEvenement ? (
            <NextEvenementCard
              evenement={nextEvenement}
              onPress={() => {
                setActiveEvenement(nextEvenement);
                setEvenementModalVisible(true);
              }}
            />
          ) : (
            <EmptyCard
              icon={PartyPopper}
              text="Aucun événement à venir pour le moment."
            />
          )}
        </HomeSection>

        <HomeSection
          title="Dernières infos"
          icon={InfoIcon}
          onSeeAll={() => router.push('/(tabs)/infos')}
        >
          {recentInfos.length > 0 ? (
            <RecentInfosList
              infos={recentInfos}
              onPress={(info) => {
                setActiveInfo(info);
                setInfoModalVisible(true);
              }}
            />
          ) : (
            <EmptyCard
              icon={InfoIcon}
              text="Aucune information pour le moment."
            />
          )}
        </HomeSection>
      </ScrollView>

      <ProgrammeDetailModal
        visible={programmeModalVisible}
        programme={activeProgramme}
        onClose={() => {
          setProgrammeModalVisible(false);
          setTimeout(() => setActiveProgramme(null), 200);
        }}
        onSectionPress={(_prog, section) => {
          setActiveSection(section);
          setSectionModalVisible(true);
        }}
      />

      <SectionDetailModal
        visible={sectionModalVisible}
        section={activeSection}
        onClose={() => {
          setSectionModalVisible(false);
          setTimeout(() => setActiveSection(null), 200);
        }}
      />

      <EvenementDetailModal
        visible={evenementModalVisible}
        evenement={activeEvenement}
        onClose={() => {
          setEvenementModalVisible(false);
          setTimeout(() => setActiveEvenement(null), 200);
        }}
      />

      <InfoDetailModal
        visible={infoModalVisible}
        info={activeInfo}
        onClose={() => {
          setInfoModalVisible(false);
          setTimeout(() => setActiveInfo(null), 200);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
});