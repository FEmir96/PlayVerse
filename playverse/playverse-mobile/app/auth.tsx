import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import LoginScreen from './login';
import RegisterScreen from './register';

export default function AuthScreen() {
  const cs = useColorScheme();
  const colors = Colors[cs ?? 'light'];
  const router = useRouter();
  const [screen, setScreen] = useState<'login' | 'register'>('login');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={require('@/assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
        <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
          <Ionicons name="home-outline" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>
      {screen === 'login'
        ? <LoginScreen onSwitchToRegister={() => setScreen('register')} showHeader={false} />
        : <RegisterScreen onSwitchToLogin={() => setScreen('login')} showHeader={false} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  logoImage: { width: 90, height: 30 },
  homeButton: { padding: 8 }
});
