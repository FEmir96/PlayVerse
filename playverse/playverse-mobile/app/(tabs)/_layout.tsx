import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Componente personalizado para los iconos de tabs
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  size?: number;
  label: string;
  focused: boolean;
  isHome?: boolean;
}) {
  const { name, color, size = 28, label, focused, isHome = false } = props;
  
  if (isHome) {
    return (
      <View style={styles.tabIconContainer}>
        <View style={[styles.homeButton, { backgroundColor: focused ? color : '#E5E7EB' }]}>
          <Ionicons name={name} size={size} color={focused ? '#FFFFFF' : color} />
        </View>
        <Text style={[styles.tabLabel, { color: focused ? color : color }]}>
          {label}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons name={name} size={size} color={color} />
      <Text style={[styles.tabLabel, { color }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: 'rgba(0,0,0,0.1)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 20,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="my-games"
        options={{
          title: 'Mis juegos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="game-controller" 
              color={color} 
              label="" 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="grid" 
              color={color} 
              label="" 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="home" 
              color={color} 
              label="Inicio" 
              focused={focused}
              isHome={true}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="heart" 
              color={color} 
              label="" 
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name="person" 
              color={color} 
              label="" 
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});