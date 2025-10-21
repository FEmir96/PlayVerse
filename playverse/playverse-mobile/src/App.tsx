import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { ConvexProvider } from 'convex/react';
import { convex } from './lib/convexClient';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function MainApp() {
  const linking = {
    prefixes: [Linking.createURL('/'), 'playverse://'],
    config: {
      screens: {
        AuthCallback: 'auth',
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
