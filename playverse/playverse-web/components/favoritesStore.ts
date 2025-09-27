// playverse-web/components/favoritesStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FavoriteItem = {
  id: string;
  title: string;
  cover: string;
  priceBuy?: number | null;
  priceRent?: number | null;
};

type FavState = {
  items: FavoriteItem[];
  add: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function broadcast() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pv:favorites:changed"));
  }
}

export const useFavoritesStore = create<FavState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) return;
        set({ items: [item, ...get().items] });
        broadcast();
      },
      remove: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        broadcast();
      },
      clear: () => {
        set({ items: [] });
        broadcast();
      },
    }),
    { name: "pv_favorites" }
  )
);
