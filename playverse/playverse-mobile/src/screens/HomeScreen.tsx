import React, { useMemo } from 'react';
import { Image, ImageBackground, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing } from '../styles/theme';
import { Button, GameCard, PremiumBanner } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game, UpcomingGame } from '../types/game';
import type { RootStackParamList } from '../navigation/AppNavigator';

const bgStars = require('../../assets/images/rob2.png');
const heroLogo = require('../../assets/images/playverse-logo.png');

const TABLET_BREAKPOINT = 768;
const LAPTOP_BREAKPOINT = 1024;
const TWO_COLUMN_BREAKPOINT = 360;
const MIN_CARD_WIDTH = 160;

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const columns = width >= LAPTOP_BREAKPOINT ? 3 : width >= TWO_COLUMN_BREAKPOINT ? 2 : 1;
  const heroLogoSize = width >= LAPTOP_BREAKPOINT ? 220 : width >= TABLET_BREAKPOINT ? 180 : 140;
  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    (width - spacing.xl * 2 - spacing.md * (columns - 1)) / columns
  );

  const {
    data: allGames,
    loading: loadingAll,
    refetch: refetchAll,
  } = useConvexQuery<Game[]>('queries/getGames:getGames', {}, { refreshMs: 15000 });

  const {
    data: upcoming,
    loading: loadingUpcoming,
    refetch: refetchUpcoming,
  } = useConvexQuery<UpcomingGame[]>(
    'queries/getUpcomingGames:getUpcomingGames',
    { limit: 6 },
    { refreshMs: 30000 }
  );

  const newest = useMemo(() => {
    const list = (allGames ?? []).slice();
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list.slice(0, 6);
  }, [allGames]);

  const refreshing = !!(loadingAll || loadingUpcoming);
  const onRefresh = () => {
    refetchAll();
    refetchUpcoming();
  };

  const gridJustify = columns === 1 ? 'justify-center' : 'justify-start';
  const goToCatalog = () => navigation.navigate('Tabs' as any, { screen: 'Catalog' } as any);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F2B705"
        />
      }
    >
      <ImageBackground source={bgStars} className="h-[260px] w-full overflow-hidden" resizeMode="cover">
        <View className="absolute inset-0 bg-[#0f2d3a59]" />
        <View className="flex-1 items-center justify-center px-xl py-xl tablet:px-[80px] tablet:py-[48px]">
          <Image source={heroLogo} style={{ width: heroLogoSize, height: heroLogoSize }} resizeMode="contain" />
        </View>
      </ImageBackground>

      <Section title="Nuevos juegos" subtitle="Explora la coleccion. Encuentra tu proxima aventura.">
        <View className={`flex-row flex-wrap gap-md ${gridJustify}`}>
          {newest.map((game: any, index) => {
            const normalized = {
              ...game,
              convexId: game._id,
              id: String(game._id ?? index),
            };
            return (
              <GameCard
                key={normalized.id}
                game={normalized}
                tag={index < 2 ? 'Accion' : undefined}
                style={{ flexBasis: cardWidth, maxWidth: cardWidth }}
                onPress={() =>
                  normalized.convexId &&
                  navigation.navigate('GameDetail', {
                    gameId: String(normalized.convexId),
                    initial: normalized,
                  })
                }
              />
            );
          })}
        </View>
        <View className="items-center pt-md">
          <Button title="Ver todo" variant="ghost" onPress={goToCatalog} />
        </View>
      </Section>

      <Section title="Proximamente">
        <View className={`flex-row flex-wrap gap-md ${gridJustify} border-t border-surfaceBorder/40 pt-xl mt-xl`}>
          {(upcoming ?? []).map((item: any, index) => {
            const normalized = {
              ...item,
              convexId: item.gameId ?? item._id,
              id: String(item.id ?? item.gameId ?? index),
            };
            const releaseAt = normalized.releaseAt ?? normalized.release_at ?? normalized.launchDate;
            const releaseLabel = releaseAt
              ? `Proximamente en ${new Date(releaseAt).getFullYear()}`
              : 'Proximamente';
            return (
              <GameCard
                key={normalized.id}
                game={normalized}
                style={{ flexBasis: cardWidth, maxWidth: cardWidth }}
                disabled
                overlayLabel={releaseLabel}
              />
            );
          })}
        </View>
      </Section>

      <View className="px-xl tablet:px-[80px]">
        <PremiumBanner />
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-sm px-xl pt-xl tablet:px-[80px] tablet:pt-[48px]">
      <Text className="text-h2 font-black text-accent tablet:text-[26px]">{title}</Text>
      {subtitle ? <Text className="text-body text-accent">{subtitle}</Text> : null}
      {children}
    </View>
  );
}



