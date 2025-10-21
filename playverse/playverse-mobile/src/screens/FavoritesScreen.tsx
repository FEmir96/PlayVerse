import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { GameCard } from '../components';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const CARD_W = (width - (spacing.xl * 2) - spacing.md) / 2;

export default function FavoritesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
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
        <Text style={styles.subtitle}>Inicia sesión para ver tus favoritos.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>FAVORITOS</Text>
        <Text style={styles.subtitle}>Elige tu próxima aventura entre tus títulos favoritos.</Text>
      </View>
      {(!data || data.length === 0) ? (
        <View style={styles.center}><Text style={styles.subtitle}>Aún no tienes favoritos.</Text></View>
      ) : (
        <View style={styles.gridTwo}>
          {(data ?? []).map((row: any, i: number) => (
            <GameCard key={String(row._id ?? i)} game={{
              id: String(row.game?._id ?? row.gameId ?? i),
              title: row.game?.title || 'Juego',
              cover_url: row.game?.cover_url,
            }} style={{ width: CARD_W }} tag="Favorito" onPress={() => row.game?._id && nav.navigate('GameDetail', { gameId: String(row.game._id) })} />
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
  gridTwo: {
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
