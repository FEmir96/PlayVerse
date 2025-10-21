import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { Button, Chip, GameCard } from '../components';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';

const { width } = Dimensions.get('window');
const CARD_W = (width - (spacing.xl * 2) - spacing.md) / 2;

export default function MyGamesScreen() {
  const { profile } = useAuth();
  const [show, setShow] = useState<'rentals' | 'purchases'>('rentals');

  const userId = profile?._id;
  const rentals = useConvexQuery<any[]>(
    'queries/getUserRentals:getUserRentals',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 20000 }
  );
  const purchases = useConvexQuery<any[]>(
    'queries/getUserPurchases:getUserPurchases',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 30000 }
  );

  const list = useMemo(() => (show === 'rentals' ? rentals.data ?? [] : purchases.data ?? []), [show, rentals.data, purchases.data]);

  if (!profile) {
    return (
      <View style={styles.center}> 
        <Text style={styles.title}>MIS JUEGOS</Text>
        <Text style={styles.subtitle}>Inicia sesión para ver tus compras y alquileres.</Text>
      </View>
    );
  }

  const refreshing = rentals.loading || purchases.loading;
  const onRefresh = () => { rentals.refetch(); purchases.refetch(); };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>MIS JUEGOS</Text>
        <Text style={styles.subtitle}>Tu arsenal personal de aventuras.</Text>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
          <Chip label="Mis compras" selected={show === 'purchases'} onPress={() => setShow('purchases')} />
          <Chip label="Mis alquileres" selected={show === 'rentals'} onPress={() => setShow('rentals')} />
        </View>
      </View>

      {list.length === 0 ? (
        <View style={styles.center}><Text style={styles.subtitle}>No hay {show === 'rentals' ? 'alquileres' : 'compras'} aún.</Text></View>
      ) : (
        <View style={styles.gridTwo}>
          {list.map((row: any, i: number) => (
            <GameCard key={String(row._id ?? i)} game={{
              id: String(row.gameId ?? row._id ?? i),
              title: row.title || row.game?.title || 'Juego',
              cover_url: row.cover_url || row.game?.cover_url,
              purchasePrice: row.purchasePrice,
              weeklyPrice: row.weeklyPrice,
            }} style={{ width: CARD_W }} tag={show === 'rentals' ? 'Alquiler' : 'Compra'} />
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
