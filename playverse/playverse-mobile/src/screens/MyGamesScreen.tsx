// playverse/playverse-mobile/src/screens/MyGamesScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { Button, GameCard } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Game } from '../types/game';

// ✅ Evitamos logs de funciones inexistentes en Convex
const SAFE_NAMES = ['queries/getGames:getGames', 'queries/getAllGames:getAllGames'];

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

export default function MyGamesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>('rent');

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

  const { data: allGames, loading, refetch } = useConvexQuery<Game[]>(
    SAFE_NAMES,
    {},
    { refreshMs: 20000 }
  );

  // Normalizamos “biblioteca” sin tocar backend:
  const normalized = useMemo(() => {
    const source = (allGames ?? []) as any[];
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
        gameId: row?._id ? String(row._id) : undefined,
        owned,
        expiresAt,
        raw: row,
      };
    });
  }, [allGames]);

  // Particionamos: alquiler vs comprados
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

  // Fallback: si no hay datos claros, mostramos algo igual
  const emptyBoth = rentals.length === 0 && purchased.length === 0;
  const visible = emptyBoth ? normalized.slice(0, 6) : tab === 'rent' ? rentals : purchased;

  const goToCatalog = () =>
    navigation.navigate('Tabs' as any, { screen: 'Catalog' } as any);

  const onPressCard = (g: any) => {
    const gid = g?.gameId ?? g?.id;
    if (!gid) return;
    navigation.navigate('GameDetail', { gameId: String(gid), initial: g.raw ?? g });
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor="#F2B705" />
      }
    >
      {/* Encabezado */}
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
          <Button
            title="Catálogo"
            variant="ghost"
            onPress={goToCatalog}
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

      {/* Grid */}
      {visible.length === 0 ? (
        <View style={{ paddingHorizontal: PADDING_H, paddingTop: spacing.xl }}>
          <Text style={styles.subtitle}>
            {tab === 'rent'
              ? 'No tenés juegos en alquiler.'
              : 'No tenés juegos comprados.'}
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
                    cover_url: item.cover_url,
                    // ⬇️ Importante: NO pasar null; dejar undefined para respetar el tipo
                    purchasePrice: undefined,
                    weeklyPrice: undefined,
                  }}
                  showPrices={false}
                  overlayLabel={overlay}
                  onPress={() => onPressCard(item)}
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
  header: {
    paddingHorizontal: PADDING_H,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: { color: colors.accent, fontSize: typography.h1, fontWeight: '900' },
  subtitle: { color: colors.accent, opacity: 0.9 },

  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PADDING_H,
    paddingTop: spacing.md,
    alignItems: 'flex-start',
  },
});
