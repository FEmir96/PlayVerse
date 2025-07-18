import Constants from "expo-constants";
import { ConvexReactClient } from "convex/react";

const convexUrl = Constants.expoConfig?.extra?.convexUrl;

if (!convexUrl) {
  throw new Error("convexUrl no está definido en extra de app.config.js");
}

export const convex = new ConvexReactClient(convexUrl);
