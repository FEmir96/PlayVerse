import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { colors, spacing, typography, radius } from '../styles/theme';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const { profile, loading, error, loginEmail, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!profile) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={styles.title}>PERFIL</Text>
        <Text style={styles.subtitle}>Accedé a tu cuenta o registrate</Text>

        {/* Login / Registro según modo */}
        <View style={styles.card}>
          {mode === 'register' && (
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={colors.textSecondary} style={styles.input} />
            </View>
          )}
          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="tu@email.com" placeholderTextColor={colors.textSecondary} style={styles.input} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Tu contraseña" placeholderTextColor={colors.textSecondary} style={styles.input} />
          </View>

          {error && <Text style={{ color: '#ff7675' }}>{error}</Text>}
          {mode === 'login' ? (
            <Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={() => loginEmail(email, password)} />
          ) : (
            <Button title={loading ? 'Registrando...' : 'Registrarse'} onPress={() => register(name, email, password)} />
          )}

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <Button title={mode === 'login' ? 'Ir a registro' : 'Ir a login'} variant="ghost" onPress={() => setMode(mode === 'login' ? 'register' : 'login')} />
          </View>
        </View>

        {/* Social Login (abre web) */}
        <View style={styles.card}>
          <Text style={styles.faqTitle}>Ingresar con</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button title="Google" variant="ghost" onPress={() => openWebAuth('google')} />
            <Button title="Xbox" variant="ghost" onPress={() => openWebAuth('microsoft')} />
          </View>
          <Text style={styles.helper}>Se abrirá la web. Luego podemos cerrar el círculo con deep link.</Text>
        </View>

        <FAQ />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.xl }}>
      <Text style={styles.title}>PERFIL</Text>
      <Text style={styles.subtitle}>Edita tu perfil de gamer</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre de usuario:</Text>
        <Text style={styles.value}>{profile.name || '—'}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{profile.email}</Text>
        <Button title="Cerrar sesión" variant="ghost" style={{ alignSelf: 'flex-start', marginTop: spacing.md }} onPress={logout} />
      </View>

      <FAQ />
    </ScrollView>
  );
}

function FAQ() {
  return (
    <View style={styles.faq}>
      <Text style={styles.faqTitle}>Preguntas frecuentes</Text>
      <Text style={styles.faqItem}>¿Cómo funciona el alquiler de juegos?</Text>
      <Text style={styles.faqItem}>¿Qué incluye la membresía Premium?</Text>
      <Text style={styles.faqItem}>¿Puedo cancelar mi suscripción?</Text>
      <Button title="Contacto" variant="ghost" style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
    </View>
  );
}

function openWebAuth(provider: 'google' | 'microsoft') {
  // Simple helper to open the web auth page. We'll wire deep links later.
  // If you want deep link, set app.config.js "scheme: 'playverse'" (already set)
  // and add a callback param to your web login page to redirect back to playverse://auth.
  const base = (Constants.expoConfig?.extra as any)?.webAuthUrl || 'http://localhost:3000';
  const url = `${base}/auth/login?provider=${provider}`;
  // Lazy require to avoid import cost at startup.
  const WebBrowser = require('expo-web-browser');
  WebBrowser.openBrowserAsync(url);
}

const styles = StyleSheet.create({
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    gap: 6,
  },
  input: {
    backgroundColor: '#0B2430',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  label: {
    color: colors.textSecondary,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  faq: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  faqTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  faqItem: {
    color: colors.textSecondary,
    marginTop: 4,
  },
});
