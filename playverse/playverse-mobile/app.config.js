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
      backgroundColor: "#ffffff"
    },

    // -- iOS: ahora con bundleIdentifier (requerido para builds) --
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.playverse.app"
    },

    // -- Android: ahora con package (requerido para builds) --
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.playverse.app",
      // Para push en builds reales: subir FCM luego (opcional)
      // googleServicesFile: "./google-services.json"
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png"
    },

    // -- Plugins: mantuve los tuyos y el de notifications --
    plugins: [
      "expo-web-browser",
      "expo-notifications"
    ],

    // -- Extra: conservé TODO lo tuyo y agregué eas.projectId (clave para getExpoPushTokenAsync) --
    extra: {
      convexUrl: process.env.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL,
      webAuthUrl: process.env.EXPO_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
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

      // ← agregado para EAS/Push
      eas: {
    "projectId": "4dae069c-2e28-4075-a5be-4dea3c345351"
      }
    }
  }
};
