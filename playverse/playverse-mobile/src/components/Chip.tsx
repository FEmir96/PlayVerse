import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function Chip({ label, selected, onPress, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.base, selected ? styles.sel : styles.unsel, style]}
    >
      <Text style={[styles.text, selected ? styles.textSel : styles.textUnsel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  sel: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unsel: {
    backgroundColor: 'transparent',
    borderColor: colors.surfaceBorder,
  },
  text: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  textSel: { color: '#1B1B1B' },
  textUnsel: { color: colors.textSecondary },
});

