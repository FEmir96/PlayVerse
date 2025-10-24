// playverse/playverse-mobile/src/lib/convexClient.ts
import { ConvexReactClient } from 'convex/react';
import { ConvexHttpClient } from 'convex/browser';

const url =
  process.env.EXPO_PUBLIC_CONVEX_URL ??
  'https://quirky-squirrel-924.convex.cloud';

export const convex = new ConvexReactClient(url);
export const convexHttp = new ConvexHttpClient(url);
