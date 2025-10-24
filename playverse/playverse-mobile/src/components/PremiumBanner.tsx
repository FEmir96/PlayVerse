import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <Pressable
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.textStack}>
          <Text style={styles.title}>¿Listo para una experiencia premium?</Text>
          <Text style={styles.body}>
            Catálogo ilimitado, descuentos exclusivos, cero publicidad y mucho más.
          </Text>
          <Text style={styles.cta}>Hazte Premium</Text>
        </View>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadows.card,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  textStack: {
    gap: spacing.xs,
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
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
