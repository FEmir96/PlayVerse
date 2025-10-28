// playverse/playverse-mobile/src/components/GameCard.tsx
import React, { useMemo, useState } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../styles/theme';
import type { Game as GameType } from '../types/game';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

// 👉 Export para arreglar imports en screens
export type GameBasic = {
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

export type GameCardProps = {
  game: GameType & GameBasic;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tag?: string;
  overlayLabel?: string;
  showPrices?: boolean;   // default true
  disabled?: boolean;
  onToggleFavorite?: (next: boolean) => void | Promise<void>;
  showFavorite?: boolean; // default true
};

function formatARS(n?: number | null) {
  if (n == null || !isFinite(Number(n))) return undefined;
  try {
    return Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return `$${Math.round(Number(n))}`;
  }
}

function pctOff(original?: number | null, final?: number | null) {
  if (original == null || final == null || !isFinite(original) || !isFinite(final) || original <= final) return undefined;
  return Math.round((1 - final / original) * 100);
}

const RADIUS = 16;
const BORDER_W = 2;
const GRADIENT = ['#F2B705', '#fbbf24', '#fb923c'] as const;

export default function GameCard(props: GameCardProps) {
  const { game, style, onPress, tag, overlayLabel, disabled, onToggleFavorite } = props;
  const showPrices = props.showPrices ?? true;
  const showFavorite = props.showFavorite ?? true;

  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const { profile } = useAuth();
  const favCtx = useFavorites();

  const id = String(game.id ?? game.gameId ?? '');
  const title = game.title ?? 'Juego';
  const cover = game.cover_url ?? undefined;

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

  // estado local solo para animación/optimismo instantáneo si el contexto se demora
  const ctxIsFav = favCtx?.isFavorite?.(id) || false;
  const [localFav, setLocalFav] = useState<boolean>(!!game.isFavorite);
  const isFavorite = ctxIsFav || localFav;

  // Modal de login requerido
  const [askLogin, setAskLogin] = useState(false);

  const toggleFavorite = async () => {
    if (!showFavorite) return;
    if (!profile?._id) {
      setAskLogin(true);
      return;
    }
    try {
      const next = !isFavorite;
      setLocalFav(next);
      await favCtx?.toggle?.(id);
      onToggleFavorite?.(next);
    } catch {
      setLocalFav((prev) => !prev);
    }
  };

  const [w, setW] = useState<number>(0);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width));
  const isXS = w > 0 && w < 170;
  const isSM = w >= 170 && w < 205;

  const titleSize = isXS ? typography.body : isSM ? typography.body + 1 : typography.h3 - 2;
  const priceMainSize = isXS ? typography.body + 2 : isSM ? typography.body + 3 : typography.h3 - 2;
  const priceLabelSize = isXS ? 10 : 11;

  return (
    <>
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
        <LinearGradient colors={GRADIENT} start={{ x: 0.2, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBorder}>
          <View style={styles.card}>
            {/* Media */}
            <View style={styles.mediaWrap}>
              {cover ? (
                <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
              ) : (
                <View style={[styles.cover, styles.coverFallback]}>
                  <Text style={styles.coverFallbackText}>Sin imagen</Text>
                </View>
              )}

              {!!tag && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              )}

              {typeof rating5 === 'number' ? (
                <View style={styles.ratingPill}>
                  <Ionicons name="star" size={12} color="#1b1b1b" />
                  <Text style={styles.ratingText}>{rating5.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>

            {/* Body */}
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={1} ellipsizeMode="tail">
                  {title}
                </Text>

                {showFavorite ? (
                  <Pressable
                    onPress={(e) => { e.stopPropagation?.(); toggleFavorite(); }}
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

              {showPrices && (txtWeek || txtBuy) ? (
                <View style={styles.priceGrid}>
                  <View style={styles.priceCol}>
                    {txtWeek ? (
                      <>
                        <Text style={[styles.priceLabel, styles.priceLabelRent, { fontSize: priceLabelSize }]} numberOfLines={1}>
                          Alquiler
                        </Text>
                        {!!offWeek && !!txtWeekOrig ? (
                          <Text style={styles.priceOriginal} numberOfLines={1}>
                            {txtWeekOrig}/sem
                          </Text>
                        ) : null}
                        <Text style={[styles.priceFinal, styles.priceFinalRent, { fontSize: priceMainSize }]} numberOfLines={1}>
                          {txtWeek}
                          <Text style={styles.perUnit}>/sem</Text>
                        </Text>
                        {!!offWeek && (
                          <View style={[styles.offChip, styles.offChipRent]}>
                            <Text style={styles.offChipText}>-{offWeek}%</Text>
                          </View>
                        )}
                      </>
                    ) : null}
                  </View>

                  <View style={styles.priceCol}>
                    {txtBuy ? (
                      <>
                        <Text style={[styles.priceLabel, styles.priceLabelBuy, { fontSize: priceLabelSize }]} numberOfLines={1}>
                          Compra
                        </Text>
                        {!!offBuy && !!txtBuyOrig ? (
                          <Text style={styles.priceOriginal} numberOfLines={1}>
                            {txtBuyOrig}
                          </Text>
                        ) : null}
                        <Text style={[styles.priceFinal, styles.priceFinalBuy, { fontSize: priceMainSize }]} numberOfLines={1}>
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
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </Pressable>

      {/* Modal “Login requerido” */}
      <Modal visible={askLogin} transparent animationType="fade" onRequestClose={() => setAskLogin(false)}>
        <View style={mstyles.backdrop}>
          <View style={mstyles.modalCard}>
            <Text style={mstyles.title}>Para proceder debés iniciar sesión</Text>
            <Text style={mstyles.body}>Guardamos tus favoritos en tu cuenta.</Text>

            <View style={mstyles.buttonsRow}>
              <Pressable style={[mstyles.btn, mstyles.btnGhost]} onPress={() => setAskLogin(false)}>
                <Text style={mstyles.btnGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[mstyles.btn, mstyles.btnPrimary]}
                onPress={() => {
                  setAskLogin(false);
                  // Ir a Profile
                  try { (nav as any)?.navigate?.('Tabs' as any, { screen: 'Profile' } as any); } catch {}
                }}
              >
                <Text style={mstyles.btnPrimaryText}>Iniciar sesión</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: RADIUS },
  gradientBorder: { borderRadius: RADIUS, padding: BORDER_W },
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
  mediaWrap: { position: 'relative', width: '100%', aspectRatio: 9 / 13, backgroundColor: '#0B2330' },
  cover: { width: '100%', height: '100%' },
  coverFallback: { alignItems: 'center', justifyContent: 'center' },
  coverFallbackText: { color: '#7fa9b8', fontSize: typography.body, opacity: 0.7 },

  tag: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontSize: 12, fontWeight: '900', color: '#1B1B1B', letterSpacing: 0.4, textTransform: 'uppercase' },

  ratingPill: {
    position: 'absolute', top: 10, right: 10, backgroundColor: '#F2B705', flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#d6a304',
  },
  ratingText: { color: '#1b1b1b', fontWeight: '900', fontSize: 12 },

  body: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  heartBtn: { marginLeft: 'auto', padding: 4 },

  title: { color: colors.accent, fontWeight: '900', letterSpacing: 0.3, minWidth: 0, flexShrink: 1 },

  infoPill: { alignSelf: 'flex-start', backgroundColor: '#0f2d3a', borderWidth: 1, borderColor: '#1f546b', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  infoPillText: { color: '#d6eef7', fontSize: 12, fontWeight: '700' },

  priceGrid: { marginTop: 2, flexDirection: 'row', columnGap: 16 },
  priceCol: { flex: 1, minWidth: 0 },

  priceLabel: { fontWeight: '900', letterSpacing: 0.7, textTransform: 'uppercase', color: '#9ED3E6' },
  priceLabelRent: { color: '#7EE8F7' },
  priceLabelBuy: { color: '#FFD86B' },

  priceOriginal: { color: '#9bb3be', textDecorationLine: 'line-through', fontSize: 11 },

  priceFinal: {
    marginTop: 2, fontWeight: '900', letterSpacing: 0.2, textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, maxWidth: '100%',
  },
  perUnit: { fontSize: 11, fontWeight: '800', color: '#9ED3E6', marginLeft: 4 },
  priceFinalRent: { color: '#7EE8F7' },
  priceFinalBuy: { color: '#F2B705', textShadowColor: 'rgba(242,183,5,0.35)', textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } },

  offChip: { marginTop: 4, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  offChipRent: { backgroundColor: '#10242d', borderColor: '#1f546b' },
  offChipBuy: { backgroundColor: '#201a05', borderColor: '#F2B705' },
  offChipText: { color: '#F2B705', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
});

const mstyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: {
    width: '100%', maxWidth: 380, backgroundColor: '#0F2D3A', borderRadius: 16, borderWidth: 1, borderColor: '#143547',
    paddingHorizontal: 18, paddingVertical: 16,
  },
  title: { color: colors.accent, fontSize: typography.h3, fontWeight: '900', marginBottom: 6 },
  body: { color: '#d6eef7', fontSize: typography.body },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  btnGhost: { borderColor: '#1f546b', backgroundColor: '#0b2330' },
  btnGhostText: { color: '#d6eef7', fontWeight: '800' },
  btnPrimary: { borderColor: '#f2b705', backgroundColor: '#f2b705' },
  btnPrimaryText: { color: '#1b1b1b', fontWeight: '900' },
});
