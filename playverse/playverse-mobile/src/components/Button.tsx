import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

type Variant = 'primary' | 'ghost';

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

// Small reusable button that fits PlayVerse brand.
// - primary: filled with accent color
// - ghost: transparent, accent border
export default function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, isPrimary ? styles.primary : styles.ghost, disabled && { opacity: 0.6 }, style]}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  ghost: {
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  textPrimary: {
    color: '#1B1B1B',
  },
  textGhost: {
    color: colors.accent,
  },
});
