import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import LoginScreen from './login';
import RegisterScreen from './register';

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  const handleBackToHome = () => {
    router.back();
  };

  const switchToLogin = () => {
    setCurrentScreen('login');
  };

  const switchToRegister = () => {
    setCurrentScreen('register');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/playverse-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleBackToHome}
        >
          <Ionicons name="home-outline" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentScreen === 'login' ? (
        <LoginScreen 
          onSwitchToRegister={switchToRegister}
          showHeader={false}
        />
      ) : (
        <RegisterScreen 
          onSwitchToLogin={switchToLogin}
          showHeader={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 90,
    height: 30,
    padding: 2,
  },
  homeButton: {
    padding: 8,
  },
});
