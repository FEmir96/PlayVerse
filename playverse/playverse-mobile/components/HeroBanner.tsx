import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function HeroBanner() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleExplorePress = () => {
    router.push('/(tabs)/catalog');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.heroGradient}
        style={styles.gradient}
      >
        <View style={styles.backgroundElements}>
          {/* Hongo */}
          <Image 
            source={require('@/assets/images/hongo.png')} 
            style={[styles.decorativeImage, styles.mushroom]} 
            resizeMode="contain"
          />
          {/* Estrella */}
          <Image 
            source={require('@/assets/images/estrella.png')} 
            style={[styles.decorativeImage, styles.star1]} 
            resizeMode="contain"
          />
          {/* Moneda */}
          <Image 
            source={require('@/assets/images/moneda.png')} 
            style={[styles.decorativeImage, styles.bot1]} 
            resizeMode="contain"
          />
          {/* Control */}
          <Image 
            source={require('@/assets/images/control.png')} 
            style={[styles.decorativeImage, styles.gamepad]} 
            resizeMode="contain"
          />
          {/* Robot 1 */}
          <Image 
            source={require('@/assets/images/rob1.png')} 
            style={[styles.decorativeImage, styles.coin]} 
            resizeMode="contain"
          />
          {/* Robot 2 */}
          <Image 
            source={require('@/assets/images/rob2.png')} 
            style={[styles.decorativeImage, styles.bot2]} 
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.secondary }]}>PLAYVERSE</Text>
          <Text style={[styles.subtitle, { color: colors.white }]}>
            Bienvenido al universo de los videojuegos. Alquila o compra tus favoritos en un solo lugar.
          </Text>
          <TouchableOpacity 
            style={[styles.exploreButton, { backgroundColor: colors.accent }]}
            onPress={handleExplorePress}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>Explorar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeImage: {
    position: 'absolute',
  },
  mushroom: {
    width: 30,
    height: 30,
    top: 40,
    right: 60,
  },
  star1: {
    width: 20,
    height: 20,
    top: 90,
    right: 20,
  },
  coin: {
    width: 20,
    height: 20,
    top: 160,
    right: 80,
  },
  gamepad: {
    width: 32,
    height: 24,
    top: 60,
    left: 40,
  },
  bot1: {
    width: 20,
    height: 20,
    top: 170,
    left: 80,
  },
  bot2: {
    width: 28,
    height: 28,
    top: 130,
    left: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
