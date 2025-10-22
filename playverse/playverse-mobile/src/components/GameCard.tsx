import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../styles/theme';
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="overflow-hidden rounded-lg border border-surfaceBorder bg-surface shadow-card"
      style={[styles.shadow, style]}
    >
      <View className="relative">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="aspect-[0.68] w-full" />
        ) : (
          <View className="aspect-[0.68] w-full items-center justify-center bg-[#0F2D3A]">
            <Ionicons name="game-controller" size={36} color={colors.textSecondary} />
          </View>
        )}

        {tag ? (
          <View className="absolute left-sm top-sm rounded-pill bg-accent px-sm py-[4px]">
            <Text className="text-caption font-extrabold text-[#1B1B1B]">{tag}</Text>
          </View>
        ) : null}

        {rightBadge ? <View className="absolute right-sm top-sm">{rightBadge}</View> : null}
      </View>

      <View className="min-h-[110px] gap-xs px-md py-md">
        <Text className="text-h3 font-bold text-textPrimary" numberOfLines={2}>
          {title}
        </Text>
        {summary ? (
          <Text className="text-caption text-textSecondary" numberOfLines={2}>
            {summary}
          </Text>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-xs">
          {typeof rating === 'number' ? (
            <View className="flex-row items-center gap-[4px] rounded-pill bg-[#244552] px-2 py-[2px]">
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text className="text-[12px] font-bold text-textPrimary">{rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {typeof weekly === 'number' ? (
            <Text className="text-[12px] font-semibold text-info">Alquiler ${weekly.toFixed(2)}/sem</Text>
          ) : null}
          {typeof buy === 'number' ? (
            <Text className="text-[12px] font-semibold text-info">Compra ${buy.toFixed(2)}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    elevation: 8,
    shadowColor: 'rgba(0,0,0,0.35)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});

