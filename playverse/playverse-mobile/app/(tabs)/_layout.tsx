import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabsLayout() {
  const cs = useColorScheme();
  const colors = Colors[cs ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: '#1f2937' }
      }}
    >
      <Tabs.Screen
        name="my-games"
        options={{
          title: 'Mis juegos',
          tabBarIcon: ({ color, size }) => <Ionicons name="game-controller-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
