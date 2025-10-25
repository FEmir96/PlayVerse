// playverse/playverse-mobile/src/navigation/BottomTabBar.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../styles/theme';

type TabKey = 'Home' | 'Catalog' | 'MyGames' | 'Favorites' | 'Profile';
type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<TabKey, { focused: IconName; unfocused: IconName; label: string }> = {
  Home: { focused: 'home', unfocused: 'home-outline', label: 'Inicio' },
  Catalog: { focused: 'grid', unfocused: 'grid-outline', label: 'Catálogo' },
  MyGames: { focused: 'albums', unfocused: 'albums-outline', label: 'Mis juegos' },
  Favorites: { focused: 'heart', unfocused: 'heart-outline', label: 'Favoritos' },
  Profile: { focused: 'person', unfocused: 'person-outline', label: 'Perfil' },
};

const BAR_H = 64;       // alto de barra
const FAB_SIZE = 64;    // diámetro del botón central
const FAB_R = FAB_SIZE / 2;

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const current = state.routes[state.index];
  const currentName = (current?.name as TabKey) ?? 'Home';

  const goTo = (name: TabKey) => {
    const idx = state.routes.findIndex(r => r.name === name);
    if (idx < 0) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[idx].key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) navigation.navigate(name as never);
  };

  // Izquierda — Centro (Home FAB) — Derecha
  const left: TabKey[] = ['MyGames', 'Catalog'];
  const right: TabKey[] = ['Favorites', 'Profile'];

  const Item = ({ name }: { name: TabKey }) => {
    const isFocused = currentName === name;
    const icon = ICONS[name];
    return (
      <Pressable
        onPress={() => goTo(name)}
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      >
        <Ionicons
          name={isFocused ? icon.focused : icon.unfocused}
          size={22}
          color={isFocused ? colors.accent : '#9AB7C3'}
        />
        <Text style={[styles.label, isFocused && styles.labelFocused]} numberOfLines={1}>
          {icon.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 6) },
        Platform.OS === 'web' && (styles.webShadow as any),
      ]}
    >
      <View style={styles.row}>
        {/* Grupo izquierdo */}
        <View style={styles.sideGroup}>
          {left.map(k => <Item key={k} name={k} />)}
        </View>

        {/* Centro: slot del FAB con ancho fijo => FAB SIEMPRE CENTRADO */}
        <View style={styles.centerSlot}>
          <Pressable
            onPress={() => goTo('Home')}
            style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.98 }] }]}
          >
            <Ionicons
              name={currentName === 'Home' ? 'home' : 'home-outline'}
              size={28}
              color="#1B1B1B"
            />
          </Pressable>
        </View>

        {/* Grupo derecho */}
        <View style={styles.sideGroup}>
          {right.map(k => <Item key={k} name={k} />)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#072633',
    borderTopWidth: 1,
    borderTopColor: '#103949',
    paddingTop: FAB_R - 8, // hace que el FAB “muerda” la línea superior
  },
  webShadow: {
    boxShadow: '0 -6px 22px rgba(0,0,0,0.18)',
  },
  row: {
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: spacing.lg,
  },
  item: {
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  label: {
    marginTop: 4,
    color: '#9AB7C3',
    fontSize: 12,
    fontWeight: '700',
  },
  labelFocused: { color: colors.accent },
  centerSlot: {
    width: FAB_SIZE,               // fija el ancho del slot central
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fab: {
    marginTop: -FAB_R,             // sube el botón para centrarlo visualmente
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_R,
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  pressed: { opacity: 0.85 },
});
