import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, radius } from '../styles/theme';
import { GameCard, SearchBar, Chip, Button } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game } from '../types/game';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.xl * 2 - spacing.md) / 2;
const PAGE_SIZE = 6;
const CATEGORIES = ['Todos', 'Accion', 'RPG', 'Carreras'];

export default function CatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: allGames, loading, refetch } = useConvexQuery<Game[]>(
    'queries/getGames:getGames',
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
      list = list.filter(game => game.title.toLowerCase().includes(q));
    }
    if (cat !== 'Todos') {
      list = list.filter(game => (game.genres || []).some(g => g?.toLowerCase().includes(cat.toLowerCase())));
    }
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list;
  }, [allGames, search, cat]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>CATALOGO DE JUEGOS</Text>
        <Text style={styles.subtitle}>Sumergite en el PlayVerse. Encuentra tu proximo juego favorito.</Text>
      </View>

      <View style={styles.controls}>
        <SearchBar value={search} onChangeText={text => { setSearch(text); setPage(1); }} />
        <View style={styles.chipsRow}>
          {CATEGORIES.map(category => (
            <Chip key={category} label={category} selected={category === cat} onPress={() => { setCat(category); setPage(1); }} />
          ))}
        </View>
      </View>

      {loading && visible.length === 0 ? (
        <View style={styles.grid}>
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <View key={index} style={[styles.skeletonCard, { width: CARD_WIDTH }]} />
          ))}
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.subtitle}>No se encontraron juegos.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((game: any, index) => (
            <GameCard
              key={String(game._id ?? game.id ?? index)}
              game={game}
              style={{ width: CARD_WIDTH }}
              onPress={() => navigation.navigate('GameDetail', { gameId: String(game._id ?? game.id) })}
            />
          ))}
        </View>
      )}

      {filtered.length > 0 && (
        <View style={{ alignItems: 'center', padding: spacing.xl }}>
          <Button
            title={hasMore ? 'Cargar mas' : 'No hay mas juegos'}
            variant={hasMore ? 'ghost' : 'primary'}
            onPress={() => hasMore && setPage(page + 1)}
            style={{ opacity: hasMore ? 1 : 0.6 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  controls: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  empty: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  skeletonCard: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#143547',
    opacity: 0.35,
  },
});
