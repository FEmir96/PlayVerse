// …imports iguales a tu archivo actual…
import React, { useMemo, useState } from 'react';
import {
  RefreshControl, ScrollView, Text, View, useWindowDimensions, Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { spacing, colors } from '../styles/theme';
import { Button, Chip, GameCard } from '../components';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';

const LAPTOP_BREAKPOINT = 1024;
const TWO_COLUMN_BREAKPOINT = 360;
const MIN_CARD_WIDTH = 160;

export default function MyGamesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const columns = width >= LAPTOP_BREAKPOINT ? 3 : width >= TWO_COLUMN_BREAKPOINT ? 2 : 1;
  const horizontalSpace = spacing.xl * 2 + spacing.md * (columns - 1);
  const rawCardWidth = (width - horizontalSpace) / columns;
  const cardWidth = Math.max(MIN_CARD_WIDTH, Math.min(columns === 1 ? 320 : 220, rawCardWidth));

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

  const list = useMemo(
    () => (show === 'rentals' ? rentals.data ?? [] : purchases.data ?? []),
    [show, rentals.data, purchases.data]
  );

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-xl gap-sm">
        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' } as any)}
          className="self-start rounded-pill bg-accent px-md py-[6px] active:scale-95"
        >
          <View className="flex-row items-center gap-[6px]">
            <Ionicons name="arrow-back" size={16} color="#1B1B1B" />
            <Text className="text-[#1B1B1B] text-caption font-bold uppercase tracking-[0.8px]">
              Volver
            </Text>
          </View>
        </Pressable>

        <Text className="text-h1 font-black text-accent">MIS JUEGOS</Text>
        <Text className="text-body text-accent text-center">
          Inicia sesión para ver tus compras y alquileres.
        </Text>
        <Button
          title="Iniciar sesión"
          variant="primary"
          style={{ marginTop: spacing.lg, alignSelf: 'center' }}
          onPress={() => navigation.navigate('Profile' as any)}
        />
      </View>
    );
  }

  const refreshing = rentals.loading || purchases.loading;
  const onRefresh = () => {
    rentals.refetch();
    purchases.refetch();
  };

  const gridJustify = columns === 1 ? 'justify-center' : 'justify-start';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {/* Header lo provee AppNavigator */}
      <View className="gap-sm px-xl pt-xl">
        <Text className="text-h1 font-black text-accent">MIS JUEGOS</Text>
        <Text className="text-body text-accent">Tu arsenal personal de aventuras.</Text>
        <View className="mt-sm flex-row flex-wrap gap-md">
          <Chip label="Mis compras" selected={show === 'purchases'} onPress={() => setShow('purchases')} />
          <Chip label="Mis alquileres" selected={show === 'rentals'} onPress={() => setShow('rentals')} />
        </View>
      </View>

      {list.length === 0 ? (
        <View className="items-center px-xl pt-xl">
          <Text className="text-body text-accent">
            No hay {show === 'rentals' ? 'alquileres' : 'compras'} aún.
          </Text>
        </View>
      ) : (
        <View className={`flex-row flex-wrap gap-md px-xl pt-md ${gridJustify}`}>
          {list.map((row: any, index: number) => {
            const targetId = row.gameId ?? row.game?._id ?? null;
            const initialGame = row.game
              ? { ...row.game, purchasePrice: row.purchasePrice, weeklyPrice: row.weeklyPrice }
              : undefined;
            return (
              <GameCard
                key={String(row._id ?? index)}
                game={{
                  id: String(targetId ?? row._id ?? index),
                  title: row.title || row.game?.title || 'Juego',
                  cover_url: row.cover_url || row.game?.cover_url,
                  purchasePrice: row.purchasePrice,
                  weeklyPrice: row.weeklyPrice,
                  gameId: targetId ? String(targetId) : undefined,
                }}
                tag={show === 'rentals' ? 'Alquiler' : 'Compra'}
                style={{ flexBasis: cardWidth, maxWidth: cardWidth }}
                hideFavorite  // 👈 antes tenías hideFavoriteButton; ahora la prop correcta es esta
                onPress={() => {
                  if (!targetId) return;
                  navigation.navigate('GameDetail', {
                    gameId: String(targetId),
                    initial: initialGame,
                  });
                }}
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
