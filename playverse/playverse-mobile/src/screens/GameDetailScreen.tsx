// playverse/playverse-mobile/src/screens/GameDetailScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Linking from 'expo-linking';
import WebView from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConvexQuery } from '../lib/useConvexQuery';
import { colors, spacing, typography, radius } from '../styles/theme';
import { resolveAssetUrl } from '../lib/asset';
import { convexHttp } from '../lib/convexClient';
import { useAuth } from '../context/AuthContext';

export default function GameDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      if (last && last !== 'GameDetail') return decodeURIComponent(last);
    } catch {
      /* ignore */
    }
    return undefined;
  }, [linkingUrl, params.gameId]);

  const initial = params.initial;
  const gameId = resolvedGameId;

  const { width } = useWindowDimensions();
  const slideWidth = Math.max(260, width - spacing.xl * 2);

  const { data: remote, error, loading: loadingRemote } = useConvexQuery<any>(
    'queries/getGameById:getGameById',
    gameId ? { id: gameId } : ({} as any),
    { enabled: !!gameId, refreshMs: 30000 }
  );

  const game = remote ?? initial ?? null;

  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    const raw = String(error.message ?? '');
    if (/ArgumentValidationError/i.test(raw)) {
      return 'No pudimos encontrar este juego en el catálogo. Verifica el enlace.';
    }
    return 'No se pudo cargar la información más reciente.';
  }, [error]);

  const [igdbShots, setIgdbShots] = useState<string[] | null>(null);
  const [loadingShots, setLoadingShots] = useState(false);

  useEffect(() => {
    if (!game?.title) return;
    let cancelled = false;
    async function loadShots(title: string) {
      try {
        setLoadingShots(true);
        const response = await (convexHttp as any).action(
          'actions/getIGDBScreenshots:getIGDBScreenshots',
          {
            title,
            limit: 8,
            size2x: true,
            minScore: 0.6,
            minScoreFallback: 0.45,
            includeVideo: false,
          } as any
        );
        if (!cancelled) {
          const urls = Array.isArray((response as any)?.urls) ? (response as any).urls : [];
          setIgdbShots(urls.filter(Boolean));
        }
      } catch {
        if (!cancelled) setIgdbShots([]);
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

    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/\//, '')}`;
    const buildYouTubeEmbed = (id: string) =>
      `https://www.youtube-nocookie.com/embed/${id}?controls=1&modestbranding=1&rel=0`;

    try {
      const url = new URL(normalized);
      const host = url.hostname.toLowerCase();
      const segments = url.pathname.split('/').filter(Boolean);

      const cleanId = (value?: string | null) => (value ? value.replace(/[^a-zA-Z0-9_-]/g, '') : undefined);

      const extractYouTubeId = () => {
        if (host === 'youtu.be') return cleanId(segments[0]);
        const queryId = url.searchParams.get('v');
        if (queryId) return cleanId(queryId);
        if (segments.length >= 2 && ['embed', 'shorts', 'live'].includes(segments[0])) {
          return cleanId(segments[1]);
        }
        if (segments.length >= 1) {
          const last = segments[segments.length - 1];
          if (!['watch', 'channel', 'user'].includes(last)) return cleanId(last);
        }
        return undefined;
      };

      if (host.includes('youtube.com') || host.endsWith('.youtube.com') || host === 'youtu.be') {
        const youtubeId = extractYouTubeId();
        if (youtubeId) {
          return { kind: 'web' as const, url: buildYouTubeEmbed(youtubeId) };
        }
      }

      if (host.includes('vimeo.com')) {
        const videoId = segments.pop();
        if (videoId) {
          return { kind: 'web' as const, url: `https://player.vimeo.com/video/${videoId}` };
        }
      }

      return { kind: 'video' as const, url: normalized };
    } catch {
      return { kind: 'video' as const, url: normalized };
    }
  }, [trailerRaw]);

  const playerSource = useMemo(
    () => (trailerInfo.kind === 'video' ? { uri: trailerInfo.url } : null),
    [trailerInfo]
  );

  const player = useVideoPlayer(playerSource, instance => {
    instance.pause();
    instance.staysActiveInBackground = false;
  });

  useEffect(() => {
    if (trailerInfo.kind !== 'video') player.pause();
  }, [player, trailerInfo]);

  const genres = useMemo(() => {
    if (Array.isArray(game?.genres) && game.genres.length) return game.genres.join(' \u2022 ');
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

  const igdbScore =
    typeof (game as any)?.igdbRating === 'number' ? (game as any).igdbRating : undefined;

  const planLabel =
    (game as any)?.plan === 'premium'
      ? 'Premium'
      : (game as any)?.plan === 'free'
      ? 'Gratis'
      : undefined;

  const { profile } = useAuth();
  const isLoading = loadingRemote && !game;

  const basePurchasePrice =
    typeof (game as any)?.purchasePrice === 'number'
      ? Number((game as any).purchasePrice)
      : undefined;
  const baseWeeklyPrice =
    typeof (game as any)?.weeklyPrice === 'number' ? Number((game as any).weeklyPrice) : undefined;

  const role = profile?.role ?? 'free';
  const hasDiscount = role === 'premium' || role === 'admin';
  const discountRate = hasDiscount ? 0.1 : 0;
  const discountPercent = hasDiscount ? Math.round(discountRate * 100) : 0;

  const finalPurchasePrice = useMemo(() => {
    if (typeof basePurchasePrice !== 'number') return undefined;
    const raw = discountRate > 0 ? basePurchasePrice * (1 - discountRate) : basePurchasePrice;
    return Math.round(raw * 100) / 100;
  }, [basePurchasePrice, discountRate]);

  const finalWeeklyPrice = useMemo(() => {
    if (typeof baseWeeklyPrice !== 'number') return undefined;
    const raw = discountRate > 0 ? baseWeeklyPrice * (1 - discountRate) : baseWeeklyPrice;
    return Math.round(raw * 100) / 100;
  }, [baseWeeklyPrice, discountRate]);

  const showPurchaseDiscount = hasDiscount && typeof basePurchasePrice === 'number';
  const showWeeklyDiscount = hasDiscount && typeof baseWeeklyPrice === 'number';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      <Pressable
        onPress={() => navigation.navigate('Tabs', { screen: 'Home' } as any)}
        className="self-start rounded-pill bg-accent px-md py-[6px] active:scale-95 ml-xl mt-xl"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="arrow-back" size={16} color="#1B1B1B" />
          <Text
            style={{
              color: '#1B1B1B',
              fontSize: typography.caption,
              fontWeight: '700',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}
          >
            Volver
          </Text>
        </View>
      </Pressable>

      {/* HERO */}
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

      {/* GALLERY */}
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
            <Text style={{ color: colors.accent }}>
              {loadingShots ? 'Buscando imágenes...' : 'Sin imágenes disponibles'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* TRAILER */}
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

      {/* PRICES */}
      <View style={styles.card}>
        {typeof basePurchasePrice === 'number' && typeof finalPurchasePrice === 'number' ? (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Compra</Text>
            {showPurchaseDiscount ? (
              <>
                <Text style={styles.priceOriginal}>${basePurchasePrice.toFixed(2)}</Text>
                <Text style={styles.priceFinal}>${finalPurchasePrice.toFixed(2)}</Text>
                <Text style={styles.discountPill}>-{discountPercent}%</Text>
              </>
            ) : (
              <Text style={styles.priceFinal}>${finalPurchasePrice.toFixed(2)}</Text>
            )}
          </View>
        ) : null}

        {typeof baseWeeklyPrice === 'number' && typeof finalWeeklyPrice === 'number' ? (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Alquiler semanal</Text>
            {showWeeklyDiscount ? (
              <>
                <Text style={styles.priceOriginal}>${baseWeeklyPrice.toFixed(2)}</Text>
                <Text style={styles.priceFinal}>${finalWeeklyPrice.toFixed(2)}</Text>
                <Text style={styles.discountPill}>-{discountPercent}%</Text>
              </>
            ) : (
              <Text style={styles.priceFinal}>${finalWeeklyPrice.toFixed(2)}</Text>
            )}
          </View>
        ) : null}

        <Text style={styles.note}>Gestiona compras y suscripciones desde la web PlayVerse.</Text>
      </View>

      {/* ABOUT */}
      {game?.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Descripción</Text>
          <Text style={styles.body}>{game.description}</Text>
        </View>
      ) : null}

      {(game as any)?.developers?.length || (game as any)?.publishers?.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Ficha técnica</Text>
          {(game as any)?.developers?.length ? (
            <Text style={styles.metaLine}>Desarrolladora: {(game as any).developers.join(', ')}</Text>
          ) : null}
          {(game as any)?.publishers?.length ? (
            <Text style={styles.metaLine}>Distribuidora: {(game as any).publishers.join(', ')}</Text>
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
  // HERO
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(242,183,5,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: '#A7C4CF',
    fontSize: typography.body,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaPill: {
    color: '#D6EEF7',
    backgroundColor: '#103447',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    fontSize: typography.caption,
    borderWidth: 1,
    borderColor: '#1F546B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaPlan: {
    backgroundColor: '#2f2a0a',
    borderColor: '#F2B705',
    color: '#F2B705',
  },
  metaScore: {
    backgroundColor: '#3b200a',
    borderColor: '#fb923c',
    color: '#fb923c',
  },
  error: {
    color: '#ff7675',
    marginTop: spacing.xs,
  },

  // GALLERY
  slide: {
    height: 220,
    borderRadius: radius.lg,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#1b4050',
    backgroundColor: '#0F2D3A',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 10,
  },
  slideFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // VIDEO
  video: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#1b4050',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 10,
  },
  embedContainer: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#1b4050',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 10,
  },

  // CARD (glass / glow)
  card: {
    backgroundColor: 'rgba(16, 36, 52, 0.65)',
    borderColor: '#1C4252',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.xs,
    shadowColor: '#0ff',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
  },

  // PRICES
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceLabel: {
    color: '#C7E1EA',
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '800',
    backgroundColor: '#103447',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#1F546B',
  },
  priceOriginal: {
    color: '#8FA9B4',
    textDecorationLine: 'line-through',
    fontSize: typography.body,
  },
  priceFinal: {
    color: '#F2B705',
    fontSize: typography.h3,
    fontWeight: '900',
    textShadowColor: 'rgba(242,183,5,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  discountPill: {
    backgroundColor: '#201a05',
    color: '#F2B705',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    borderWidth: 1,
    borderColor: '#F2B705',
  },
  note: {
    color: '#98B8C6',
    marginTop: spacing.xs,
  },

  // BODY / FACTS
  sectionLabel: {
    color: '#D6EEF7',
    fontWeight: '800',
    marginBottom: spacing.xs,
    fontSize: typography.h3,
    textShadowColor: 'rgba(214,238,247,0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  body: {
    color: '#CDE4ED',
    lineHeight: 20,
    fontSize: typography.body,
  },
  metaLine: {
    color: '#A7C4CF',
  },
});
