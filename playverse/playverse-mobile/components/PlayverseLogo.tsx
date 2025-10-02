import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface PlayverseLogoProps {
  size?: 'small' | 'medium' | 'large';
  showIcons?: boolean;
}

export default function PlayverseLogo({ size = 'medium', showIcons = true }: PlayverseLogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { logoSize: 24, iconSize: 8, textSize: 16 };
      case 'large':
        return { logoSize: 40, iconSize: 12, textSize: 24 };
      default:
        return { logoSize: 32, iconSize: 10, textSize: 20 };
    }
  };

  const { logoSize, iconSize, textSize } = getSizeStyles();

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
        <Text style={[styles.logoText, { fontSize: textSize, color: colors.background }]}>PV</Text>
        {showIcons && (
          <View style={styles.decorativeIcons}>
            <Ionicons name="leaf" size={iconSize} color="#10B981" style={styles.leafIcon} />
            <Ionicons name="game-controller" size={iconSize + 2} color={colors.secondary} style={styles.controllerIcon} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: '#FDC700',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontWeight: 'bold',
    zIndex: 2,
  },
  decorativeIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leafIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  controllerIcon: {
    position: 'absolute',
    bottom: 2,
    left: 2,
  },
});



