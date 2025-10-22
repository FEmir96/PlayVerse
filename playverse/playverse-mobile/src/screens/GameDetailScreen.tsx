import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Linking from 'expo-linking';
import WebView from 'react-native-webview';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useConvexQuery } from '../lib/useConvexQuery';
import { colors, spacing, typography, radius } from '../styles/theme';
import { resolveAssetUrl } from '../lib/asset';
import { convexHttp } from '../lib/convexClient';

export default function GameDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'GameDetail'>>();
  const params = (route.params ?? {}) as Partial<RootStackParamList['GameDetail']>;
  const linkingUrl = Linking.useURL();

  const resolvedGameId = useMemo(() => {
    if (params.gameId) return params.gameId;
    if (!linkingUrl) return undefined;
    try {
      const parsed = new URL(linkingUrl);
      const queryId = parsed.searchParams.get('gameId');
      if (queryId) return queryId;
      const segments = parsed.pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last !== 'GameDetail') {
        return decodeURIComponent(last);
      }
    } catch {
      // Ignoramos fallas de parseo de deep link y seguimos con otros valores.
    }
    return undefined;
  }, [linkingUrl, params.gameId]);

  const initial = params.initial;
  const gameId = resolvedGameId;

  const { width } = useWindowDimensions();
  const slideWidth = Math.max(260, width - spacing.xl * 2);

  const {
    data: remote,
    error,
    loading: loadingRemote,
  } = useConvexQuery<any>(
    'queries/getGameById:getGameById',
    gameId ? { id: gameId } : ({} as any),
    { enabled: !!gameId, refreshMs: 30000 }
  );
  const game = remote ?? initial ?? null;
  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    const raw = String(error.message ?? '');
    if (/ArgumentValidationError/i.test(raw)) {
      return 'No pudimos encontrar este juego en el catalogo. Verifica el enlace.';
    }
    return 'No se pudo cargar la informacion mas reciente.';
  }, [error]);

  const [igdbShots, setIgdbShots] = useState<string[] | null>(null);
  const [loadingShots, setLoadingShots] = useState(false);

  useEffect(() => {
    if (!game?.title) return;
    let cancelled = false;
    async function loadShots(title: string) {
      try {
        setLoadingShots(true);
        const response = await convexHttp.action('actions/getIGDBScreenshots:getIGDBScreenshots', {
          title,
          limit: 8,
          size2x: true,
          minScore: 0.6,
          minScoreFallback: 0.45,
          includeVideo: false,
        } as any);
        if (!cancelled) {
          const urls = Array.isArray((response as any)?.urls) ? (response as any).urls : [];
          setIgdbShots(urls.filter(Boolean));
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[GameDetail] No se pudo cargar screenshots IGDB', err);
          setIgdbShots([]);
        }
      } finally {
        if (!cancelled) setLoadingShots(false);
      }
    }
    loadShots(game.title);
    return () => {
      cancelled = true;
    };
  }, [game?.title]);

  const gallery = useMemo(() => {
    if (!game && !initial) return [];
    const unique = new Set<string>();
    const push = (val?: string | null) => {
      if (val) unique.add(val);
    };
    const target = game ?? initial ?? {};
    push((target as any)?.cover_url);
    const extraCollections = [
      (target as any)?.extraImages,
      (target as any)?.extra_images,
      (target as any)?.screenshots,
      (target as any)?.gallery,
    ].filter(Array.isArray) as string[][];
    extraCollections.forEach(arr => arr.forEach(push));
    (igdbShots ?? []).forEach(push);
    return Array.from(unique)
      .slice(0, 10)
      .map(resolveAssetUrl)
      .filter(Boolean) as string[];
  }, [game, initial, igdbShots]);

  const trailerRaw =
    (game as any)?.trailer_url ||
      (game as any)?.extraTrailerUrl ||
      (initial as any)?.trailer_url ||
      (initial as any)?.extraTrailerUrl ||
      (game as any)?.trailerUrl;

  const trailerInfo = useMemo(() => {
    const raw = trailerRaw ? resolveAssetUrl(trailerRaw) || trailerRaw : undefined;
    if (!raw) return { kind: 'none' as const };
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      if (host.includes('youtube.com')) {
        const videoId = url.searchParams.get('v');
        if (videoId) {
          return {
            kind: 'web' as const,
            url: `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`,
          };
        }
      }
      if (host === 'youtu.be') {
        const videoId = url.pathname.replace('/', '');
        if (videoId) {
          return {
            kind: 'web' as const,
            url: `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`,
          };
        }
      }
      if (host.includes('vimeo.com')) {
        const parts = url.pathname.split('/').filter(Boolean);
        const videoId = parts.pop();
        if (videoId) {
          return { kind: 'web' as const, url: `https://player.vimeo.com/video/${videoId}` };
        }
      }
      return { kind: 'video' as const, url: raw };
    } catch {
      return { kind: 'video' as const, url: raw };
    }
  }, [trailerRaw]);

  const playerSource = useMemo(
    () => (trailerInfo.kind === 'video' ? { uri: trailerInfo.url } : null),
    [trailerInfo]
  );
  const player = useVideoPlayer(playerSource, (instance) => {
    instance.pause();
    instance.staysActiveInBackground = false;
    instance.isLooping = false;
  });

  useEffect(() => {
    if (trailerInfo.kind !== 'video') player.pause();
  }, [player, trailerInfo]);

  const genres = useMemo(() => {
    if (Array.isArray(game?.genres) && game.genres.length) {
      return game.genres.join(' • ');
    }
    return undefined;
  }, [game?.genres]);

  const releaseDate = useMemo(() => {
    const epoch = (game as any)?.firstReleaseDate ?? (initial as any)?.firstReleaseDate;
    if (!epoch) return undefined;
    try {
      return new Date(epoch).toLocaleDateString();
    } catch {
      return undefined;
    }
  }, [game, initial]);

  const igdbScore = typeof (game as any)?.igdbRating === 'number' ? (game as any).igdbRating : undefined;
  const planLabel =
    (game as any)?.plan === 'premium'
      ? 'Premium'
      : (game as any)?.plan === 'free'
      ? 'Gratis'
      : undefined;

  const isLoading = loadingRemote && !game;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{game?.title || 'Juego'}</Text>
        {genres ? <Text style={styles.subtitle}>{genres}</Text> : null}
        <View style={styles.metaRow}>
          {planLabel ? <Text style={[styles.metaPill, styles.metaPlan]}>{planLabel}</Text> : null}
          {releaseDate ? <Text style={styles.metaPill}>Estreno {releaseDate}</Text> : null}
          {typeof igdbScore === 'number' ? (
            <Text style={[styles.metaPill, styles.metaScore]}>IGDB {igdbScore.toFixed(1)}/5</Text>
          ) : null}
        </View>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: spacing.xl }}
        contentContainerStyle={{ gap: spacing.md }}
      >
        {isLoading ? (
          <View style={[styles.slide, styles.slideFallback, { width: slideWidth }]}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : gallery.length ? (
          gallery.map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} style={[styles.slide, { width: slideWidth }]} />
          ))
        ) : (
          <View style={[styles.slide, styles.slideFallback, { width: slideWidth }]}>
            <Text style={{ color: colors.textSecondary }}>
              {loadingShots ? 'Buscando imagenes...' : 'Sin imagenes disponibles'}
            </Text>
          </View>
        )}
      </ScrollView>

      {trailerInfo.kind === 'video' && playerSource ? (
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
          <VideoView
            style={[styles.video, { width: slideWidth }]}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
          />
        </View>
      ) : null}

      {trailerInfo.kind === 'web' ? (
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
          <View style={[styles.embedContainer, { width: slideWidth }]}>
            <WebView
              source={{ uri: trailerInfo.url }}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              style={{ flex: 1, backgroundColor: '#000' }}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        {typeof (game as any)?.purchasePrice === 'number' ? (
          <Text style={styles.price}>Compra - ${(game as any).purchasePrice.toFixed(2)}</Text>
        ) : null}
        {typeof (game as any)?.weeklyPrice === 'number' ? (
          <Text style={styles.price}>Alquiler semanal - ${(game as any).weeklyPrice.toFixed(2)}</Text>
        ) : null}
        <Text style={styles.note}>Gestiona compras y suscripciones desde la web PlayVerse.</Text>
      </View>

      {game?.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Descripcion</Text>
          <Text style={styles.body}>{game.description}</Text>
        </View>
      ) : null}

      {(game as any)?.developers?.length || (game as any)?.publishers?.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Ficha tecnica</Text>
          {(game as any)?.developers?.length ? (
            <Text style={styles.metaLine}>
              Desarrolladora: {(game as any).developers.join(', ')}
            </Text>
          ) : null}
          {(game as any)?.publishers?.length ? (
            <Text style={styles.metaLine}>
              Distribuidora: {(game as any).publishers.join(', ')}
            </Text>
          ) : null}
          {(game as any)?.languages?.length ? (
            <Text style={styles.metaLine}>Idiomas: {(game as any).languages.join(', ')}</Text>
          ) : null}
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaPill: {
    color: colors.textPrimary,
    backgroundColor: '#103447',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: typography.caption,
  },
  metaPlan: {
    backgroundColor: '#f1c40f22',
    color: colors.accent,
  },
  metaScore: {
    backgroundColor: '#fb923c22',
    color: '#fb923c',
  },
  error: {
    color: '#ff7675',
    marginTop: spacing.xs,
  },
  slide: {
    height: 220,
    borderRadius: radius.lg,
    resizeMode: 'cover',
  },
  slideFallback: {
    backgroundColor: '#0F2D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#000',
  },
  embedContainer: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
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
  metaLine: {
    color: colors.textSecondary,
  },
});
