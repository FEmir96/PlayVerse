// playverse/playverse-mobile/src/screens/FavoritesScreen.tsx
import React, { useMemo, useLayoutEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { Button, GameCard } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const MIN_CARD_WIDTH = 150;
const GAP = spacing.md;
const PADDING_H = spacing.xl;

const ALL_GAMES_NAMES = ['queries/getGames:getGames', 'queries/getAllGames:getAllGames'];

export default function FavoritesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const { profile } = useAuth();
  const { ids, refetch: refetchFavs } = useFavorites();

  useLayoutEffect(() => {
    nav.setOptions({ headerShown: false });
  }, [nav]);

  const maxByWidth = Math.max(
    1,
    Math.min(3, Math.floor((width - PADDING_H * 2 + GAP) / (MIN_CARD_WIDTH + GAP)))
  );
  const columns = width >= 1024 ? Math.min(3, maxByWidth) : Math.min(2, maxByWidth);

  const cardWidth = useMemo(() => {
    const available = width - PADDING_H * 2 - GAP * (columns - 1);
    return Math.floor(available / columns);
  }, [width, columns]);

  const { data: allGames = [], loading, refetch } = useConvexQuery<any[]>(
    ALL_GAMES_NAMES,
    {},
    { refreshMs: 20000 }
  );

  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    profile?._id ? { userId: profile._id, limit: 20 } : ({} as any),
    { enabled: !!profile?._id, refreshMs: 20000 }
  );
  const unreadCount = useMemo(
    () => (!profile ? 0 : (notifications ?? []).filter((n: any) => n?.isRead === false).length),
    [notifications, profile]
  );

  const favGames = useMemo(() => {
    const set = new Set(ids);
    return (allGames ?? []).filter((g: any) => set.has(String(g._id ?? g.id ?? g.gameId)));
  }, [ids, allGames]);

  const onRefresh = () => {
    refetch?.();
    refetchFavs?.();
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
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
          onPress={() => nav.navigate(profile ? ('Notifications' as any) : ('Profile' as any))}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Ir a notificaciones"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          {!!profile && unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Tus juegos marcados con ❤️</Text>
      </View>

      {favGames.length === 0 ? (
        <View style={{ paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.subtitle}>No tenés juegos en favoritos.</Text>
          {!profile ? (
            <Button
              title="Iniciar sesión"
              variant="primary"
              onPress={() => nav.navigate('Tabs' as any, { screen: 'Profile' } as any)}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.grid}>
          {favGames.map((row: any, i: number) => {
            const gid = String(row._id ?? row.id ?? row.gameId ?? i);
            const mr = columns > 1 && i % columns !== columns - 1 ? GAP : 0;

            return (
              <View key={gid} style={{ width: cardWidth, marginRight: mr, marginBottom: GAP }}>
                <GameCard
                  game={{
                    id: gid,
                    title: row.title ?? 'Juego',
                    cover_url: row.cover_url ?? row.coverUrl,
                    purchasePrice: row.purchasePrice,
                    weeklyPrice: row.weeklyPrice,
                    igdbRating: row.igdbRating,
                    plan: row.plan,
                  }}
                  onPress={() => nav.navigate('GameDetail', { gameId: gid, initial: row })}
                />
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  headerBar: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
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
});
