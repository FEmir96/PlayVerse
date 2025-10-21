import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

// Custom bottom tab bar matching Figma: dark bar with a centered
// circular Home button (accent color) slightly elevated.
export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
          MyGames: 'hammer', // closest to swords
          Catalog: 'game-controller',
          Home: 'home',
          Favorites: 'heart',
          Profile: 'person',
        };

        const isCenter = route.name === 'Home';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tab, isCenter && styles.centerTab]}
            activeOpacity={0.8}
          >
            {isCenter ? (
              <View style={styles.centerButton}>
                <Ionicons name={iconMap[route.name] || 'ellipse'} size={24} color="#1B1B1B" />
              </View>
            ) : (
              <>
                <Ionicons
                  name={iconMap[route.name] || 'ellipse'}
                  size={20}
                  color={isFocused ? colors.accent : colors.textSecondary}
                />
                <Text style={[styles.label, { color: isFocused ? colors.accent : colors.textSecondary }]} numberOfLines={1}>
                  {String(label)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0B2430',
    borderTopColor: '#173948',
    borderTopWidth: Platform.select({ ios: 0.5, android: 0.8 }) as number,
    paddingVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
  centerTab: {
    position: 'relative',
    top: -18,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

