// playverse/playverse-mobile/src/navigation/BottomTabBar.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius } from '../styles/theme';

type TabKey = 'Home' | 'Catalog' | 'MyGames' | 'Favorites' | 'Profile';

const ICONS: Record<TabKey, { focused: any; unfocused: any; label: string }> = {
  Home: { focused: 'home', unfocused: 'home-outline', label: 'Inicio' },
  Catalog: { focused: 'grid', unfocused: 'grid-outline', label: 'Catálogo' },
  MyGames: { focused: 'albums', unfocused: 'albums-outline', label: 'Mis juegos' },
  Favorites: { focused: 'heart', unfocused: 'heart-outline', label: 'Favoritos' },
  Profile: { focused: 'person', unfocused: 'person-outline', label: 'Perfil' },
};

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Esperamos 5 tabs y ponemos Home en el centro
  // Izquierda: Catalog, MyGames — Centro: Home — Derecha: Favorites, Profile
  const order: TabKey[] = ['Catalog', 'MyGames', 'Home', 'Favorites', 'Profile'];

  const currentRoute = state.routes[state.index];
  const currentName = currentRoute.name as TabKey;

  const goTo = (name: string, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
        Platform.OS === 'web' && styles.webShadow,
      ]}
    >
      <View style={styles.row}>
        {/* Grupo izquierdo */}
        <View style={styles.sideGroup}>
          {order.slice(0, 2).map((name) => {
            const routeIndex = state.routes.findIndex((r) => r.name === name);
            if (routeIndex === -1) return null;
            const focused = currentName === name;
            const iconSet = ICONS[name];
            return (
              <Pressable
                key={name}
                onPress={() => goTo(name, routeIndex)}
                style={({ pressed }) => [
                  styles.sideBtn,
                  focused && styles.sideBtnFocused,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={focused ? iconSet.focused : iconSet.unfocused}
                  size={18}
                  color={focused ? colors.accent : '#9AB7C3'}
                />
                <Text style={[styles.sideLabel, focused && styles.sideLabelFocused]}>
                  {iconSet.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Botón central grande (Inicio) */}
        {(() => {
          const name: TabKey = 'Home';
          const routeIndex = state.routes.findIndex((r) => r.name === name);
          const focused = currentName === name;
          const iconSet = ICONS[name];
          return (
            <Pressable
              key="HOME_CTA"
              onPress={() => goTo(name, routeIndex)}
              style={({ pressed }) => [
                styles.fab,
                { backgroundColor: colors.accent, borderColor: colors.accent },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Ionicons
                name={focused ? iconSet.focused : iconSet.unfocused}
                size={22}
                color="#1B1B1B"
              />
              <Text style={styles.fabLabel}>{iconSet.label}</Text>
            </Pressable>
          );
        })()}

        {/* Grupo derecho */}
        <View style={styles.sideGroup}>
          {order.slice(3).map((name) => {
            const routeIndex = state.routes.findIndex((r) => r.name === name);
            if (routeIndex === -1) return null;
            const focused = currentName === name;
            const iconSet = ICONS[name];
            return (
              <Pressable
                key={name}
                onPress={() => goTo(name, routeIndex)}
                style={({ pressed }) => [
                  styles.sideBtn,
                  focused && styles.sideBtnFocused,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={focused ? iconSet.focused : iconSet.unfocused}
                  size={18}
                  color={focused ? colors.accent : '#9AB7C3'}
                />
                <Text style={[styles.sideLabel, focused && styles.sideLabelFocused]}>
                  {iconSet.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const H = 64; // alto de barra
const FAB_W = 120; // ancho del botón central
const FAB_H = 44;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#072633',
    borderTopWidth: 1,
    borderTopColor: '#103949',
    paddingTop: 8,
  },
  webShadow: {
    boxShadow: '0 -6px 22px rgba(0,0,0,0.22)',
  } as any,
  row: {
    height: H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // balancea lados
    paddingHorizontal: spacing.xl,
  },
  sideGroup: {
    width: (FAB_W / 2) + 120, // deja espacio para centrar visualmente con el FAB
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sideBtnFocused: {
    borderColor: '#1F546B',
    backgroundColor: '#0F2D3A',
  },
  sideLabel: {
    color: '#9AB7C3',
    fontSize: 12,
    fontWeight: '700',
  },
  sideLabelFocused: {
    color: colors.accent,
  },
  fab: {
    width: FAB_W,
    height: FAB_H,
    borderRadius: FAB_H / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  fabLabel: {
    color: '#1B1B1B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.85,
  },
});
