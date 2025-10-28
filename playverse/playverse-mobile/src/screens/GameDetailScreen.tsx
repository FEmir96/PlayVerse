import React, { useEffect, useMemo, useState, useLayoutEffect } from 'react';
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

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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
    } catch {}
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

  // Trailer helpers...
  function normalizeHttps(u: string) {
    if (/^https?:\/\//i.test(u)) return u;
    if (/^\/\//.test(u)) return `https:${u}`;
    return `https://${u}`;
  }
  function isLikelyYouTubeId(s: string) {
    return /^[a-zA-Z0-9_-]{6,}$/.test(s);
  }
  function extractYouTubeId(u: string) {
    if (!u) return undefined;
    const raw = u.startsWith('youtube:') ? u.slice('youtube:'.length) : u;

    if (!/^https?:\/\//i.test(raw) && isLikelyYouTubeId(raw)) return raw;

    const url = new URL(normalizeHttps(raw));
    const host = url.hostname.toLowerCase();
    const path = url.pathname || '';
    const seg = path.split('/').filter(Boolean);
    const qsV = url.searchParams.get('v');
    if (qsV) return qsV.replace(/[^a-zA-Z0-9_-]/g, '');

    if (host.includes('youtu.be')) {
      return (seg[0] || '').replace(/[^a-zA-Z0-9_-]/g, '');
    }
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com') || host.startsWith('m.youtube.')) {
      const mapIdx: Record<string, number> = { embed: 1, shorts: 1, live: 1, v: 1 };
      if (seg.length >= 2 && mapIdx[seg[0]] === 1) {
        return seg[1].replace(/[^a-zA-Z0-9_-]/g, '');
      }
      const uParam = url.searchParams.get('u');
      if (uParam) {
        try {
          const inner = new URL('https://youtube.com' + uParam);
          const innerV = inner.searchParams.get('v');
          if (innerV) return innerV.replace(/[^a-zA-Z0-9_-]/g, '');
        } catch {}
      }
      const last = seg[seg.length - 1];
      if (last && isLikelyYouTubeId(last)) return last;
    }
    return undefined;
  }
  function extractVimeoId(u: string) {
    if (!u) return undefined;
    const raw = u.startsWith('vimeo:') ? u.slice('vimeo:'.length) : u;
    if (!/^https?:\/\//i.test(raw) && /^\d{6,}$/.test(raw)) return raw;
    const url = new URL(normalizeHttps(raw));
    const host = url.hostname.toLowerCase();
    const seg = url.pathname.split('/').filter(Boolean);
    if (host.includes('vimeo.com')) {
      const last = seg[seg.length - 1];
      if (/^\d{6,}$/.test(last || '')) return last!;
    }
    return undefined;
  }

  const trailerRaw =
    (game as any)?.trailer_url ||
    (game as any)?.extraTrailerUrl ||
    (initial as any)?.trailer_url ||
    (initial as any)?.extraTrailerUrl ||
    (game as any)?.trailerUrl ||
    (initial as any)?.trailerUrl;

  const trailerInfo = useMemo(() => {
    const raw = trailerRaw ? resolveAssetUrl(trailerRaw) || trailerRaw : undefined;
    if (!raw) return { kind: 'none' as const };

    try {
      const ytId = extractYouTubeId(raw);
      if (ytId) {
        const src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=0&playsinline=1&modestbranding=1&rel=0&showinfo=0`;
        return { kind: 'web' as const, url: src };
      }
      const vmId = extractVimeoId(raw);
      if (vmId) {
        return { kind: 'web' as const, url: `https://player.vimeo.com/video/${vmId}` };
      }
      const url = new URL(normalizeHttps(raw));
      if (/\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(url.pathname)) {
        return { kind: 'video' as const, url: url.toString() };
      }
      return { kind: 'web' as const, url: url.toString() };
    } catch {
      if (isLikelyYouTubeId(raw)) {
        return { kind: 'web' as const, url: `https://www.youtube-nocookie.com/embed/${raw}` };
      }
      return { kind: 'none' as const };
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

  const { profile } = useAuth();

  // ===== Notificaciones (badge) =====
  const userId = profile?._id ?? null;
  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    userId ? { userId, limit: 20 } : ({} as any),
    { enabled: !!userId, refreshMs: 20000 }
  );
  const unreadCount = useMemo(
    () => (notifications ?? []).filter((n: any) => n?.isRead === false).length,
    [notifications]
  );

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
      {/* Header propio */}
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => navigation.navigate('Tabs' as any, { screen: 'Home' } as any)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
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

        <Pressable
          onPress={() => navigation.navigate(userId ? ('Notifications' as any) : ('Profile' as any))}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Ir a notificaciones"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* HERO */}
      <View style={styles.header}>
        <Text style={styles.title}>{game?.title || 'Juego'}</Text>
        {genres ? <Text style={styles.subtitle}>{genres}</Text> : null}
        <View style={styles.metaRow}>
          {(game as any)?.plan === 'premium' ? (
            <Text style={[styles.metaPill, styles.metaPlan]}>Premium</Text>
          ) : (game as any)?.plan === 'free' ? (
            <Text style={[styles.metaPill]}>Gratis</Text>
          ) : null}
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
      ) : trailerInfo.kind === 'web' ? (
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
          <View style={[styles.embedContainer, { width: slideWidth }]}>
            <WebView
              source={{ uri: trailerInfo.url }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              style={{ flex: 1, backgroundColor: '#000' }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Trailer</Text>
          <Text style={styles.helper}>Este juego no tiene trailer disponible por ahora.</Text>
        </View>
      )}

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
  /* Header propio */
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
  centerLogoWrap: { flex: 1, alignItems: 'center' },
  centerLogo: { height: 28, width: 120 },

  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

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

  // CARD
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

  helper: {
    color: '#98B8C6',
    fontSize: typography.body,
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
