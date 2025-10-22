import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { ConvexProvider } from 'convex/react';
import { convex } from './lib/convexClient';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function MainApp() {
  // Ensures AuthSession can close browser tabs after redirect
  try { WebBrowser.maybeCompleteAuthSession(); } catch {}
  const linking = {
    prefixes: [Linking.createURL('/'), 'playverse://'],
    config: {
      screens: {
        AuthCallback: 'auth',
        GameDetail: {
          path: 'GameDetail/:gameId?',
          parse: {
            gameId: (value: string) => value,
          },
        },
        Tabs: {
          screens: {
            Home: 'home',
            Catalog: 'catalog',
            MyGames: 'my-games',
            Favorites: 'favorites',
            Profile: 'profile',
          },
        },
      },
    },
  } as const;
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </ConvexProvider>
  );
}
