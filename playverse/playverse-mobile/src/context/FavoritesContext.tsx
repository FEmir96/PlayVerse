// playverse/playverse-mobile/src/context/FavoritesContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import { convexHttp } from '../lib/convexClient';

/**
 * Probamos múltiples nombres posibles de query en Convex (sin tocar backend).
 * Si alguno existe, useConvexQuery lo detecta y deja de intentar los demás.
 */
const FAVORITES_QUERY_NAMES = [
  // Las más probables primero:
  'favorites:listByUser',
  'queries/getFavorites:getFavorites',
  'queries/favorites:listByUser',
  'queries/favorites:getByUser',
  'queries/favorites:getForUser',
  // Variantes que a veces usamos:
  'favorites:getByUser',
  'favorites:getForUser',
  'favorites/byUser',
  'favorites/allByUser',
  'favorites:list',
  'favorites:forUser',
  'queries/favorites:byUser',
  'queries/favorites:allByUser',
];

type FavoritesContextValue = {
  ids: string[];
  isFavorite: (gameId?: string | null) => boolean;
  toggle: (gameId: string) => Promise<void>;
  refetch?: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue>({
  ids: [],
  isFavorite: () => false,
  toggle: async () => {},
  refetch: undefined,
});

type FavoriteRow = { gameId?: string; _id?: string; id?: string };

export const FavoritesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { profile } = useAuth();
  const enabled = !!profile?._id;

  // Trae las filas de favoritos del usuario, con fallbacks.
  const { data: favRows = [], refetch } = useConvexQuery<FavoriteRow[]>(
    FAVORITES_QUERY_NAMES,
    enabled ? { userId: profile!._id } : ({} as any),
    { enabled, refreshMs: 20000 }
  );

  const [ids, setIds] = useState<string[]>([]);

  // Al desloguear, limpiar inmediatamente los favoritos locales
  useEffect(() => {
    if (!enabled) setIds([]);
  }, [enabled]);

  // Mapear filas -> ids de game (string)
  useEffect(() => {
    if (!enabled) return;
    const next = (favRows ?? [])
      .map((r) => String(r?.gameId ?? r?.id ?? r?._id ?? ''))
      .filter(Boolean);
    setIds(next);
  }, [favRows, enabled]);

  const isFavorite = useCallback(
    (gameId?: string | null) => !!gameId && ids.includes(String(gameId)),
    [ids]
  );

  const toggle = useCallback(
    async (gameId: string) => {
      if (!profile?._id || !gameId) return;
      // Optimista
      setIds((prev) => (prev.includes(gameId) ? prev.filter((x) => x !== gameId) : [...prev, gameId]));
      try {
        const client: any = convexHttp as any;
        await client.mutation('mutations/toggleFavorite:toggleFavorite', {
          userId: profile._id,
          gameId,
        });
        await refetch?.();
      } catch (err) {
        // Revert en caso de error
        setIds((prev) => (prev.includes(gameId) ? prev.filter((x) => x !== gameId) : [...prev, gameId]));
        console.error('toggleFavorite error', err);
      }
    },
    [profile?._id, refetch]
  );

  const value = useMemo(() => ({ ids, isFavorite, toggle, refetch }), [ids, isFavorite, toggle, refetch]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => useContext(FavoritesContext);
