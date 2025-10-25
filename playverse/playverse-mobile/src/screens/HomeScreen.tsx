// playverse/playverse-mobile/src/screens/HomeScreen.tsx
import React, { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { Button, GameCard, PremiumBanner } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game, UpcomingGame } from '../types/game';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

const heroLogo = require('../../assets/images/playverse-logo.png');

const MIN_CARD_WIDTH = 150;  // asegura 2 col en A33
const GAP = spacing.md;
const PADDING_H = spacing.xl;

const ALL_GAMES_NAMES = ['queries/getGames:getGames', 'queries/getAllGames:getAllGames'];
const UPCOMING_NAMES = [
  'queries/getUpcomingGames:getUpcomingGames',
  'queries/getUpcomingGames',
  'getUpcomingGames',
  'queries/getComingSoon:getComingSoon',
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();

  // Auth tolerante
  const auth: any = (useAuth?.() as any) ?? {};
  const roleOrPlan = String(
    auth?.user?.role ?? auth?.role ?? auth?.plan ?? auth?.user?.plan ?? auth?.profile?.plan ?? ''
  ).toLowerCase();
  const isPremium =
    roleOrPlan === 'admin' ||
    roleOrPlan === 'premium' ||
    Boolean(auth?.isPremium ?? auth?.user?.isPremium ?? auth?.profile?.isPremium);

  // columnas máximas posibles por ancho disponible
  const maxByWidth = Math.max(
    1,
    Math.min(
      3,
      Math.floor((width - PADDING_H * 2 + GAP) / (MIN_CARD_WIDTH + GAP))
    )
  );
  const columns = width >= 1024 ? Math.min(3, maxByWidth) : Math.min(2, maxByWidth);

  const cardWidth = useMemo(() => {
    const available = width - PADDING_H * 2 - GAP * (columns - 1);
    return Math.floor(available / columns);
  }, [width, columns]);

  // datos
  const { data: allGames, loading: loadingAll, refetch: refetchAll } = useConvexQuery<Game[]>(
    ALL_GAMES_NAMES,
    {},
    { refreshMs: 15000 }
  );
  const {
    data: upcomingRaw,
    loading: loadingUpcoming,
    refetch: refetchUpcoming,
  } = useConvexQuery<UpcomingGame[]>(UPCOMING_NAMES, { limit: 6 }, { refreshMs: 30000 });

  const newest = useMemo(() => {
    const list = (allGames ?? []).slice();
    list.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list.slice(0, 6);
  }, [allGames]);

  const upcoming = useMemo(() => {
    if (Array.isArray(upcomingRaw) && upcomingRaw.length) return upcomingRaw;
    const now = Date.now();
    const list = (allGames ?? []).filter((g: any) => {
      const d = Number(g?.releaseAt ?? g?.release_at ?? g?.firstReleaseDate ?? 0);
      return d > now;
    });
    list.sort(
      (a: any, b: any) =>
        Number(a?.releaseAt ?? a?.release_at ?? a?.firstReleaseDate ?? 0) -
        Number(b?.releaseAt ?? b?.release_at ?? b?.firstReleaseDate ?? 0)
    );
    return list.slice(0, 6);
  }, [upcomingRaw, allGames]);

  const discount = (p?: number | null) =>
    p && isFinite(Number(p)) ? Math.round(Number(p) * 0.9) : p ?? undefined;

  const mapGame = (row: any, idx: number) => ({
    id: String(row?._id ?? row?.id ?? row?.gameId ?? idx),
    title: row?.title ?? 'Juego',
    cover_url: row?.cover_url ?? row?.coverUrl,
    gameId: row?._id ? String(row._id) : undefined,
    purchasePrice: isPremium ? discount(row?.purchasePrice) : row?.purchasePrice,
    weeklyPrice: isPremium ? discount(row?.weeklyPrice) : row?.weeklyPrice,
    igdbRating: row?.igdbRating,
    plan: row?.plan,
  });

  const refreshing = !!(loadingAll || loadingUpcoming);
  const onRefresh = () => {
    refetchAll();
    refetchUpcoming();
  };

  const wmSize = Math.max(220, Math.min(360, Math.floor(width * 0.55)));
  const goToCatalog = () => navigation.navigate('Tabs' as any, { screen: 'Catalog' } as any);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F2B705" />}
    >
      {/* Marca de agua */}
      <View style={[styles.watermark, { width: wmSize, height: wmSize, left: (width - wmSize) / 2 }]}>
        <Image source={heroLogo} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>INICIO</Text>
        <Text style={styles.subtitle}>
          Descubrí qué hay de nuevo en PlayVerse{isPremium ? ' — descuento 10% activo.' : '.'}
        </Text>
      </View>

      {/* Nuevos juegos */}
      <Section title="Nuevos juegos" subtitle="Explorá la colección y encontrá tu próxima aventura.">
        <View style={styles.grid}>
          {newest.map((g: any, i: number) => {
            const game = mapGame(g, i);
            const mr = columns > 1 && i % columns !== columns - 1 ? GAP : 0;
            return (
              <View
                key={game.id}
                style={{
                  width: cardWidth,
                  marginRight: mr,
                  marginBottom: GAP,
                }}
              >
                <GameCard
                  game={game as any}
                  tag={isPremium ? '-10%' : i < 2 ? 'Acción' : undefined}
                  onPress={() =>
                    (g?._id || g?.id || g?.gameId) &&
                    navigation.navigate('GameDetail', {
                      gameId: String(g?._id ?? g?.id ?? g?.gameId),
                      initial: g,
                    })
                  }
                />
              </View>
            );
          })}
        </View>
        <View style={styles.center}>
          <Button title="Ver todo" variant="ghost" onPress={goToCatalog} />
        </View>
      </Section>

      {/* Próximamente */}
      <Section title="Próximamente">
        <View style={[styles.grid, styles.topBorder]}>
          {(upcoming ?? []).map((item: any, i: number) => {
            const game = mapGame(item, i);
            const releaseAt =
              item?.releaseAt ?? item?.release_at ?? item?.launchDate ?? item?.firstReleaseDate;
            const releaseLabel = releaseAt
              ? `Próximamente en ${new Date(Number(releaseAt)).getFullYear()}`
              : 'Próximamente';
            const mr = columns > 1 && i % columns !== columns - 1 ? GAP : 0;
            return (
              <View
                key={game.id}
                style={{
                  width: cardWidth,
                  marginRight: mr,
                  marginBottom: GAP,
                }}
              >
                <GameCard game={game as any} disabled overlayLabel={releaseLabel} />
              </View>
            );
          })}
        </View>
      </Section>

      <View style={{ paddingHorizontal: PADDING_H }}>
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
    <View style={{ gap: spacing.xs, paddingHorizontal: PADDING_H, paddingTop: spacing.xl }}>
      <Text style={{ color: colors.accent, fontSize: typography.h2, fontWeight: '900' }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.accent, opacity: 0.9 }}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: PADDING_H,
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  title: { color: colors.accent, fontSize: typography.h1, fontWeight: '900' },
  subtitle: { color: colors.accent, opacity: 0.9 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PADDING_H,
    paddingTop: spacing.md,
    alignItems: 'flex-start',
  },
  topBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1c3b49',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
  },
  center: { alignItems: 'center', paddingTop: spacing.md },

  watermark: {
    position: 'absolute',
    top: spacing.lg,
    opacity: 0.06,
    pointerEvents: 'none',
  },
});
