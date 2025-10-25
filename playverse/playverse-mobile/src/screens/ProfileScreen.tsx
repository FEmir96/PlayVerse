import React, { useCallback, useEffect, useMemo, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, radius } from '../styles/theme';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import { resolveAssetUrl } from '../lib/asset';
import { signInWithGoogleNative, signInWithMicrosoftNative } from '../auth/nativeOAuth';
import type { RootStackParamList } from '../navigation/AppNavigator';

const ROLE_CHIP_STYLES: Record<
  string,
  { label: string; pill: { backgroundColor: string; borderColor: string }; text: string }
> = {
  free: {
    label: 'Free',
    pill: { backgroundColor: '#1B2F3B', borderColor: '#A4C9D3' },
    text: '#D9E7EF',
  },
  premium: {
    label: 'Premium',
    pill: { backgroundColor: '#F2B70522', borderColor: '#F2B705' },
    text: colors.accent,
  },
  admin: {
    label: 'Admin',
    pill: { backgroundColor: '#2D1D49', borderColor: '#A855F7' },
    text: '#D8B4FE',
  },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FieldErrors = { name?: string; email?: string; password?: string };

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, loading, error, loginEmail, register, logout, setFromProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [avatarModal, setAvatarModal] = useState(false);

  // Oculta el header del Stack para no duplicar nada (usamos header propio sin texto)
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const userId = profile?._id;

  const { data: fullProfile } = useConvexQuery<any>(
    'queries/getUserById:getUserById',
    userId ? { id: userId } : ({} as any),
    { enabled: !!userId, refreshMs: 45000 }
  );

  const { data: paymentMethods } = useConvexQuery<any[]>(
    'queries/getPaymentMethods:getPaymentMethods',
    { userId },
    { enabled: !!userId, refreshMs: 45000 }
  );

  const { data: payments } = useConvexQuery<any[]>(
    'queries/getUserPayments:getUserPayments',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 60000 }
  );

  const { data: purchases } = useConvexQuery<any[]>(
    'queries/getUserPurchases:getUserPurchases',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 45000 }
  );

  const { data: rentals } = useConvexQuery<any[]>(
    'queries/getUserRentals:getUserRentals',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 45000 }
  );

  const { data: notifications } = useConvexQuery<any[]>(
    'notifications:getForUser',
    userId ? { userId, limit: 20 } : ({} as any),
    { enabled: !!userId, refreshMs: 20000 }
  );

  const unreadCount = useMemo(
    () => (notifications ?? []).filter((n: any) => n?.isRead === false).length,
    [notifications]
  );

  useEffect(() => {
    setFieldErrors({});
  }, [mode]);

  const validateForm = useCallback(() => {
    const errors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      errors.email = 'Ingresa tu email.';
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = 'Ingresa un email válido.';
    }

    if (!trimmedPassword) {
      errors.password = 'Ingresa tu contraseña.';
    } else if (trimmedPassword.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (mode === 'register') {
      if (!trimmedName) {
        errors.name = 'Ingresa tu nombre.';
      } else if (trimmedName.length < 2) {
        errors.name = 'El nombre es demasiado corto.';
      }
    }

    return {
      errors,
      values: {
        name: trimmedName,
        email: normalizedEmail,
        password: trimmedPassword,
      },
    };
  }, [email, password, name, mode]);

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    const { errors, values } = validateForm();
    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setEmail(values.email);
    if (mode === 'register') setName(values.name);

    const ok =
      mode === 'login'
        ? await loginEmail(values.email, values.password)
        : await register(values.name, values.email, values.password);

    if (ok) setPassword('');
  }, [loading, mode, validateForm, loginEmail, register]);

  // Mantén el perfil del contexto alineado con el fullProfile cuando llegue
  useEffect(() => {
    if (!profile || !fullProfile?._id) return;
    if (String(fullProfile._id) !== profile._id) return;

    const normalizedEmail = (fullProfile.email || profile.email || '').toLowerCase();
    const name = fullProfile.name ?? profile.name ?? '';
    const role = fullProfile.role ?? profile.role ?? 'free';
    const createdAt = fullProfile.createdAt ?? profile.createdAt ?? Date.now();

    const hasDiff =
      profile.name !== name ||
      profile.role !== role ||
      (profile.email || '').toLowerCase() !== normalizedEmail;

    if (hasDiff) {
      setFromProfile({
        _id: String(fullProfile._id),
        name,
        email: normalizedEmail || profile.email || '',
        role: role as any,
        createdAt,
      });
    }
  }, [fullProfile, profile, setFromProfile]);

  const avatarUri = resolveAssetUrl((fullProfile as any)?.avatarUrl || (profile as any)?.avatarUrl);
  const roleChip = ROLE_CHIP_STYLES[profile?.role ?? 'free'];

  // Header propio (logo PV centrado, SIN título)
  const HeaderBar = (
    <View style={styles.headerBar}>
      <Pressable
        onPress={() => navigation.navigate('Tabs' as any, { screen: 'Home' } as any)}
        style={styles.iconButton}
      >
        <Ionicons name="arrow-back" size={18} color={colors.accent} />
      </Pressable>

      <View style={styles.centerLogoWrap}>
        <Image
          source={require('../../assets/branding/pv-logo-h28.png')}
          style={styles.centerLogo}
          resizeMode="contain"
        />
      </View>

      <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={18} color={colors.accent} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{Math.min(unreadCount, 9)}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );

  // ----- SIN SESIÓN -----
  if (!profile) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.authContainer}>
        {HeaderBar}

        <View style={styles.branding}>
          <Text style={styles.heroTitle}>Accede a tu cuenta o regístrate</Text>
        </View>

        <View style={styles.card}>
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Tu nombre"
                placeholderTextColor={colors.accent}
                style={styles.input}
              />
              {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor={colors.accent}
              style={styles.input}
            />
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              secureTextEntry
              placeholder="Tu contraseña"
              placeholderTextColor={colors.accent}
              style={styles.input}
            />
            {fieldErrors.password ? (
              <Text style={styles.fieldError}>{fieldErrors.password}</Text>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={mode === 'login' ? (loading ? 'Ingresando...' : 'Ingresar') : loading ? 'Registrando...' : 'Registrarse'}
            onPress={handleSubmit}
          />

          <Button
            title={mode === 'login' ? 'Ir a registro' : 'Ir a login'}
            variant="ghost"
            style={styles.switchButton}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          />
        </View>

        <View className="card">
          <Text style={styles.sectionHeading}>Ingresar con</Text>
          <SocialButton
            provider="google"
            onPress={async () => {
              const res = await signInWithGoogleNative();
              if (!res.ok || !res.email) {
                Alert.alert('Login con Google', res.error || 'No se pudo completar.');
                return;
              }
              try {
                const { convexHttp } = require('../lib/convexClient');
                const prof: any = await (convexHttp as any).query(
                  'queries/getUserByEmail:getUserByEmail',
                  { email: res.email }
                );
                if (prof) {
                  setFromProfile({
                    _id: String(prof._id),
                    name: prof.name || '',
                    email: prof.email,
                    role: prof.role,
                    createdAt: prof.createdAt,
                  });
                }
              } catch (e: any) {
                Alert.alert('Convex', e?.message || 'No se pudo actualizar el perfil.');
              }
            }}
          />
          <View style={{ height: spacing.sm }} />
          <SocialButton
            provider="microsoft"
            onPress={async () => {
              const res = await signInWithMicrosoftNative();
              if (!res.ok || !res.email) {
                Alert.alert('Login con Microsoft', res.error || 'No se pudo completar.');
                return;
              }
              try {
                const { convexHttp } = require('../lib/convexClient');
                const prof: any = await (convexHttp as any).query(
                  'queries/getUserByEmail:getUserByEmail',
                  { email: res.email }
                );
                if (prof) {
                  setFromProfile({
                    _id: String(prof._id),
                    name: prof.name || '',
                    email: prof.email,
                    role: prof.role,
                    createdAt: prof.createdAt,
                  });
                }
              } catch (e: any) {
                Alert.alert('Convex', e?.message || 'No se pudo actualizar el perfil.');
              }
            }}
          />
          <Text style={styles.helper}>Autenticación nativa sin abrir la web.</Text>
        </View>

        <FAQ />
      </ScrollView>
    );
  }

  // ----- CON SESIÓN -----
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.profileContainer}>
      {HeaderBar}

      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <Pressable style={styles.avatar} onPress={() => setAvatarModal(true)}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={{ color: colors.accent, fontWeight: '700' }}>PV</Text>
            )}
          </Pressable>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.value}>{fullProfile?.name || profile.name || 'Jugador'}</Text>
            <Text style={styles.label}>{profile.email}</Text>
          </View>
          <Button title="Cerrar sesión" variant="ghost" onPress={logout} />
        </View>
      </View>

      {/* Plan y suscripción (solo rol actual) */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Plan y suscripción</Text>
        <View style={styles.roleRow}>
          <Text style={styles.label}>Rol actual</Text>
          <View style={[styles.rolePill, roleChip.pill]}>
            <Text style={[styles.roleText, { color: roleChip.text }]}>{roleChip.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Alertas</Text>
        <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="notifications" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>Ver notificaciones</Text>
              <Text style={styles.helper}>
                {unreadCount > 0 ? `${unreadCount} pendientes` : 'Estás al día'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.accent} />
          </View>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Métodos de pago</Text>
        {(paymentMethods ?? []).length === 0 ? (
          <Text style={styles.label}>No tienes métodos guardados.</Text>
        ) : (
          (paymentMethods ?? []).map((pm: any) => (
            <View key={String(pm._id)} style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <Text style={{ color: colors.accent, fontWeight: '700' }}>
                  {(pm.brand || '??').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.label}>
                {pm.brand?.toUpperCase()} - **** {pm.last4}
              </Text>
              <Text style={styles.helper}>
                Exp {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.listRow}>
        <View style={[styles.card, styles.listCol]}>
          <Text style={styles.sectionHeading}>Juegos comprados</Text>
          {(purchases ?? []).slice(0, 6).map((row: any) => (
            <GameRow
              key={String(row._id)}
              title={row.title || row.game?.title}
              cover={row.cover_url || row.game?.cover_url}
              note={`Comprado el ${new Date(row.createdAt).toLocaleDateString?.() ?? '-'}`}
            />
          ))}
          {(purchases ?? []).length === 0 ? <Text style={styles.label}>Sin compras.</Text> : null}
        </View>

        <View style={[styles.card, styles.listCol]}>
          <Text style={styles.sectionHeading}>Juegos alquilados</Text>
          {(rentals ?? []).slice(0, 6).map((row: any) => (
            <GameRow
              key={String(row._id)}
              title={row.title || row.game?.title}
              cover={row.cover_url || row.game?.cover_url}
              note={row.expiresAt ? `Expira ${new Date(row.expiresAt).toLocaleDateString?.() ?? '-'}` : ''}
            />
          ))}
          {(rentals ?? []).length === 0 ? <Text style={styles.label}>Sin alquileres.</Text> : null}
        </View>
      </View>

      <FAQ />

      {/* Modal de avatar grande */}
      <Modal visible={avatarModal} animationType="fade" transparent onRequestClose={() => setAvatarModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAvatarModal(false)}>
          <View style={styles.modalCard}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.bigAvatar} />
            ) : (
              <View style={[styles.bigAvatar, styles.coverFallback]}>
                <Text style={{ color: colors.accent, fontWeight: '900', fontSize: 28 }}>PV</Text>
              </View>
            )}
            <Pressable style={styles.modalClose} onPress={() => setAvatarModal(false)}>
              <Ionicons name="close" size={20} color="#0B2430" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function GameRow({ title, cover, note }: { title?: string; cover?: string; note?: string }) {
  const uri = resolveAssetUrl(cover);
  return (
    <View style={styles.gameRow}>
      {uri ? (
        <Image source={{ uri }} style={styles.gameCover} />
      ) : (
        <View style={[styles.gameCover, styles.coverFallback]} />
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.gameTitle}>{title || 'Juego'}</Text>
        {note ? <Text style={styles.helper}>{note}</Text> : null}
      </View>
    </View>
  );
}

function FAQ() {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeading}>Preguntas frecuentes</Text>
      <Text style={styles.label}>¿Cómo funciona el alquiler de juegos?</Text>
      <Text style={styles.label}>¿Qué incluye la membresía Premium?</Text>
      <Text style={styles.label}>¿Puedo cancelar mi suscripción?</Text>
      <Button title="Contacto" variant="ghost" style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  authContainer: { paddingBottom: spacing.xxl, gap: spacing.md },
  profileContainer: { paddingBottom: spacing.xxl, gap: spacing.md },

  /* HEADER PROPIO (sin título, solo logo PV centrado) */
  headerBar: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#072633',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#0F2D3A',
  },
  centerLogoWrap: { flex: 1, alignItems: 'center' },
  centerLogo: { height: 28, width: 120 },

  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  branding: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  heroTitle: { color: colors.accent, fontSize: typography.h1, fontWeight: '900', textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  fieldGroup: { gap: 6, marginTop: 2 },
  label: { color: colors.accent, fontSize: typography.body },
  value: { color: colors.accent, fontSize: typography.h3, fontWeight: '700' },
  input: {
    backgroundColor: '#0B2430',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    color: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  error: { color: '#ff7675' },
  fieldError: { color: '#ff9191', fontSize: typography.caption, marginTop: 4 },
  switchButton: { alignSelf: 'flex-start', marginTop: spacing.sm },

  sectionHeading: { color: colors.accent, fontWeight: '800', fontSize: typography.h3 },
  helper: { color: colors.accent, fontSize: typography.caption },

  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0B2430',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0ea5b5',
    shadowColor: '#0ea5b5',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarImage: { width: '100%', height: '100%' },

  roleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rolePill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: '#1B2F3B',
    borderColor: '#A4C9D3',
  },
  roleText: { fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },

  notificationButton: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F2B70522',
  },
  notificationTitle: { color: colors.accent, fontWeight: '700' },

  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F2D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  listRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  listCol: { flex: 1, minWidth: 280 },
  gameRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  gameCover: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: '#0F2D3A' },
  coverFallback: { alignItems: 'center', justifyContent: 'center' },
  gameTitle: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  /* Modal avatar grande */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: '#0B2430',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#0ea5b5',
    shadowColor: '#0ea5b5',
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
  },
  bigAvatar: { width: 240, height: 240, borderRadius: 120 },
  modalClose: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F2B705',
    borderRadius: 14,
    padding: 6,
  },
});
