import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
  showHeader?: boolean;
}

export default function LoginScreen({ onSwitchToRegister, showHeader = true }: LoginScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <>
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
              onPress={() => router.back()}
            >
              <Ionicons name="home-outline" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.secondary }]}>PLAYVERSE</Text>
          <Text style={[styles.subtitle, { color: colors.white }]}>
            Únete y elige tu próxima aventura
          </Text>

          {/* Login Form */}
          <View style={[styles.formCard, { backgroundColor: colors.cardBackground, borderColor: colors.secondary }]}>
            <View style={styles.formHeader}>
              <Ionicons name="log-in" size={20} color={colors.secondary} />
              <Text style={[styles.formTitle, { color: colors.secondary }]}>Iniciar sesión</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="tu@email.com"
                placeholderTextColor={colors.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Contraseña</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="Tu contraseña"
                placeholderTextColor={colors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, { borderColor: rememberMe ? colors.secondary : colors.gray }]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color={colors.secondary} />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: colors.white }]}>Recordarme</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.forgotPassword, { color: colors.secondary }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.secondary }]}>
              <Ionicons name="log-in" size={20} color={colors.background} />
              <Text style={[styles.loginButtonText, { color: colors.background }]}>Ingresar</Text>
            </TouchableOpacity>

            <View style={styles.registerLink}>
              <Text style={[styles.registerText, { color: colors.white }]}>
                ¿No tienes una cuenta?{' '}
                <TouchableOpacity onPress={onSwitchToRegister || (() => router.replace('/register'))}>
                  <Text style={[styles.registerLinkText, { color: colors.secondary }]}>
                    Regístrate aquí
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  formCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerLinkText: {
    paddingTop: 10,
    fontWeight: 'bold',
  },
});


