import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { colors, spacing, typography } from '../styles/theme';
import { convexHttp } from '../lib/convexClient';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/AppNavigator';

export default function AuthCallbackScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const { setFromProfile } = useAuth();
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
    const run = async () => {
      try {
        // Get URL from navigation state (React Navigation will route here on playverse://auth)
        const url = await Linking.getInitialURL();
        const current = url ?? '';
        const { queryParams } = Linking.parse(current);
        const email = String(queryParams?.email || '').toLowerCase();
        const name = String(queryParams?.name || '');
        const avatar = String(queryParams?.avatar || '');
        const provider = String(queryParams?.provider || 'web');

        if (!email) {
          setMessage('No se recibió email en el callback.');
          return;
        }

        // Upsert profile via OAuth and then fetch the full profile
        const upsert: any = await (convexHttp as any).mutation('auth:oauthUpsert', {
          email,
          name,
          avatarUrl: avatar,
          provider,
        });
        const id = upsert?._id;
        if (!id) {
          setMessage('No se pudo crear/actualizar el perfil.');
          return;
        }
        const prof: any = await (convexHttp as any).query('queries/getUserById:getUserById', { id });
        if (!prof) {
          setMessage('No se pudo recuperar el perfil.');
          return;
        }
        setFromProfile({
          _id: String(prof._id),
          name: prof.name || '',
          email: prof.email,
          role: prof.role,
          createdAt: prof.createdAt,
        });
        setMessage('¡Autenticado! Redirigiendo...');
        nav.navigate('Tabs');
      } catch (e) {
        setMessage('Error durante la autenticación');
      }
    };
    run();
  }, [nav, setFromProfile]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  msg: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
});

