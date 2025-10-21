import Constants from "expo-constants";
import { ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";

const convexUrl =
  Constants.expoConfig?.extra?.convexUrl ||
  process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("convexUrl no está definido (revisá app.config.js y .env/.env.local)");
}

// Hooks tipados (si más adelante usás `api.*`)
export const convex = new ConvexReactClient(convexUrl);

// Llamadas por string (lo que necesitás ahora)
export const convexHttp = new ConvexHttpClient(convexUrl);
