// playverse/playverse-mobile/src/screens/FavoritesScreen.tsx
import React, { useMemo, useLayoutEffect } from 'react';
import {
  ScrollView, StyleSheet, Text, View, Pressable, Image, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, GameCard } from '../components';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';

const PADDING_H = spacing.xl;
const GAP = spacing.md;
const MIN_CARD_WIDTH = 150;

function mapPlan(p?: string): 'free' | 'premium' | undefined {
  if (!p) return undefined;
  const s = String(p).toLowerCase();
  if (s === 'free' || s === 'premium') return s as 'free' | 'premium';
  return undefined;
}

export default function FavoritesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { favorites, favoriteIds } = useFavorites(); // sin loading/refresh para evitar spinner constante
  const { profile } = useAuth();
  const userId = profile?._id ? String(profile._id) : undefined;
  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    userId ? { userId, limit: 20 } : ({} as any),
    { enabled: !!userId, refreshMs: 20000 }
  );

  const unreadCount = useMemo(() => {
    if (!userId) return 0;
    return (notifications ?? []).filter((n: any) => n?.isRead === false).length;
  }, [userId, notifications]);
  useLayoutEffect(() => { nav.setOptions({ headerShown: true }); }, [nav]);

  const columns = useMemo(() => {
    const maxByWidth = Math.max(1, Math.min(3, Math.floor((width - PADDING_H * 2 + GAP) / (MIN_CARD_WIDTH + GAP))));
    return width >= 1024 ? Math.min(3, maxByWidth) : Math.min(2, maxByWidth);
  }, [width]);

  const cardWidth = useMemo(() => {
    const available = width - PADDING_H * 2 - GAP * (columns - 1);
    return Math.floor(available / columns);
  }, [width, columns]);

  if (!profile) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={[styles.headerBar, { paddingTop: insets.top + spacing.xl, display: 'none' }]}>
          <View style={{ width: 36, height: 36 }} />

          <View style={styles.centerLogoWrap}>
            <Image source={require('../../assets/branding/pv-logo-h28.png')} style={styles.centerLogo} resizeMode="contain" />
          </View>

          <Pressable onPress={() => nav.navigate('Tabs' as any, { screen: 'Profile' } as any)} style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={18} color={colors.accent} />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.title}>FAVORITOS</Text>
          <Text style={styles.subtitle}>Iniciá sesión para ver tus favoritos.</Text>
          <Button title="Iniciar sesión" onPress={() => nav.navigate('Tabs' as any, { screen: 'Profile' } as any)} />
        </View>
      </ScrollView>
    );
  }

  // La lista ya viene deduplicada desde el Context. Aseguramos claves únicas.
  const rows = favorites.map((row, i) => {
    const gid = String(row?.gameId ?? row?.game?._id ?? i);
    return { ...row, __gid: gid, __key: `${gid}-${row._id ?? i}` };
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={[styles.headerBar, { paddingTop: insets.top + spacing.xl, display: 'none' }]}>
          <View style={{ width: 36, height: 36 }} />

        <View style={styles.centerLogoWrap}>
          <Image source={require('../../assets/branding/pv-logo-h28.png')} style={styles.centerLogo} resizeMode="contain" />
        </View>

        <Pressable
          onPress={() => nav.navigate(userId ? ('Notifications' as any) : ('Profile' as any))}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Ir a notificaciones"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          {userId && unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Tus juegos marcados como favoritos.</Text>
      </View>

      {rows.length === 0 ? (
        <View style={{ paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.subtitle}>Todavía no marcaste favoritos.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {rows.map((row: any, i: number) => {
            const gid = row.__gid as string;
            const isFav = favoriteIds.has(gid);
            const g = row?.game ?? {};
            return (
              <View
                key={row.__key}
                style={{
                  width: cardWidth,
                  marginRight: i % columns !== columns - 1 ? GAP : 0,
                  marginBottom: GAP,
                }}
              >
                <GameCard
                  game={{
                    id: gid,
                    title: g.title ?? 'Juego',
                    cover_url: g.cover_url ?? undefined,
                    purchasePrice: g.purchasePrice ?? undefined,
                    weeklyPrice: g.weeklyPrice ?? undefined,
                    igdbRating: g.igdbRating ?? undefined,
                    plan: mapPlan(g.plan),
                    isFavorite: isFav,
                  }}
                  showPrices
                  onPress={() => gid && nav.navigate('GameDetail', { gameId: gid, initial: g })}
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
    paddingTop: spacing.xl, paddingHorizontal: PADDING_H, paddingBottom: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#072633',
    borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder,
  },
  iconButton: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.surfaceBorder, backgroundColor: '#0F2D3A',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  centerLogoWrap: { flex: 1, alignItems: 'center' },
  centerLogo: { height: 28, width: 120 },

  header: { paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm },
  title: { color: colors.accent, fontSize: typography.h1, fontWeight: '900' },
  subtitle: { color: colors.accent, opacity: 0.9 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: PADDING_H, paddingTop: spacing.md, alignItems: 'flex-start',
  },
});

