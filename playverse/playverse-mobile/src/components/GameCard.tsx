import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography, shadows } from '../styles/theme';
import type { Game, UpcomingGame } from '../types/game';
import { resolveAssetUrl } from '../lib/asset';

type Props = {
  game: Partial<Game> | UpcomingGame;
  style?: ViewStyle;
  tag?: string;
  rightBadge?: React.ReactNode;
  onPress?: () => void;
};

export default function GameCard({ game, style, tag, rightBadge, onPress }: Props) {
  const imageUri = resolveAssetUrl((game as any).cover_url as string | undefined);
  const title = game.title || 'Juego';
  const summary = (game as any).description as string | undefined;
  const weekly = (game as any).weeklyPrice as number | undefined;
  const buy = (game as any).purchasePrice as number | undefined;
  const rating = (game as any).igdbRating as number | undefined;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, style]}>
      <View style={styles.coverWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Ionicons name="game-controller" size={36} color={colors.textSecondary} />
          </View>
        )}

        {tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ) : null}

        {rightBadge ? <View style={styles.badgeRight}>{rightBadge}</View> : null}
      </View>

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {summary ? <Text style={styles.summary} numberOfLines={2}>{summary}</Text> : null}

        <View style={styles.detailsRow}>
          {typeof rating === 'number' ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {typeof weekly === 'number' ? (
            <Text style={styles.price}>Alquiler ${weekly.toFixed(2)}/sem</Text>
          ) : null}
          {typeof buy === 'number' ? (
            <Text style={styles.price}>Compra ${buy.toFixed(2)}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  coverWrap: { position: 'relative' },
  cover: {
    width: '100%',
    aspectRatio: 0.68,
    resizeMode: 'cover',
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2D3A',
  },
  tag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: '#1B1B1B',
  },
  badgeRight: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  meta: {
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 110,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '700',
  },
  summary: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#244552',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    gap: 4,
  },
  ratingText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    color: colors.info,
    fontWeight: '700',
    fontSize: 12,
  },
});
