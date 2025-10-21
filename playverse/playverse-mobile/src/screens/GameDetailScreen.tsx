import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useConvexQuery } from '../lib/useConvexQuery';
import { colors, spacing, typography, radius } from '../styles/theme';
import { resolveAssetUrl } from '../lib/asset';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - spacing.xl * 2;

export default function GameDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'GameDetail'>>();
  const { gameId } = route.params;
  const { data: game } = useConvexQuery<any>('queries/getGameById:getGameById', { id: gameId }, { refreshMs: 15000 });

  const gallery = useMemo(() => {
    const sources: string[] = [];
    if (game?.cover_url) sources.push(game.cover_url);
    const extraArrays = [
      game?.extraImages,
      game?.extra_images,
      game?.screenshots,
      game?.gallery,
    ].filter(Array.isArray) as string[][];
    extraArrays.forEach(arr => {
      arr.filter(Boolean).forEach((url: string) => {
        if (!sources.includes(url)) sources.push(url);
      });
    });
    return sources.slice(0, 6).map(resolveAssetUrl).filter(Boolean) as string[];
  }, [game]);

  const trailerUrl = resolveAssetUrl(game?.trailer_url || game?.trailerUrl);
  const genres = Array.isArray(game?.genres) ? (game.genres as string[]).join(' - ') : undefined;

  const player = useVideoPlayer(trailerUrl ?? '', {
    shouldPlay: false,
    isLooping: false,
    staysActiveInBackground: false,
  });

  useEffect(() => {
    if (!trailerUrl) player.pauseAsync?.();
  }, [trailerUrl, player]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{game?.title || 'Juego'}</Text>
        {genres ? <Text style={styles.subtitle}>{genres}</Text> : null}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: spacing.xl }}
        contentContainerStyle={{ gap: spacing.md }}
      >
        {gallery.length ? (
          gallery.map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} style={styles.slide} />
          ))
        ) : (
          <View style={[styles.slide, styles.slideFallback]}>
            <Text style={{ color: colors.textSecondary }}>Sin imagenes disponibles</Text>
          </View>
        )}
      </ScrollView>

      {trailerUrl ? (
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
          />
        </View>
      ) : null}

      <View style={styles.card}>
        {typeof game?.purchasePrice === 'number' ? (
          <Text style={styles.price}>Compra - ${game.purchasePrice.toFixed(2)}</Text>
        ) : null}
        {typeof game?.weeklyPrice === 'number' ? (
          <Text style={styles.price}>Alquiler semanal - ${game.weeklyPrice.toFixed(2)}</Text>
        ) : null}
        <Text style={styles.note}>Gestiona compras y suscripciones desde la web PlayVerse.</Text>
      </View>

      {game?.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Descripcion</Text>
          <Text style={styles.body}>{game.description}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  subtitle: {
    color: colors.textSecondary,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: Math.round(SLIDE_WIDTH * 0.56),
    borderRadius: radius.lg,
    resizeMode: 'cover',
  },
  slideFallback: {
    backgroundColor: '#0F2D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: SLIDE_WIDTH,
    height: Math.round(SLIDE_WIDTH * 0.56),
    borderRadius: radius.lg,
    backgroundColor: '#000',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  note: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

