import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, radius } from '../styles/theme';
import type { Game, UpcomingGame } from '../types/game';
import { resolveAssetUrl } from '../lib/asset';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

type Props = {
  game: Partial<Game> | UpcomingGame;
  style?: ViewStyle;
  tag?: string;
  rightBadge?: React.ReactNode;
  overlayLabel?: string;
  disabled?: boolean;
  hideFavorite?: boolean;            // 👈 nuevo: permite ocultar el corazón
  onPress?: () => void;
};

export default function GameCard({
  game,
  style,
  tag,
  rightBadge,
  overlayLabel,
  disabled,
  hideFavorite,
  onPress,
}: Props) {
  const nav = useNavigation<any>();
  const { profile } = useAuth();

  const imageUri = resolveAssetUrl((game as any).cover_url as string | undefined);
  const title = game.title || 'Juego';
  const summary = (game as any).description as string | undefined;
  const weekly = (game as any).weeklyPrice as number | undefined;
  const buy = (game as any).purchasePrice as number | undefined;
  const rating = (game as any).igdbRating as number | undefined;

  const isDisabled = disabled || !onPress;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [toggling, setToggling] = useState(false);
  const [authModal, setAuthModal] = useState(false);

  const gameId = useMemo(() => {
    const raw =
      (game as any)._id ??
      (game as any).gameId ??
      (game as any).convexId;
    return raw ? String(raw) : undefined;
  }, [game]);

  const isFavorite = !!(gameId && favoriteIds.has(gameId));
  // 👇 mostramos el botón SIEMPRE (salvo que se pida ocultarlo explícitamente)
  const showFavoriteButton = !hideFavorite && !!gameId && !disabled;

  const handleToggleFavorite = async () => {
    if (!showFavoriteButton || !gameId || toggling) return;

    // Si no hay sesión, abrimos el modal de login
    if (!profile) {
      setAuthModal(true);
      return;
    }

    setToggling(true);
    try {
      await toggleFavorite(gameId);
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`overflow-hidden rounded-lg border border-surfaceBorder bg-surface shadow-card transition-transform duration-150 ${isDisabled ? 'opacity-80' : 'active:scale-97 active:bg-surface/90'}`}
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

          {overlayLabel ? (
            <View className="absolute left-0 top-0 rounded-br-lg bg-[#22d3eecc] px-sm py-[4px]">
              <Text className="text-[11px] font-extrabold uppercase tracking-[0.8px] text-[#0b2530]">
                {overlayLabel}
              </Text>
            </View>
          ) : null}

          {(rightBadge || showFavoriteButton) ? (
            <View className="absolute right-sm top-sm items-end gap-sm">
              {showFavoriteButton ? (
                <Pressable
                  onPress={handleToggleFavorite}
                  style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                  disabled={toggling}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFavorite ? '#FF6B9A' : colors.accent}
                  />
                </Pressable>
              ) : null}
              {rightBadge ? <View>{rightBadge}</View> : null}
            </View>
          ) : null}
        </View>

        <View className="min-h-[110px] gap-xs px-md py-md">
          <Text className="text-h3 font-bold text-accent" numberOfLines={2}>
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
                <Text className="text-[12px] font-bold text-accent">{rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {typeof weekly === 'number' ? (
              <Text className="text-[12px] font-semibold text-accent">Alquiler ${weekly.toFixed(2)}/sem</Text>
            ) : null}
            {typeof buy === 'number' ? (
              <Text className="text-[12px] font-semibold text-accent">Compra ${buy.toFixed(2)}</Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* Modal de “debes iniciar sesión” */}
      <Modal
        visible={authModal}
        animationType="fade"
        transparent
        onRequestClose={() => setAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setAuthModal(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Para continuar debes iniciar sesión</Text>
            <Text style={styles.modalBody}>
              Inicia sesión para agregar juegos a Favoritos.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.actionBtn, styles.btnGhost]}
                onPress={() => setAuthModal(false)}
              >
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.btnPrimary]}
                onPress={() => {
                  setAuthModal(false);
                  nav.navigate('Profile' as any); // lleva al flujo de login
                }}
              >
                <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B2F3Bcc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  favoriteButtonActive: {
    borderColor: '#FF6B9A',
    backgroundColor: '#331728',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  modalBody: {
    color: colors.accent,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // 👉 botones “bien en la esquina”
    gap: spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderColor: colors.surfaceBorder,
  },
  btnGhostText: {
    color: colors.accent,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  btnPrimaryText: {
    color: '#1B1B1B',
    fontWeight: '800',
  },
});
