// playverse/playverse-mobile/app.config.js
import "dotenv/config";

export default {
  expo: {
    // -- Nombres (ajustados) --
    name: "PlayVerse Mobile",
    slug: "playverse-mobile",

    // -- Dueño del proyecto en Expo (conservado) --
    owner: "fernandoemir",

    // -- Resto de tu config original (conservada) --
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "playverse",
    userInterfaceStyle: "automatic",

    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    // -- iOS: bundleIdentifier + target mínimo que pide EAS --
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.playverse.app",
      deploymentTarget: "15.1",
    },

    // -- Android: package; sin Firebase --
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.playverse.app",
      // ❌ No usamos FCM:
      // googleServicesFile: "./google-services.json"
      // ✅ Permisos para Pushy / notificaciones:
      permissions: [
        "INTERNET",
        "WAKE_LOCK",
        "RECEIVE_BOOT_COMPLETED",
        "POST_NOTIFICATIONS" // Android 13+
      ],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png",
    },

    // -- Plugins: mantenemos los tuyos + build-properties (repo de Pushy) --
    plugins: [
      "expo-web-browser",
      "expo-notifications",
      "./plugins/withPushy",
      [
        "expo-build-properties",
        {
          android: {
            // Repositorio Maven de Pushy (requerido)
            extraMavenRepos: ["https://repo.pushy.me"],
          },
        },
      ],
    ],

    // -- Extra (conservado) + EAS projectId --
    extra: {
      convexUrl: process.env.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL,
      webAuthUrl:
        process.env.EXPO_PUBLIC_WEB_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000",
      webAssetBase: process.env.EXPO_PUBLIC_WEB_ASSET_BASE,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      googleExpoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
      microsoftClientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID,
      microsoftExpoClientId: process.env.EXPO_PUBLIC_MICROSOFT_EXPO_CLIENT_ID,
      microsoftTenantId: process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID,
      auth: {
        google: {
          expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
          clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        },
        microsoft: {
          expoClientId: process.env.EXPO_PUBLIC_MICROSOFT_EXPO_CLIENT_ID,
          clientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID,
          tenantId: process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID,
        },
      },

      // ← EAS/Push (conservado)
      eas: {
        projectId: "4dae069c-2e28-4075-a5be-4dea3c345351",
      },
    },
  },
};
