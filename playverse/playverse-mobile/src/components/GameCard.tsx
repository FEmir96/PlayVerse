// playverse/playverse-mobile/src/components/GameCard.tsx
import React from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import type { Game as GameType } from '../types/game';

export type GameCardProps = {
  game: GameType & {
    title?: string;
    cover_url?: string | null;
    gameId?: string;
    purchasePrice?: number | null;
    weeklyPrice?: number | null;
    igdbRating?: number | null;
    plan?: any;
  };
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tag?: string;
  overlayLabel?: string;
  showPrices?: boolean; // default true
  disabled?: boolean;
};

function formatPrice(n?: number | null) {
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

export default function GameCard(props: GameCardProps) {
  const { game, style, onPress, tag, overlayLabel, disabled } = props;
  const showPrices = props.showPrices ?? true;

  const title = game.title ?? 'Juego';
  const cover = game.cover_url || undefined;

  const priceBuy = formatPrice(game.purchasePrice ?? undefined);
  const priceWeek = formatPrice(game.weeklyPrice ?? undefined);
  const showAnyPrice = showPrices && (!!priceBuy || !!priceWeek);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && { transform: [{ scale: 0.995 }], opacity: 0.95 },
        disabled && { opacity: 0.85 },
      ]}
    >
      <View style={styles.mediaWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.coverPlaceholderText}>Sin imagen</Text>
          </View>
        )}

        {/* Tag (esquina sup. izq.) */}
        {!!tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}

        {/* Overlay label (esquina sup. der. / info) */}
        {!!overlayLabel && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>{overlayLabel}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {typeof game.igdbRating === 'number' && isFinite(game.igdbRating) && (
          <Text style={styles.meta}>⭐ {Math.round(game.igdbRating)}/100</Text>
        )}

        {showAnyPrice ? (
          <View style={styles.pricesRow}>
            {priceWeek ? (
              <View style={styles.pricePill}>
                <Text style={styles.pricePillText}>{priceWeek}/sem</Text>
              </View>
            ) : null}
            {priceBuy ? (
              <View style={[styles.pricePill, styles.pricePillAlt]}>
                <Text style={[styles.pricePillText, styles.pricePillTextAlt]}>
                  {priceBuy}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const RADIUS = 14;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2D3A',
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: '#1F546B',
    overflow: 'hidden',

    // Sombra/elevación sutil
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  mediaWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 9 / 13, // cover “vertical”
    backgroundColor: '#0B2330',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    color: '#7fa9b8',
    fontSize: typography.body,
    opacity: 0.7,
  },

  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B1B1B',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  overlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F546B',
  },
  overlayText: {
    color: '#EAF6FB',
    fontSize: 11,
    fontWeight: '700',
  },

  body: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  title: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: '800',
  },
  meta: {
    color: '#9AB7C3',
    fontSize: 12,
  },

  pricesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  pricePill: {
    backgroundColor: '#133445',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F546B',
  },
  pricePillAlt: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pricePillText: {
    color: '#9ED3E6',
    fontSize: 12,
    fontWeight: '800',
  },
  pricePillTextAlt: {
    color: '#1B1B1B',
  },
});
