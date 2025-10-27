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

import { spacing, colors, typography } from '../styles/theme';
import { Button, GameCard } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Game } from '../types/game';
import { useAuth } from '../context/AuthContext';

const MIN_CARD_WIDTH = 150;
const GAP = spacing.md;
const PADDING_H = spacing.xl;

function fmtDate(ts?: number | string | null) {
  const n = Number(ts);
  if (!isFinite(n) || n <= 0) return null;
  const d = new Date(n);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

type TabKey = 'rent' | 'buy';

// Queries tolerantes (biblioteca del usuario en Convex)
const MY_LIBRARY_NAMES = [
  'queries/myLibrary:listMine',
  'queries/library:listMine',
  'queries/myGames:listMine',
  'queries/myGames:get',
  'queries/purchases:listForMe',
  'queries/rentals:listForMe',
];

export default function MyGamesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const { profile } = useAuth();
  const [tab, setTab] = useState<TabKey>('rent');

  // ⚠️ Ocultamos header del stack -> usamos header propio
  useLayoutEffect(() => {
    nav.setOptions({ headerShown: false });
  }, [nav]);

  // columnas responsivas sin huecos laterales
  const maxByWidth = Math.max(
    1,
    Math.min(3, Math.floor((width - PADDING_H * 2 + GAP) / (MIN_CARD_WIDTH + GAP)))
  );
  const columns = width >= 1024 ? Math.min(3, maxByWidth) : Math.min(2, maxByWidth);

  const cardWidth = useMemo(() => {
    const available = width - PADDING_H * 2 - GAP * (columns - 1);
    return Math.floor(available / columns);
  }, [width, columns]);

  // Sólo consultamos Convex si hay sesión
  const { data: libRaw, loading, refetch } = useConvexQuery<Game[]>(
    MY_LIBRARY_NAMES,
    {},
    { refreshMs: 20000, enabled: !!profile }
  );

  // Normalizamos la librería
  const normalized = useMemo(() => {
    const source = (Array.isArray(libRaw) ? libRaw : []) as any[];
    return source.map((row, idx) => {
      const id = row?._id ?? row?.id ?? row?.gameId ?? idx;

      const owned =
        Boolean(row?.owned ?? row?.isOwned ?? row?.purchased ?? row?.purchaseDate) ||
        (row?.weeklyPrice == null && row?.purchasePrice != null);

      const expiresAt =
        row?.expiresAt ?? row?.rentalEnd ?? row?.rentedUntil ?? row?.rentalUntil ?? null;

      return {
        id: String(id),
        title: row?.title ?? 'Juego',
        cover_url: row?.cover_url ?? row?.coverUrl,
        gameId: row?._id ? String(row._id) : String(row?.gameId ?? id),
        owned,
        expiresAt,
        raw: row,
      };
    });
  }, [libRaw]);

  const rentals = useMemo(
    () =>
      normalized
        .filter(x => !x.owned && x.expiresAt)
        .sort((a, b) => Number(a.expiresAt ?? 0) - Number(b.expiresAt ?? 0)),
    [normalized]
  );
  const purchased = useMemo(
    () => normalized.filter(x => x.owned).sort((a, b) => Number(b.id) - Number(a.id)),
    [normalized]
  );

  const visible = tab === 'rent' ? rentals : purchased;

  const goToCatalog = () => nav.navigate('Tabs' as any, { screen: 'Catalog' } as any);

  const onPressCard = (g: any) => {
    const gid = g?.gameId ?? g?.id;
    if (!gid) return;
    nav.navigate('GameDetail', { gameId: String(gid), initial: g.raw ?? g });
  };

  const onRefresh = useCallback(() => refetch?.(), [refetch]);

  // 🔐 Si NO hay perfil, CTA login (sin listar nada)
  if (!profile) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Header propio (logo PV centrado, SIN título) */}
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
            onPress={() => nav.navigate('Notifications' as any)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Ir a notificaciones"
          >
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.title}>MIS JUEGOS</Text>
          <Text style={styles.subtitle}>Iniciá sesión para ver tus juegos comprados o alquilados.</Text>
          <Button title="Iniciar sesión" variant="primary" onPress={() => nav.navigate('Login' as any)} />
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
      {/* Header propio (logo PV centrado, SIN título) */}
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
          onPress={() => nav.navigate('Notifications' as any)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Ir a notificaciones"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
        </Pressable>
      </View>

      {/* Encabezado de sección */}
      <View style={styles.header}>
        <Text style={styles.title}>MIS JUEGOS</Text>
        <Text style={styles.subtitle}>Tu biblioteca personal de PlayVerse.</Text>

        {/* Segmented: Alquiler — Catálogo — Comprados */}
        <View style={styles.segmentRow}>
          <Button
            title="Alquiler"
            variant={tab === 'rent' ? 'primary' : 'ghost'}
            onPress={() => setTab('rent')}
            style={styles.segmentBtn}
          />
          <Button title="Catálogo" variant="ghost" onPress={goToCatalog} style={styles.segmentBtn} />
          <Button
            title="Comprados"
            variant={tab === 'buy' ? 'primary' : 'ghost'}
            onPress={() => setTab('buy')}
            style={styles.segmentBtn}
          />
        </View>
      </View>

      {/* Grid */}
      {visible.length === 0 ? (
        <View style={{ paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.sm }}>
          <Text style={styles.subtitle}>
            {tab === 'rent' ? 'No tenés juegos en alquiler.' : 'No tenés juegos comprados.'}
          </Text>
          <Button title="Ir al catálogo" variant="ghost" onPress={goToCatalog} />
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
                    cover_url: item.cover_url,
                    purchasePrice: undefined,
                    weeklyPrice: undefined,
                  }}
                  showPrices={false}
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

  /* ===== Header propio (igual a Favoritos/Login) ===== */
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

  /* ===== Sección ===== */
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
