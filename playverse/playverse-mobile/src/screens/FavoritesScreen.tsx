import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { GameCard } from '../components';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const BREAKPOINT = 768;
const MIN_CARD_WIDTH = 240;

export default function FavoritesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const columns = width >= BREAKPOINT ? 2 : 1;
  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    (width - spacing.xl * 2 - spacing.md * (columns - 1)) / columns,
  );

  const userId = profile?._id;
  const { data, loading, refetch } = useConvexQuery<any[]>(
    'queries/listFavoritesByUser:listFavoritesByUser',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 25000 }
  );

  if (!profile) {
    return (
      <View style={styles.center}> 
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Inicia sesion para ver tus favoritos.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Elige tu proxima aventura entre tus titulos favoritos.</Text>
      </View>
      {(!data || data.length === 0) ? (
        <View style={styles.center}><Text style={styles.subtitle}>Aun no tienes favoritos.</Text></View>
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

