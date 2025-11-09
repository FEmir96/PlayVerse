import React, { useMemo, useState, useLayoutEffect, useRef } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, colors, typography } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, GameCard, SearchBar } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Game } from '../types/game';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;
const CATEGORIES = ['Todos', 'Acción', 'RPG', 'Carreras', 'Shooter', 'Sandbox', 'Estrategia', 'Deportes'];

const MIN_CARD_WIDTH = 150;
const GAP = spacing.md;
const PADDING_H = spacing.xl;

const ALL_GAMES_NAMES = [
  'queries/getGames:getGames',
  'queries/listGamesMinimal:listGamesMinimal',
] as const;

export default function CatalogScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { favoriteIds } = useFavorites();
  const { profile } = useAuth();
  const userId = profile?._id ?? null;

  useLayoutEffect(() => { nav.setOptions({ headerShown: true }); }, [nav]);

  const maxByWidth = Math.max(1, Math.min(3, Math.floor((width - PADDING_H * 2 + GAP) / (MIN_CARD_WIDTH + GAP))));
  const columns = width >= 1024 ? Math.min(3, maxByWidth) : Math.min(2, maxByWidth);

  const cardWidth = useMemo(() => {
    const available = width - PADDING_H * 2 - GAP * (columns - 1);
    return Math.floor(available / columns);
  }, [width, columns]);

  const { data: allGames, loading, refetch } = useConvexQuery<Game[]>(
    ALL_GAMES_NAMES as unknown as string[],
    {},
  );
  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    userId ? { userId, limit: 20 } : ({} as any),
    { enabled: !!userId, refreshMs: 40000 }
  );
  const unreadCount = useMemo(() => {
    if (!userId) return 0;
    return (notifications ?? []).filter((n: any) => n?.isRead === false).length;
  }, [userId, notifications]);

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');
  const [page, setPage] = useState(1);

  // Categorías con scroll + flechas
  const catScrollRef = useRef<ScrollView>(null);
  const [catX, setCatX] = useState(0);
  const [catViewW, setCatViewW] = useState(0);
  const [catShowLeft, setCatShowLeft] = useState(false);
  const [catShowRight, setCatShowRight] = useState(false);
  const updateCatArrows = (x: number, contentW: number, viewW: number) => {
    setCatShowLeft(x > 6);
    setCatShowRight(x < Math.max(0, contentW - viewW - 6));
  };

  const filtered = useMemo(() => {
    let list = (allGames ?? []).slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((g) => g.title?.toLowerCase().includes(q));
    }
    if (cat !== 'Todos') {
      list = list.filter((g) => (g.genres || []).some((x) => x?.toLowerCase().includes(cat.toLowerCase())));
    }
    list.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list;
  }, [allGames, search, cat]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const visible = filtered.slice(start, end);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />}
    >
      <View style={[styles.headerBar, { paddingTop: insets.top + spacing.xl, display: 'none' }]}>
        <View style={{ width: 36, height: 36 }} />
        <View style={styles.centerLogoWrap}>
          <Image source={require('../../assets/branding/pv-logo-h28.png')} style={styles.centerLogo} resizeMode="contain" />
        </View>
        <View style={styles.iconWrap}>
          <Pressable
            onPress={() => nav.navigate(profile ? 'Notifications' as any : 'Profile' as any)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={profile ? 'Ir a notificaciones' : 'Ir a iniciar sesión'}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.accent} />
          </Pressable>
          {userId && unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <LinearGradient
        colors={['#0D2834', '#0F2D3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CATÁLOGO DE JUEGOS</Text>
          <Text style={styles.subtitle}>Sumergite en PlayVerse. Encontrá tu próxima obsesión entre nuestra vasta colección de títulos.</Text>
        </View>

        <View style={styles.filters}>
          <SearchBar value={search} onChangeText={(text) => { setSearch(text); setPage(1); }} />

          <View style={styles.categoriesRow}>
            <View style={styles.catArrowBox}>
              {catShowLeft ? (
                <Pressable
                  onPress={() => {
                    const next = Math.max(0, catX - 200);
                    setCatX(next);
                    catScrollRef.current?.scrollTo({ x: next, animated: true });
                  }}
                  style={styles.catArrowBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Desplazar categorías a la izquierda"
                >
                  <Ionicons name="chevron-back" size={22} color={'#94A3B8'} />
                </Pressable>
              ) : <View style={{ width: 38 }} />}
            </View>

            <ScrollView
              ref={catScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={styles.categoriesContent}
              onLayout={(e) => setCatViewW(Math.round(e.nativeEvent.layout.width))}
              onScroll={({ nativeEvent }) => {
                const x = nativeEvent.contentOffset.x;
                const cw = nativeEvent.contentSize.width;
                const vw = nativeEvent.layoutMeasurement.width;
                setCatX(x);
                updateCatArrows(x, cw, vw);
              }}
              onContentSizeChange={(cw) => updateCatArrows(catX, cw, catViewW)}
              scrollEventThrottle={16}
            >
              {CATEGORIES.map((category) => (
                <View key={category} style={{ marginRight: spacing.md }}>
                  <Chip label={category} selected={category === cat} onPress={() => { setCat(category); setPage(1); }} />
                </View>
              ))}
            </ScrollView>

            <View style={styles.catArrowBox}>
              {catShowRight ? (
                <Pressable
                  onPress={() => {
                    const next = catX + 200;
                    setCatX(next);
                    catScrollRef.current?.scrollTo({ x: next, animated: true });
                  }}
                  style={styles.catArrowBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Desplazar categorías a la derecha"
                >
                  <Ionicons name="chevron-forward" size={22} color={'#94A3B8'} />
                </Pressable>
              ) : <View style={{ width: 38 }} />}
            </View>
          </View>
        </View>
      </LinearGradient>

      {loading && visible.length === 0 ? (
        <View style={styles.grid}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <View key={i} style={[
              styles.skeleton,
              { width: cardWidth, marginRight: i % columns !== columns - 1 ? GAP : 0, marginBottom: GAP },
            ]} />
          ))}
        </View>
      ) : visible.length === 0 ? (
        <View style={{ paddingHorizontal: PADDING_H, paddingTop: spacing.xl }}>
          <Text style={styles.subtitle}>No se encontraron juegos.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {visible.map((row: any, i: number) => {
            const gameId = row._id ?? row.id ?? row.gameId ?? i;
            const isFav = favoriteIds.has(String(gameId));
            const isPremium = String(row?.plan ?? '').toLowerCase() === 'premium';
            return (
              <View
                key={String(gameId)}
                style={{ width: cardWidth, marginRight: i % columns !== columns - 1 ? GAP : 0, marginBottom: GAP, position: 'relative' }}
              >
                <GameCard
                  game={{
                    id: String(gameId),
                    title: row.title ?? 'Juego',
                    cover_url: row.cover_url ?? row.coverUrl,
                    purchasePrice: row.purchasePrice,
                    weeklyPrice: row.weeklyPrice,
                    igdbRating: row.igdbRating,
                    plan: row.plan,
                    isFavorite: isFav,
                  }}
                  onPress={() => gameId && nav.navigate('GameDetail', { gameId: String(gameId), initial: row })}
                  showPrices
                  compactPrices
                />
                {isPremium ? (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="star" size={12} color={'#0F172A'} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {filtered.length > 0 && totalPages > 1 ? (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Página {safePage} de {totalPages} • {filtered.length} juegos
            </Text>
          </View>
          <View style={styles.paginationButtons}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={({ pressed }) => [
                styles.paginationButton,
                safePage === 1 && { opacity: 0.55 },
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Página anterior"
            >
              <Ionicons name="chevron-back" size={22} color={colors.accent} />
            </Pressable>
            {Array.from({ length: totalPages }, (_, n) => n + 1).map((pg) => (
              <Pressable
                key={pg}
                onPress={() => setPage(pg)}
                style={({ pressed }) => [
                  styles.pageButton,
                  pg === safePage && { backgroundColor: colors.accent, borderColor: colors.accent },
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Ir a página ${pg}`}
              >
                <Text
                  style={[
                    styles.pageButtonText,
                    pg === safePage ? { color: '#0F2D3A' } : { color: '#9AB7C3' },
                  ]}
                >
                  {pg}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={({ pressed }) => [
                styles.paginationButton,
                safePage === totalPages && { opacity: 0.55 },
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Página siguiente"
            >
              <Ionicons name="chevron-forward" size={22} color={colors.accent} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  headerBar: {
    paddingTop: spacing.xl, paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#072633',
    borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder,
  },
  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.surfaceBorder, backgroundColor: '#0F2D3A' },
  iconWrap: { position: 'relative' },
  badge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#ff6b6b', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  centerLogoWrap: { flex: 1, alignItems: 'center' },
  centerLogo: { height: 28, width: 120 },

  hero: { paddingBottom: spacing.md },
  header: { paddingHorizontal: PADDING_H, paddingTop: spacing.xl, gap: spacing.xs, alignItems: 'center' },
  title: { color: colors.accent, fontSize: typography.h1, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#D6EEF7', opacity: 0.9, textAlign: 'center' },

  filters: { paddingHorizontal: PADDING_H, paddingTop: spacing.md },
  categoriesRow: { marginTop: spacing.xl, flexDirection: 'row', alignItems: 'center', columnGap: spacing.md },
  categoriesContent: { alignItems: 'center', paddingRight: spacing.lg },
  catArrowBox: { width: 38, alignItems: 'center', justifyContent: 'center' },
  catArrowBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderWidth: 1, borderColor: '#143547' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PADDING_H, paddingTop: spacing.md, alignItems: 'flex-start' },
  skeleton: { height: 320, borderRadius: 12, backgroundColor: '#143547', opacity: 0.35 },

  premiumBadge: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },

  paginationContainer: { paddingHorizontal: PADDING_H, paddingVertical: spacing.xl },
  paginationInfo: { alignItems: 'center', marginBottom: spacing.md },
  paginationText: { color: '#9AB7C3', fontSize: 14, fontWeight: '500' },
  paginationButtons: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  paginationButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.surfaceBorder, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10, backgroundColor: '#0B2330' },
  pageButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.surfaceBorder, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10, backgroundColor: 'transparent' },
  pageButtonText: { fontSize: 18, fontWeight: '800' },
});



