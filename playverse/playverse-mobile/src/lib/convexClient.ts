import Constants from 'expo-constants';
import { ConvexReactClient } from 'convex/react';
import { ConvexHttpClient } from 'convex/browser';

// Resolve Convex URL from multiple sources to avoid crashes during dev.
let convexUrl =
  (Constants.expoConfig?.extra as any)?.convexUrl ||
  process.env.EXPO_PUBLIC_CONVEX_URL ||
  process.env.CONVEX_URL ||
  '';

if (!convexUrl) {
  // Safe fallback so the app doesn't crash while setting up envs.
  // Adjust this to your local/cloud instance.
  console.warn(
    '[Convex] convexUrl not set. Configure .env.local (EXPO_PUBLIC_CONVEX_URL) or app.config.js > extra.convexUrl'
  );
  convexUrl = 'http://localhost:8187'; // typical `npx convex dev` address
}

// React client (for ConvexProvider and future typed hooks `useQuery`)
export const convex = new ConvexReactClient(convexUrl);

// HTTP client by string path (what we use now)
export const convexHttp = new ConvexHttpClient(convexUrl);

