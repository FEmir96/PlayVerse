// playverse-web/lib/useAuthStore.ts
"use client";

import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";

export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: "free" | "premium" | "admin";
  createdAt: number;
};

export type AuthState = {      // 👈 export (lo usamos en el login)
  user: UserProfile | null;
  setUser: (u: UserProfile) => void;
  clear: () => void;
};

const creator: StateCreator<AuthState> = (set) => ({
  user: null,
  setUser: (u: UserProfile) => set({ user: u }),
  clear: () => set({ user: null }),
});

export const useAuthStore = create<AuthState>()(
  persist(creator, { name: "pv_auth" })
);
