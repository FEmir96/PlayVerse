import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius, spacing, typography, shadows } from '../styles/theme';

type Props = {
  onPress?: () => void;
};

// Gradient CTA banner used in Home to invite users to Premium.
export default function PremiumBanner({ onPress }: Props) {
  return (
    <LinearGradient
      colors={['#6D5EF6', '#7A4DF3', '#25C2D3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={{ gap: 6 }}>
        <Text style={styles.title}>\u00BFListo para una experiencia premium?</Text>
        <Text style={styles.body}>
          Cat\u00E1logo ilimitado, descuentos exclusivos, cero publicidad y mucho m\u00E1s.
        </Text>
        <Text onPress={onPress} style={styles.cta}>
          Hazte Premium \u2192
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  body: {
    color: colors.accent,
    opacity: 0.9,
    fontSize: typography.body,
  },
  cta: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: '800',
  },
});
