import * as dotenv from "dotenv";

// Carga .env.local primero (si existe) y luego .env como fallback
dotenv.config({ path: ".env.local" });
dotenv.config();

export default {
  expo: {
    name: "playverse",
    slug: "playverse",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "playverse",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png"
    },
    plugins: ["expo-router"],
    experiments: { typedRoutes: true },
    extra: {
      // Convex URL desde .env.local / .env
      convexUrl: process.env.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL
    }
  }
};
