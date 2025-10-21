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
    // We use React Navigation, not Expo Router
    plugins: [],
    experiments: {},
    extra: {
      // Convex URL desde .env.local / .env
      convexUrl: process.env.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL,
      // Web auth base URL (para abrir login/registro desde la app)
      webAuthUrl: process.env.EXPO_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',

      // Exponer credenciales para flujos nativos futuros (no requeridas si usamos web auth)
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
      microsoftClientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID,
      microsoftClientSecret: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_SECRET,
      microsoftTenantId: process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID,
    }
  }
};
