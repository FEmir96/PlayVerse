import React from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { GameCard } from '../components';
import { spacing, colors, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';

const TABLET_BREAKPOINT = 768;
const LAPTOP_BREAKPOINT = 1024;
const TWO_COLUMN_BREAKPOINT = 360;
const MIN_CARD_WIDTH = 160;

export default function FavoritesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const columns = width >= LAPTOP_BREAKPOINT ? 3 : width >= TWO_COLUMN_BREAKPOINT ? 2 : 1;
  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    (width - spacing.xl * 2 - spacing.md * (columns - 1)) / columns
  );

  const userId = profile?._id;
  const { data, loading, refetch } = useConvexQuery<any[]>(
    'queries/listFavoritesByUser:listFavoritesByUser',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 25000 }
  );

  const renderBackButton = () => (
    <Pressable
      onPress={() => nav.navigate('Tabs' as any, { screen: 'Home' } as any)}
      className="self-start rounded-pill bg-accent px-md py-[6px] active:scale-95"
    >
      <View className="flex-row items-center gap-[6px]">
        <Ionicons name="arrow-back" size={16} color="#1B1B1B" />
        <Text className="text-[#1B1B1B] text-caption font-bold uppercase tracking-[0.8px]">Volver</Text>
      </View>
    </Pressable>
  );

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-xl gap-sm">
        {renderBackButton()}
        <Text className="text-h1 font-black text-accent">FAVORITOS</Text>
        <Text className="text-body text-textSecondary text-center">
          Inicia sesión para ver tus juegos favoritos y seguir sus novedades.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />
      }
    >
      <View style={styles.header}>
        {renderBackButton()}
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Tu radar personal de juegos imperdibles.</Text>
      </View>

      {(!data || data.length === 0) ? (
        <View style={styles.center}>
          <Text style={styles.subtitle}>Aún no tienes favoritos.</Text>
        </View>
      ) : (
        <View style={[styles.grid, { justifyContent: columns === 1 ? 'center' : 'flex-start' }]}>
          {(data ?? []).map((row: any, i: number) => (
            <GameCard
              key={String(row._id ?? i)}
              game={{
                id: String(row.game?._id ?? row.gameId ?? i),
                title: row.game?.title || 'Juego',
                cover_url: row.game?.cover_url,
              }}
              style={{ width: cardWidth }}
              tag="Favorito"
              onPress={() => row.game?._id && nav.navigate('GameDetail', { gameId: String(row.game._id) })}
            />
          ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});


