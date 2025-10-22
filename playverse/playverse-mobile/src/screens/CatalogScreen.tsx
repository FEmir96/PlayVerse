import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing } from '../styles/theme';
import { Button, Chip, GameCard, SearchBar } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game } from '../types/game';
import type { RootStackParamList } from '../navigation/AppNavigator';

const PAGE_SIZE = 6;
const CATEGORIES = ['Todos', 'Accion', 'RPG', 'Carreras'];
const TABLET_BREAKPOINT = 768;
const MIN_CARD_WIDTH = 240;

export default function CatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const columns = width >= TABLET_BREAKPOINT ? 2 : 1;
  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    (width - spacing.xl * 2 - spacing.md * (columns - 1)) / columns
  );

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
      list = list.filter((game) => game.title?.toLowerCase().includes(q));
    }
    if (cat !== 'Todos') {
      list = list.filter((game) =>
        (game.genres || []).some((g) => g?.toLowerCase().includes(cat.toLowerCase()))
      );
    }
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list;
  }, [allGames, search, cat]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const gridJustify = columns === 1 ? 'justify-center' : 'justify-start';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl
          refreshing={!!loading}
          onRefresh={refetch}
          tintColor="#F2B705"
        />
      }
    >
      <View className="gap-sm px-xl pt-xl tablet:px-[80px]">
        <Text className="text-h1 font-black text-accent">CATALOGO DE JUEGOS</Text>
        <Text className="max-w-[560px] text-body text-textSecondary">
          Sumergete en PlayVerse. Encuentra tu proximo juego favorito.
        </Text>
      </View>

      <View className="gap-md px-xl pt-md tablet:px-[80px] tablet:pt-lg">
        <SearchBar
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
        />
        <View className="flex-row flex-wrap gap-sm">
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
        <View className={`flex-row flex-wrap gap-md px-xl pt-md ${gridJustify}`}>
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <View
              key={index}
              className="h-[320px] rounded-lg bg-[#143547] opacity-40"
              style={{ width: cardWidth }}
            />
          ))}
        </View>
      ) : visible.length === 0 ? (
        <View className="px-xl pt-xl tablet:px-[80px]">
          <Text className="text-body text-textSecondary">No se encontraron juegos.</Text>
        </View>
      ) : (
        <View className={`flex-row flex-wrap gap-md px-xl pt-md ${gridJustify}`}>
          {visible.map((game: any, index) => {
            const gameId = game._id ?? game.id ?? game.gameId ?? null;
            return (
              <GameCard
                key={String(gameId ?? index)}
                game={{ ...game, id: String(gameId ?? index) }}
                style={{ width: cardWidth }}
                onPress={() =>
                  gameId &&
                  navigation.navigate('GameDetail', {
                    gameId: String(gameId),
                    initial: game,
                  })
                }
              />
            );
          })}
        </View>
      )}

      {filtered.length > 0 ? (
        <View className="items-center px-xl py-xl tablet:px-[80px]">
          <Button
            title={hasMore ? 'Cargar mas' : 'No hay mas juegos'}
            variant={hasMore ? 'ghost' : 'primary'}
            onPress={() => hasMore && setPage(page + 1)}
            style={{ opacity: hasMore ? 1 : 0.6 }}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
