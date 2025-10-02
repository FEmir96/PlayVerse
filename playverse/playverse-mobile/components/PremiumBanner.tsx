import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PremiumBanner() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.premiumGradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.1 }}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.white }]}>
            ¿Listo para una experiencia premium?
          </Text>
          <Text style={[styles.subtitle, { color: colors.white }]}>
            Catálogo ilimitado, descuentos exclusivos, cero publicidad y mucho más
          </Text>
          <Text style={[styles.cta, { color: colors.white }]}>
            ¡Accede desde la web para ver planes, beneficios y hacerte premium!
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 36,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.9,
  },
  cta: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});


