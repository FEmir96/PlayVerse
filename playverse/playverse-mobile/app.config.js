import * as dotenv from "dotenv";

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
    plugins: [],
    experiments: {},
    extra: {
      convexUrl: process.env.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL,
      webAuthUrl: process.env.EXPO_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
      webAssetBase: process.env.EXPO_PUBLIC_WEB_ASSET_BASE,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
      microsoftClientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID,
      microsoftClientSecret: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_SECRET,
      microsoftTenantId: process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID,
    }
  }
};
