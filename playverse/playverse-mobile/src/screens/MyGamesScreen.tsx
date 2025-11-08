// playverse/playverse-mobile/src/screens/MyGamesScreen.tsx
import React, { useMemo, useState, useCallback, useLayoutEffect } from 'react';
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

import { spacing, colors, typography, radius } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, GameCard } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

const MIN_CARD_WIDTH = 150;
const GAP = spacing.md;
const PADDING_H = spacing.xl;

type TabKey = 'rent' | 'buy';

type LibraryItem = {
  id: string;
  title: string;
  cover_url?: string | null;
  gameId: string;
  owned: boolean;
  expiresAt?: number | null;
  raw: any;
};

function fmtDate(ts?: number | string | null) {
  const n = Number(ts);
  if (!isFinite(n) || n <= 0) return null;
  const d = new Date(n);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export default function MyGamesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const userId = profile?._id ?? null;
  const [tab, setTab] = useState<TabKey>('rent');

  useLayoutEffect(() => {
    nav.setOptions({ headerShown: true });
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

  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    userId ? { userId, limit: 20 } : ({} as any),
    { enabled: !!userId, refreshMs: 20000 }
  );
  const unreadCount = useMemo(() => {
    if (!userId) return 0;
    return (notifications ?? []).filter((n: any) => n?.isRead === false).length;
  }, [userId, notifications]);

  // ===== Convex, filtrado por usuario =====
  const enabled = !!profile?._id;

  const {
    data: purchasesRaw = [],
    loading: loadingPurchases,
    refetch: refetchPurchases,
  } = useConvexQuery<any[]>(
    'queries/getUserPurchases:getUserPurchases',
    enabled ? { userId: profile!._id } : ({} as any),
    { enabled, refreshMs: 20000 }
  );

  const {
    data: rentalsRaw = [],
    loading: loadingRentals,
    refetch: refetchRentals,
  } = useConvexQuery<any[]>(
    'queries/getUserRentals:getUserRentals',
    enabled ? { userId: profile!._id } : ({} as any),
    { enabled, refreshMs: 20000 }
  );

  const loading = loadingPurchases || loadingRentals;
  const onRefresh = useCallback(() => {
    refetchPurchases?.();
    refetchRentals?.();
  }, [refetchPurchases, refetchRentals]);

  const rentals: LibraryItem[] = useMemo(() => {
    return (rentalsRaw ?? [])
      .map((row: any, idx: number): LibraryItem => {
        const id = String(row?._id ?? row?.gameId ?? idx);
        return {
          id,
          title: row?.title ?? row?.game?.title ?? 'Juego',
          cover_url: row?.cover_url ?? row?.game?.cover_url ?? null,
          gameId: String(row?.gameId ?? row?._id ?? id),
          owned: false,
          expiresAt: row?.expiresAt ?? row?.rentedUntil ?? row?.rentalUntil ?? null,
          raw: row,
        };
      })
      .sort((a, b) => Number(a.expiresAt ?? 0) - Number(b.expiresAt ?? 0));
  }, [rentalsRaw]);

  const purchased: LibraryItem[] = useMemo(() => {
    return (purchasesRaw ?? [])
      .map((row: any, idx: number): LibraryItem => {
        const id = String(row?._id ?? row?.gameId ?? idx);
        return {
          id,
          title: row?.title ?? row?.game?.title ?? 'Juego',
          cover_url: row?.cover_url ?? row?.game?.cover_url ?? null,
          gameId: String(row?.gameId ?? row?._id ?? id),
          owned: true,
          expiresAt: null,
          raw: row,
        };
      })
      .sort((a, b) => (a.id > b.id ? -1 : 1));
  }, [purchasesRaw]);

  const visible: LibraryItem[] = tab === 'rent' ? rentals : purchased;

  // Si no hay sesión: CTA login (sin Catálogo)
  if (!profile) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View style={[styles.headerBar, { paddingTop: insets.top + spacing.xl, display: 'none' }]}>
          <View style={{ width: 36, height: 36 }} />

          <View style={styles.centerLogoWrap}>
            <Image
              source={require('../../assets/branding/pv-logo-h28.png')}
              style={styles.centerLogo}
              resizeMode="contain"
            />
          </View>

          <Pressable
            onPress={() => nav.navigate('Tabs' as any, { screen: 'Profile' } as any)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Ir a iniciar sesión"
          >
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.title}>MIS JUEGOS</Text>
          <Text style={styles.subtitle}>Iniciá sesión para ver tus juegos comprados o alquilados.</Text>
          <Button
            title="Iniciar sesión"
            variant="primary"
            onPress={() => nav.navigate('Tabs' as any, { screen: 'Profile' } as any)}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={!!loading} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.xl, display: 'none' }]}>
        <View style={{ width: 36, height: 36 }} />

        <View style={styles.centerLogoWrap}>
          <Image
            source={require('../../assets/branding/pv-logo-h28.png')}
            style={styles.centerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.iconWrap}>
          <Pressable
            onPress={() => nav.navigate('Notifications' as any)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Ir a notificaciones"
          >
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </Pressable>
          {userId && unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>MIS JUEGOS</Text>
        <Text style={styles.subtitle}>Tu biblioteca personal de PlayVerse.</Text>

        <View style={styles.segmentRow}>
          <Button
            title="Alquiler"
            variant={tab === 'rent' ? 'primary' : 'ghost'}
            onPress={() => setTab('rent')}
            style={styles.segmentBtn}
          />
          <Button
            title="Comprados"
            variant={tab === 'buy' ? 'primary' : 'ghost'}
            onPress={() => setTab('buy')}
            style={styles.segmentBtn}
          />
        </View>
      </View>

      {visible.length === 0 ? (
        <View style={{ paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.subtitle}>
            {tab === 'rent' ? 'No tenés juegos en alquiler.' : 'No tenés juegos comprados.'}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((item, i) => {
            const mr = columns > 1 && i % columns !== columns - 1 ? GAP : 0;

            const overlay = item.owned
              ? 'Comprado'
              : fmtDate(item.expiresAt)
              ? `Alquiler • vence ${fmtDate(item.expiresAt)}`
              : undefined;

            return (
              <View key={item.id} style={{ width: cardWidth, marginRight: mr, marginBottom: GAP }}>
                <GameCard
                  game={{
                    id: item.id,
                    title: item.title,
                    cover_url: item.cover_url ?? undefined,
                    purchasePrice: undefined,
                    weeklyPrice: undefined,
                    plan: (item as any)?.raw?.plan ?? (item as any)?.raw?.game?.plan ?? undefined,
                  }}
                  showPrices={false}
                  showFavorite={false}  // 👈 NO mostrar corazón en Mis Juegos
                  overlayLabel={overlay}
                  onPress={() => {
                    const gid = item?.gameId ?? item?.id;
                    gid && nav.navigate('GameDetail', { gameId: String(gid), initial: item.raw ?? item });
                  }}
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
  iconWrap: { position: 'relative' },
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
  centerLogoWrap: { flex: 1, alignItems: 'center' },
  centerLogo: { height: 28, width: 120 },

  header: {
    paddingHorizontal: PADDING_H,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: { color: colors.accent, fontSize: typography.h1, fontWeight: '900' },
  subtitle: { color: colors.accent, opacity: 0.9 },

  segmentRow: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm },
  segmentBtn: { flex: 1 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PADDING_H,
    paddingTop: spacing.md,
    alignItems: 'flex-start',
  },
});
