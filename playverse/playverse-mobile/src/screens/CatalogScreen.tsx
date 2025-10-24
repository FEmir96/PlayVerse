// playverse/playverse-mobile/src/screens/CatalogScreen.tsx
import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { Button, Chip, GameCard, SearchBar } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Game } from '../types/game';

const PAGE_SIZE = 10;
const CATEGORIES = ['Todos', 'Accion', 'RPG', 'Carreras'];

const LAPTOP_BREAKPOINT = 1024;
const TWO_COLUMN_BREAKPOINT = 360;
const MIN_CARD_WIDTH = 160;

const ALL_GAMES_NAMES = [
  'queries/getGames:getGames',
  'queries/getAllGames:getAllGames',
  'queries/getGames',
  'queries/getAllGames',
];

export default function CatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();

  const columns = width >= LAPTOP_BREAKPOINT ? 3 : width >= TWO_COLUMN_BREAKPOINT ? 2 : 1;
  const horizontalSpace = spacing.xl * 2 + spacing.md * (columns - 1);
  const rawCardWidth = (width - horizontalSpace) / columns;
  const cardWidth = Math.max(MIN_CARD_WIDTH, Math.min(columns === 1 ? 320 : 220, rawCardWidth));

  const { data: allGames, loading, refetch } = useConvexQuery<Game[]>(
    ALL_GAMES_NAMES,
    {},
    { refreshMs: 20000 }
  );

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = (allGames ?? []).slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((g) => g.title?.toLowerCase().includes(q));
    }
    if (cat !== 'Todos') {
      list = list.filter((g) => (g.genres || []).some((x) => x?.toLowerCase().includes(cat.toLowerCase())));
    }
    list.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list;
  }, [allGames, search, cat]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const gridJustify = columns === 1 ? 'center' : 'flex-start';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor="#F2B705" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>CATÁLOGO DE JUEGOS</Text>
        <Text style={styles.subtitle}>Sumérgete en PlayVerse. Encontrá tu próximo juego.</Text>
      </View>

      <View style={styles.filters}>
        <SearchBar
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={category === cat}
              onPress={() => {
                setCat(category);
                setPage(1);
              }}
            />
          ))}
        </View>
      </View>

      {loading && visible.length === 0 ? (
        <View style={[styles.grid, { justifyContent: gridJustify }]}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <View key={i} style={[styles.skeleton, { width: cardWidth }]} />
          ))}
        </View>
      ) : visible.length === 0 ? (
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>
          <Text style={styles.subtitle}>No se encontraron juegos.</Text>
        </View>
      ) : (
        <View style={[styles.grid, { justifyContent: gridJustify }]}>
          {visible.map((row: any, i: number) => {
            const gameId = row._id ?? row.id ?? row.gameId ?? null;
            return (
              <GameCard
                key={String(gameId ?? i)}
                game={{
                  id: String(gameId ?? i),
                  title: row.title ?? 'Juego',
                  cover_url: row.cover_url ?? row.coverUrl,
                  gameId: row._id ? String(row._id) : undefined,
                  purchasePrice: row.purchasePrice,
                  weeklyPrice: row.weeklyPrice,
                  igdbRating: row.igdbRating,
                  plan: row.plan,
                  // ❌ NO pasar firstReleaseDate: rompía el tipo de GameCard
                }}
                style={{ flexBasis: cardWidth, maxWidth: cardWidth }}
                onPress={() =>
                  gameId &&
                  navigation.navigate('GameDetail', { gameId: String(gameId), initial: row })
                }
              />
            );
          })}
        </View>
      )}

      {filtered.length > 0 ? (
        <View style={{ alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl }}>
          <Button
            title={hasMore ? 'Cargar más' : 'No hay más juegos'}
            variant={hasMore ? 'ghost' : 'primary'}
            onPress={() => hasMore && setPage(page + 1)}
            style={{ opacity: hasMore ? 1 : 0.6 }}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  subtitle: { color: colors.accent, opacity: 0.9 },
  filters: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  skeleton: {
    height: 320,
    borderRadius: 12,
    backgroundColor: '#143547',
    opacity: 0.4,
  },
});
