import React from 'react';
import { Stack } from 'expo-router';
import { ConvexProvider } from 'convex/react';
import { convex } from '@/src/lib/convexClient';

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ConvexProvider>
  );
}
