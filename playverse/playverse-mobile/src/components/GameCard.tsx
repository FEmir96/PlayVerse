import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../styles/theme';
import type { Game, UpcomingGame } from '../types/game';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  game: Partial<Game> | UpcomingGame;
  style?: ViewStyle;
  tag?: string; // e.g. "Acción" o "Próximamente"
  rightBadge?: React.ReactNode; // e.g. rating badge
};

// Visual card used in Home sections. It focuses on cover, title
// and small meta like rating or price. Pure presentational.
export default function GameCard({ game, style, tag, rightBadge }: Props) {
  const cover = (game as any).cover_url;
  const title = game.title;
  const weekly = (game as any).weeklyPrice as number | undefined;
  const buy = (game as any).purchasePrice as number | undefined;
  const rating = (game as any).igdbRating as number | undefined;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.coverWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Ionicons name="game-controller" size={36} color={colors.textSecondary} />
          </View>
        )}
        {tag && (
          <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
        )}
        {!!rightBadge && <View style={styles.badgeRight}>{rightBadge}</View>}
      </View>

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.row}>
          {typeof rating === 'number' && (
            <View style={styles.rating}><Ionicons name="star" size={12} color="#FFD166" /><Text style={styles.ratingText}>{rating.toFixed(1)}</Text></View>
          )}
          {typeof weekly === 'number' && (
            <Text style={styles.price}>Alquiler ${weekly.toFixed(2)}/sem</Text>
          )}
          {typeof buy === 'number' && (
            <Text style={styles.price}>Compra ${buy.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </View>
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
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B2430',
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
    gap: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
