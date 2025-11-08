import React, { useMemo, useState, useEffect } from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  LayoutChangeEvent,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../styles/theme';
import type { Game as GameType } from '../types/game';

let useFavoritesUnsafe: any;
let useAuthUnsafe: any;
try { useFavoritesUnsafe = require('../context/FavoritesContext').useFavorites; } catch {}
try { useAuthUnsafe = require('../context/AuthContext').useAuth; } catch {}

export type GameCardProps = {
  game: GameType & {
    id?: string;
    title?: string;
    description?: string | null;
    cover_url?: string | null;
    gameId?: string;
    purchasePrice?: number | null;
    weeklyPrice?: number | null;
    originalPurchasePrice?: number | null;
    originalWeeklyPrice?: number | null;
    igdbRating?: number | null; // 0–100 o 0–5
    plan?: any;
    isFavorite?: boolean;
  };
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tag?: string;
  overlayLabel?: string;
  showPrices?: boolean;   // default true
  disabled?: boolean;
  compactPrices?: boolean; // reduce price font sizes in tight grids

  onToggleFavorite?: (next: boolean) => void | Promise<void>;
  showFavorite?: boolean; // default true
};

function formatARS(n?: number | null) {
  if (n == null || !isFinite(Number(n))) return undefined;
  try {
    return Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n));
  } catch {
    const num = Number(n);
    const isInt = Number.isInteger(num);
    return `$${isInt ? num.toFixed(0) : num.toFixed(2)}`;
  }
}

function pctOff(original?: number | null, final?: number | null) {
  if (
    original == null || final == null ||
    !isFinite(original) || !isFinite(final) ||
    original <= final
  ) return undefined;
  return Math.round((1 - final / original) * 100);
}

const RADIUS = 16;
const BORDER_W = 2;
const GRADIENT = ['#F2B705', '#fbbf24', '#fb923c'] as const;

export default function GameCard(props: GameCardProps) {
  const { game, style, onPress, tag, overlayLabel, disabled, onToggleFavorite } = props;
  const showPrices = props.showPrices ?? true;
  const compactPrices = props.compactPrices ?? false;
  const showFavorite = props.showFavorite ?? true;

  const nav = useNavigation<any>();

  const id = String(game.id ?? game.gameId ?? '');
  const title = game.title ?? 'Juego';
  const cover = game.cover_url ?? undefined;
  const planRaw = useMemo(() => String((game as any).plan ?? '').toLowerCase(), [game]);
  const planLabel: 'Premium' | 'Free' | undefined =
    planRaw === 'premium' ? 'Premium' : planRaw === 'free' ? 'Free' : undefined;
  const badgeLabel = planLabel ?? (tag || undefined);
  const description: string | undefined = useMemo(() => {
    const raw: any = (game as any).description ?? (game as any).summary;
    if (typeof raw !== 'string') return undefined;
    const s = raw.replace(/\s+/g, ' ').trim();
    return s.length ? s : undefined;
  }, [game]);

  const rating5 = useMemo(() => {
    const r = Number(game.igdbRating);
    if (!isFinite(r)) return undefined;
    return r > 10 ? Math.round((r / 20) * 10) / 10 : Math.round(r * 10) / 10;
  }, [game.igdbRating]);

  const fBuy = game.purchasePrice ?? undefined;
  const fWeek = game.weeklyPrice ?? undefined;
  const oBuy = game.originalPurchasePrice ?? undefined;
  const oWeek = game.originalWeeklyPrice ?? undefined;

  const txtBuy = formatARS(fBuy);
  const txtWeek = formatARS(fWeek);
  const txtBuyOrig = formatARS(oBuy);
  const txtWeekOrig = formatARS(oWeek);

  const offBuy = pctOff(oBuy, fBuy);
  const offWeek = pctOff(oWeek, fWeek);

  const isFree = useMemo(() => {
    // Solo consideramos "Free to Play" cuando:
    // - No hay precios y el plan es 'free', o
    // - Todos los precios presentes son exactamente 0.
    const nBuy = Number(fBuy);
    const nWeek = Number(fWeek);
    const hasBuy = Number.isFinite(nBuy);
    const hasWeek = Number.isFinite(nWeek);
    const hasAny = hasBuy || hasWeek;
    const allPresentZero = hasAny && ((hasBuy ? nBuy === 0 : true) && (hasWeek ? nWeek === 0 : true));
    if (allPresentZero) return true;
    if (!hasAny && planRaw === 'free') return true;
    return false;
  }, [planRaw, fBuy, fWeek]);

  const favCtx = (useFavoritesUnsafe?.() as any) || null;
  const authCtx = (useAuthUnsafe?.() as any) || null;
  const userId = authCtx?.profile?._id;

  const ctxIsFav =
    !!(favCtx?.favoriteIds && favCtx.favoriteIds.has?.(id));

  const [localFav, setLocalFav] = useState<boolean>(!!game.isFavorite);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isFavorite = ctxIsFav || localFav;

  // ✅ Sincronizar localFav cuando cambia el contexto
  useEffect(() => {
    setLocalFav(ctxIsFav);
  }, [ctxIsFav, id]);

  const toggleFavorite = async () => {
    if (!showFavorite) return;

    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    try {
      const next = !isFavorite;

      if (favCtx?.toggleFavorite && id) {
        setLocalFav(next); // optimista
        await favCtx.toggleFavorite(id, {
          _id: id,
          title,
          cover_url: cover ?? null,
          plan: game.plan,
          weeklyPrice: game.weeklyPrice ?? null,
          purchasePrice: game.purchasePrice ?? null,
          igdbRating: game.igdbRating ?? null,
        });
        onToggleFavorite?.(next);
        return;
      }

      setLocalFav(next);
      onToggleFavorite?.(next);
    } catch {
      setLocalFav(prev => !prev);
    }
  };

  const [w, setW] = useState<number>(0);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width));
  const isXS = w > 0 && w < 170;
  const isSM = w >= 170 && w < 205;

  // Título más chico y 1 sola línea
  const titleSize = isXS ? Math.max(12, typography.body - 1) : isSM ? typography.body : Math.max(14, typography.h3 - 4);
  const titleLineHeight = Math.round(titleSize * 1.1);
  // Base sizes
  const basePriceMain = isXS ? typography.body + 1 : isSM ? typography.body + 2 : typography.h3 - 4;
  const basePriceLabel = 10;
  // Compact adjustment for Catalog/Favorites grids (más pequeño fuera del Home)
  const priceMainSize = Math.max(9, basePriceMain - (compactPrices ? 4 : 0));
  const priceLabelSize = Math.max(8, basePriceLabel - (compactPrices ? 2 : 0));

  return (
    <>
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={mstyles.backdrop}>
          <View style={mstyles.modalCard}>
            <View style={mstyles.modalHeader}>
              <View style={mstyles.iconBadge}>
                <Ionicons name="lock-closed" size={22} color="#0F2D3A" />
              </View>
              <Text style={mstyles.modalTitle}>Inicia sesion</Text>
            </View>
            <Text style={mstyles.modalBody}>
              Para guardar tus juegos favoritos primero tenes que ingresar con tu cuenta PlayVerse.
            </Text>

            <View style={mstyles.buttonsRow}>
              <Pressable
                onPress={() => setShowLoginModal(false)}
                style={({ pressed }) => [mstyles.btnGhost, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Cancelar"
              >
                <Text style={mstyles.btnGhostText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowLoginModal(false);
                  nav.navigate('Tabs' as any, { screen: 'Profile' } as any);
                }}
                style={({ pressed }) => [mstyles.btnPrimary, pressed && { transform: [{ scale: 0.98 }] }]}
                accessibilityRole="button"
                accessibilityLabel="Aceptar e ir a iniciar sesion"
              >
                <Text style={mstyles.btnPrimaryText}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.root,
          style,
          pressed && { transform: [{ scale: 0.995 }], opacity: 0.97 },
          disabled && { opacity: 0.85 },
        ]}
        onLayout={onLayout}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.card}>
            {/* Media */}
            <View style={styles.mediaWrap}>
              {cover ? (
                <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
              ) : (
                <View style={[styles.cover, styles.coverFallback]}>
                  <Ionicons name="game-controller" size={36} color="#9ED3E6" />
                </View>
              )}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.mediaOverlay}
              />

              {!!badgeLabel && (
                <View
                  style={[
                    styles.tag,
                    styles.tagSmall,
                    planLabel === 'Premium'
                      ? styles.tagPremium
                      : planLabel === 'Free'
                      ? styles.tagFree
                      : styles.tagDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      planLabel === 'Free' ? styles.tagTextLight : styles.tagTextDark,
                    ]}
                    numberOfLines={1}
                  >
                    {badgeLabel}
                  </Text>
                </View>
              )}

              {typeof rating5 === 'number' ? (
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={12} color="#FFD86B" />
                  <Text style={styles.ratingText}>{rating5.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>

            {/* Body */}
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>

                {showFavorite ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      toggleFavorite();
                    }}
                    hitSlop={8}
                    style={styles.heartBtn}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite ? colors.accent : '#a9c4cf'}
                    />
                  </Pressable>
                ) : null}
              </View>

              {!!overlayLabel && (
                <View style={styles.infoPill}>
                  <Text style={styles.infoPillText}>{overlayLabel}</Text>
                </View>
              )}
              {description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>
              ) : null}

              {showPrices ? (
                isFree ? (
                  <View style={styles.freeWrap}>
                    <Text style={[styles.freeLabel, compactPrices && styles.freeLabelCompact]} numberOfLines={1}>
                      Free to Play
                    </Text>
                  </View>
                ) : (txtWeek || txtBuy) ? (
                  <View style={[styles.priceGrid, compactPrices && { columnGap: 10 }]}>
                    <View style={styles.priceCol}>
                      {txtWeek ? (
                        <>
                          <Text style={[styles.priceLabel, styles.priceLabelRent, { fontSize: priceLabelSize }]} numberOfLines={1} allowFontScaling={false}>
                            Alquiler
                          </Text>
                        {!!offWeek && !!txtWeekOrig ? (
                          <Text style={[styles.priceOriginal, compactPrices && styles.priceOriginalCompact]} numberOfLines={1} allowFontScaling={false}>
                            {txtWeekOrig}/sem
                          </Text>
                        ) : null}
                        <Text style={[styles.priceFinal, styles.priceFinalRent, { fontSize: priceMainSize }]} numberOfLines={1} allowFontScaling={false}>
                          {txtWeek}
                          <Text style={[styles.perUnit, compactPrices && styles.perUnitCompact]}>/sem</Text>
                        </Text>
                        {!!offWeek && (
                          <View style={[styles.offChip, styles.offChipRent]}>
                            <Text style={styles.offChipText}>-{offWeek}%</Text>
                          </View>
                        )}
                      </>
                    ) : null}
                  </View>

                  <View style={[styles.priceCol, styles.priceColRight]}>
                    {txtBuy ? (
                      <>
                        <Text style={[styles.priceLabel, styles.priceLabelBuy, { fontSize: priceLabelSize }]} numberOfLines={1} allowFontScaling={false}>
                          Compra
                        </Text>
                        {!!offBuy && !!txtBuyOrig ? (
                          <Text style={[styles.priceOriginal, compactPrices && styles.priceOriginalCompact]} numberOfLines={1} allowFontScaling={false}>
                            {txtBuyOrig}
                          </Text>
                        ) : null}
                        <Text style={[styles.priceFinal, styles.priceFinalBuy, { fontSize: priceMainSize }]} numberOfLines={1} allowFontScaling={false}>
                          {txtBuy}
                        </Text>
                        {!!offBuy && (
                          <View style={[styles.offChip, styles.offChipBuy]}>
                            <Text style={styles.offChipText}>-{offBuy}%</Text>
                          </View>
                        )}
                      </>
                    ) : null}
                  </View>
                  </View>
                ) : null
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: RADIUS },
  gradientBorder: {
    borderRadius: RADIUS,
    padding: BORDER_W,
  },
  card: {
    backgroundColor: '#0F2D3A',
    borderRadius: RADIUS - 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#143547',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  mediaWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 9 / 13,
    backgroundColor: '#0B2330',
  },
  cover: { width: '100%', height: '100%' },
  coverFallback: { alignItems: 'center', justifyContent: 'center' },
  mediaOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tagSmall: { paddingHorizontal: 8, paddingVertical: 4 },
  tagDefault: { backgroundColor: colors.accent },
  tagPremium: { backgroundColor: colors.accent },
  tagFree: { backgroundColor: '#1f546b', borderWidth: 1, borderColor: '#2a6a83' },
  tagTextDark: { color: '#1B1B1B' },
  tagTextLight: { color: '#d6eef7' },

  ratingPill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ratingText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  body: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  heartBtn: { marginLeft: 'auto', padding: 4 },

  title: {
    color: colors.accent,
    fontWeight: '900',
    letterSpacing: 0.3,
    minWidth: 0,
    flexShrink: 1,
    flex: 1,
  },
  description: {
    color: '#A4C9D3',
    fontSize: 11,
    lineHeight: 14,
  },

  infoPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f2d3a',
    borderWidth: 1,
    borderColor: '#1f546b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  infoPillText: { color: '#d6eef7', fontSize: 12, fontWeight: '700' },

  priceGrid: {
    marginTop: 2,
    flexDirection: 'row',
    columnGap: 12,
  },
  priceCol: { flex: 1, minWidth: 0 },
  priceColRight: { alignItems: 'flex-end' },

  priceLabel: {
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#9ED3E6',
  },
  priceLabelRent: { color: '#7EE8F7' },
  priceLabelBuy: { color: '#FFD86B' },

  priceOriginal: {
    color: '#9bb3be',
    textDecorationLine: 'line-through',
    fontSize: 11,
  },
  priceOriginalCompact: { fontSize: 10 },

  priceFinal: {
    marginTop: 2,
    fontWeight: '900',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    maxWidth: '100%',
  },
  perUnit: { fontSize: 11, fontWeight: '800', color: '#9ED3E6', marginLeft: 4 },
  perUnitCompact: { fontSize: 9 },
  priceFinalRent: { color: '#7EE8F7' },
  priceFinalBuy: {
    color: '#F2B705',
    textShadowColor: 'rgba(242,183,5,0.35)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },

  freeWrap: { marginVertical: 7, alignItems: 'center', justifyContent: 'center' },
  freeLabel: { color: '#00E0D1', fontWeight: '900', letterSpacing: 0.4, fontSize: 16 },
  freeLabelCompact: { fontSize: 14 },

  offChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  offChipRent: { backgroundColor: '#10242d', borderColor: '#1f546b' },
  offChipBuy:  { backgroundColor: '#201a05', borderColor: '#F2B705' },
  offChipText: { color: '#F2B705', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
});




const mstyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 21, 30, 0.78)',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F2D3A',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#173A4C',
    paddingHorizontal: 24,
    paddingVertical: 26,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  modalTitle: {
    color: colors.accent,
    fontSize: typography.h3,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  modalBody: {
    color: '#D6EEF7',
    fontSize: typography.body,
    lineHeight: 20,
    marginBottom: 26,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  btnGhost: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#254F62',
    borderRadius: 14,
    backgroundColor: '#0B2330',
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostText: {
    color: '#9ED3E6',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnPrimary: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  btnPrimaryText: {
    color: '#0F2D3A',
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});


