import React, { useLayoutEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { GameCard } from '../components';
import { spacing, colors, typography } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const LAPTOP_BREAKPOINT = 1024;
const TWO_COLUMN_BREAKPOINT = 360;
const MIN_CARD_WIDTH = 160;

export default function FavoritesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { favorites, loading, refetch } = useFavorites();

  // Oculta el header del Stack (usamos header propio sin texto)
  useLayoutEffect(() => {
    nav.setOptions({ headerShown: false });
  }, [nav]);

  const { width } = useWindowDimensions();
  const columns = width >= LAPTOP_BREAKPOINT ? 3 : width >= TWO_COLUMN_BREAKPOINT ? 2 : 1;
  const horizontalSpace = spacing.xl * 2 + spacing.md * (columns - 1);
  const rawCardWidth = (width - horizontalSpace) / columns;
  const cardWidth = Math.max(MIN_CARD_WIDTH, Math.min(columns === 1 ? 320 : 220, rawCardWidth));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={
        <RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />
      }
    >
      {/* Header propio (logo PV centrado, SIN título) */}
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => nav.navigate('Tabs' as any, { screen: 'Home' } as any)}
          style={styles.iconButton}
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

        <Pressable onPress={() => nav.navigate('Notifications')} style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
        </Pressable>
      </View>

      {!profile ? (
        <View style={styles.center}>
          <Text style={styles.title}>Inicia sesión</text>
          <Text style={styles.subtitleCenter}>
            Inicia sesión para ver tus juegos favoritos y seguir sus novedades.
          </Text>
          <Pressable
            onPress={() => nav.navigate('Profile' as any)}
            style={[styles.cta, { marginTop: spacing.md }]}
          >
            <Text style={styles.ctaText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Tu radar personal de juegos imperdibles</Text>
          </View>

          {favorites.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.subtitleCenter}>Aún no tienes favoritos.</Text>
            </View>
          ) : (
            <View
              style={[
                styles.grid,
                { justifyContent: columns === 1 ? 'center' : 'flex-start' },
              ]}
            >
              {favorites.map((row, i) => {
                const gameId = row.game?._id ?? row.gameId;
                return (
                  <GameCard
                    key={String(row._id ?? i)}
                    game={{
                      id: String(gameId ?? row._id ?? i),
                      title: row.game?.title || 'Juego',
                      cover_url: row.game?.cover_url,
                      gameId: gameId ? String(gameId) : undefined,
                    }}
                    style={{ flexBasis: cardWidth, maxWidth: cardWidth }}
                    tag="Favorito"
                    onPress={() => gameId && nav.navigate('GameDetail', { gameId: String(gameId) })}
                  />
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  centerLogoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  centerLogo: {
    height: 28,
    width: 120,
  },
  sectionHead: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.accent,
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  subtitleCenter: {
    color: colors.accent,
    textAlign: 'center',
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    color: '#1B1B1B',
    fontWeight: '800',
  },
});
