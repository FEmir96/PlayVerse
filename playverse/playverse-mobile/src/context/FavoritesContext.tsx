import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

import { useAuth } from './AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import { convexHttp } from '../lib/convexClient';

type FavoriteRecord = {
  _id: string;
  userId: string;
  gameId: string;
  createdAt?: number;
  game?: {
    _id: string;
    title?: string;
    cover_url?: string;
    plan?: string;
  } | null;
};

type FavoritesContextValue = {
  favorites: FavoriteRecord[];
  favoriteIds: Set<string>;
  loading: boolean;
  canFavorite: boolean;
  toggleFavorite: (gameId: string) => Promise<{ ok: boolean; status?: 'added' | 'removed'; error?: any }>;
  refetch: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const userId = profile?._id ? String(profile._id) : undefined;

  const { data, loading, refetch } = useConvexQuery<FavoriteRecord[]>(
    'queries/listFavoritesByUser:listFavoritesByUser',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 12000 }
  );

  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      return;
    }
    if (Array.isArray(data)) {
      setFavorites(data);
    }
  }, [userId, data]);

  const favoriteIds = useMemo(() => {
    return new Set(favorites.map((fav) => String(fav.gameId)));
  }, [favorites]);

  const toggleFavorite = useCallback<FavoritesContextValue['toggleFavorite']>(
    async (gameId) => {
      if (!userId) {
        return { ok: false, error: new Error('No autenticado') };
      }
      const key = String(gameId);
      const currentlyFavorite = favoriteIds.has(key);
      const previousSnapshot = favorites;

      setFavorites((prev) => {
        if (currentlyFavorite) {
          return prev.filter((fav) => String(fav.gameId) !== key);
        }
        const optimistic: FavoriteRecord = {
          _id: `optimistic-${key}`,
          userId,
          gameId: key,
          createdAt: Date.now(),
        };
        return [optimistic, ...prev];
      });

      try {
        const result = await (convexHttp as any).mutation('mutations/toggleFavorite:toggleFavorite', {
          userId,
          gameId: key,
        });
        await refetch();
        return { ok: true, status: result?.status };
      } catch (error) {
        setFavorites(previousSnapshot);
        return { ok: false, error };
      }
    },
    [userId, favoriteIds, favorites, refetch]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      favoriteIds,
      loading,
      canFavorite: !!userId,
      toggleFavorite,
      refetch: async () => {
        await refetch();
      },
    }),
    [favorites, favoriteIds, loading, toggleFavorite, userId, refetch]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within <FavoritesProvider>');
  }
  return ctx;
}
