// playverse/playverse-mobile/src/screens/HomeScreen.tsx
import React, { useMemo, useLayoutEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { Button, GameCard, PremiumBanner } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game, UpcomingGame } from '../types/game';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

const heroLogo = require('../../assets/images/playverse-logo.png');

const MIN_CARD_WIDTH = 150;
const GAP = spacing.md;
const PADDING_H = spacing.xl;

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: winW } = useWindowDimensions();
  const [gridW, setGridW] = useState(0);

  useLayoutEffect(() => {
    nav.setOptions({ headerShown: false });
  }, [nav]);

  // Premium (-10%)
  const auth: any = (useAuth?.() as any) ?? {};
  const roleOrPlan = String(
    auth?.user?.role ?? auth?.role ?? auth?.plan ?? auth?.user?.plan ?? auth?.profile?.plan ?? ''
  ).toLowerCase();
  const isPremium =
    roleOrPlan === 'admin' ||
    roleOrPlan === 'premium' ||
    Boolean(auth?.isPremium ?? auth?.user?.isPremium ?? auth?.profile?.isPremium);

  // ===== Notificaciones (badge) =====
  const userId = auth?.user?._id ?? auth?.profile?._id ?? null;
  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    userId ? { userId, limit: 20 } : ({} as any),
    { enabled: !!userId, refreshMs: 20000 }
  );
  const unreadCount = useMemo(
    () => (notifications ?? []).filter((n: any) => n?.isRead === false).length,
    [notifications]
  );

  // Ancho útil para las cards
  const usableW = useMemo(() => {
    const measured = gridW > 0 ? gridW : winW;
    return Math.max(0, measured - PADDING_H * 2);
  }, [gridW, winW]);

  const computedCols = useMemo(() => {
    const maxByWidth = Math.max(1, Math.floor((usableW + GAP) / (MIN_CARD_WIDTH + GAP)));
    return Math.min(4, Math.max(2, maxByWidth));
  }, [usableW]);

  const cardWidth = useMemo(() => {
    const available = usableW - GAP * (computedCols - 1);
    return Math.floor(available / computedCols);
  }, [usableW, computedCols]);

  const onGridLayout = (e: LayoutChangeEvent) => {
    setGridW(e.nativeEvent.layout.width);
  };

  // --------- datos ----------
  const { data: allGames, loading: loadingAll, refetch: refetchAll } = useConvexQuery<Game[]>(
    ['queries/getGames:getGames', 'queries/getAllGames:getAllGames'],
    {},
    { refreshMs: 15000 }
  );
  const { data: upcomingRaw, loading: loadingUpcoming, refetch: refetchUpcoming } =
    useConvexQuery<UpcomingGame[]>(
      [
        'queries/getUpcomingGames:getUpcomingGames',
        'queries/getUpcomingGames',
        'getUpcomingGames',
        'queries/getComingSoon:getComingSoon',
      ],
      { limit: 6 },
      { refreshMs: 30000 }
    );

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

  const wmSize = Math.max(220, Math.min(360, Math.floor(winW * 0.55)));
  const goToCatalog = () => nav.navigate('Tabs' as any, { screen: 'Catalog' } as any);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Header propio */}
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => nav.navigate('Tabs' as any, { screen: 'Home' } as any)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>

        <View style={styles.centerLogoWrap}>
          <Image
            source={require('../../assets/branding/pv-logo-h28.png')}
            style={styles.centerLogo}
            resizeMode="contain"
          />
        </View>

        <Pressable
          onPress={() => nav.navigate(userId ? ('Notifications' as any) : ('Profile' as any))}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Ir a notificaciones"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Marca de agua */}
      <View style={[styles.watermark, { width: wmSize, height: wmSize, left: (winW - wmSize) / 2 }]}>
        <Image source={heroLogo} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </View>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>INICIO</Text>
        <Text style={styles.subtitle}>
          Descubrí qué hay de nuevo en PlayVerse{isPremium ? ' — descuento 10% activo.' : '.'}
        </Text>
      </View>

      {/* Nuevos juegos */}
      <Section title="Nuevos juegos" subtitle="Explorá la colección y encontrá tu próxima aventura.">
        <View style={styles.grid} onLayout={onGridLayout}>
          {newest.map((g: any, i: number) => {
            const game = mapGame(g, i);
            const mr = computedCols > 1 && i % computedCols !== computedCols - 1 ? GAP : 0;
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
                    nav.navigate('GameDetail', { gameId: String(g?._id ?? g?.id ?? g?.gameId), initial: g })
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
        <View style={[styles.grid, styles.topBorder]} onLayout={onGridLayout}>
          {(upcoming ?? []).map((item: any, i: number) => {
            const game = mapGame(item, i);
            const releaseAt =
              item?.releaseAt ?? item?.release_at ?? item?.launchDate ?? item?.firstReleaseDate;
            const releaseLabel = releaseAt
              ? `Próximamente en ${new Date(Number(releaseAt)).getFullYear()}`
              : 'Próximamente';
            const mr = computedCols > 1 && i % computedCols !== computedCols - 1 ? GAP : 0;
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

  headerBar: {
    paddingTop: spacing.xl,
    paddingHorizontal: PADDING_H,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#072633',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#0F2D3A',
  },
  centerLogoWrap: { flex: 1, alignItems: 'center' },
  centerLogo: { height: 28, width: 120 },

  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  header: { paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.xs },
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
