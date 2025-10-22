import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Image } from 'react-native';

import { colors, spacing, typography, radius } from '../styles/theme';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../context/AuthContext';
import { useConvexQuery } from '../lib/useConvexQuery';
import { resolveAssetUrl } from '../lib/asset';
import { signInWithGoogleNative, signInWithMicrosoftNative } from '../auth/nativeOAuth';

const PLAN_LABEL: Record<string, string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  annual: 'Anual',
  lifetime: 'De por vida',
};

function formatDate(epoch?: number) {
  if (!epoch) return '-';
  try {
    return new Date(epoch).toLocaleDateString();
  } catch {
    return '-';
  }
}

export default function ProfileScreen() {
  const { profile, loading, error, loginEmail, register, logout, setFromProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const userId = profile?._id;

  const { data: fullProfile } = useConvexQuery<any>(
    'queries/getUserById:getUserById',
    userId ? { id: userId } : ({} as any),
    { enabled: !!userId, refreshMs: 45000 }
  );

  const { data: upgrades } = useConvexQuery<any[]>(
    'queries/getUserUpgrades:getUserUpgrades',
    userId ? { userId } : ({} as any),
    { enabled: !!userId, refreshMs: 30000 }
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

  useEffect(() => {
    if (!profile || !fullProfile?._id) return;
    const normalizedEmail = (fullProfile.email || profile?.email || "").toLowerCase();
    const name = fullProfile.name ?? profile?.name ?? "";
    const role = fullProfile.role ?? profile?.role ?? "free";
    const createdAt = fullProfile.createdAt ?? profile?.createdAt ?? Date.now();
    const hasDiff =
      !profile ||
      profile.name !== name ||
      profile.role !== role ||
      (profile.email || "").toLowerCase() !== normalizedEmail;

    if (hasDiff) {
      setFromProfile({
        _id: String(fullProfile._id),
        name,
        email: normalizedEmail || profile?.email || "",
        role: role as any,
        createdAt,
      });
    }
  }, [fullProfile, profile, setFromProfile]);

  const currentPlan = useMemo(() => {
    if (!profile) return undefined;
    if (upgrades && upgrades.length) return upgrades[0];
    if (profile.role === 'premium') {
      return { plan: 'premium', status: 'active', effectiveAt: profile.createdAt };
    }
    return undefined;
  }, [profile, upgrades]);

  const avatarUri = resolveAssetUrl((fullProfile as any)?.avatarUrl || (profile as any)?.avatarUrl);

  if (!profile) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.authContainer}>
        <View style={styles.branding}>
          <Text style={styles.title}>PLAYVERSE</Text>
          <Text style={styles.subtitle}>Accede a tu cuenta o registrate</Text>
        </View>

        <View style={styles.card}>
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Tu contraseña"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === 'login' ? (
            <Button title={loading ? 'Ingresando...' : 'Ingresar'} onPress={() => loginEmail(email, password)} />
          ) : (
            <Button title={loading ? 'Registrando...' : 'Registrarse'} onPress={() => register(name, email, password)} />
          )}

          <Button
            title={mode === 'login' ? 'Ir a registro' : 'Ir a login'}
            variant="ghost"
            style={styles.switchButton}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          />
        </View>

        <View style={styles.card}>
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
                const prof: any = await (convexHttp as any).query('queries/getUserByEmail:getUserByEmail', { email: res.email });
                if (prof) {
                  setFromProfile({ _id: String(prof._id), name: prof.name || '', email: prof.email, role: prof.role, createdAt: prof.createdAt });
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
                const prof: any = await (convexHttp as any).query('queries/getUserByEmail:getUserByEmail', { email: res.email });
                if (prof) {
                  setFromProfile({ _id: String(prof._id), name: prof.name || '', email: prof.email, role: prof.role, createdAt: prof.createdAt });
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

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.profileContainer}>
      <Text style={styles.title}>PERFIL</Text>
      <Text style={styles.subtitle}>Tu información personal y actividad reciente.</Text>

      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>PV</Text>
            )}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.value}>{fullProfile?.name || profile.name || 'Jugador'}</Text>
            <Text style={styles.label}>{profile.email}</Text>
          </View>
        </View>
        <Button title="Cerrar sesion" variant="ghost" style={{ alignSelf: 'flex-start' }} onPress={logout} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Plan y suscripción</Text>
        <Text style={styles.label}>Rol actual: {profile.role}</Text>
        <Text style={styles.label}>
          Plan actual: {currentPlan?.plan ? PLAN_LABEL[currentPlan.plan] ?? currentPlan.plan : 'Free'}
        </Text>
        <Text style={styles.label}>Estado: {currentPlan?.status ?? (profile.role === 'premium' ? 'Activo' : 'Free')}</Text>
        <Text style={styles.label}>Desde: {formatDate(currentPlan?.effectiveAt)}</Text>
        {currentPlan?.expiresAt ? <Text style={styles.label}>Vence: {formatDate(currentPlan.expiresAt)}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Metodos de pago</Text>
        {(paymentMethods ?? []).length === 0 ? (
          <Text style={styles.label}>No tienes metodos guardados.</Text>
        ) : (
          (paymentMethods ?? []).map((pm: any) => (
            <View key={String(pm._id)} style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{(pm.brand || '??').slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.label}>{pm.brand?.toUpperCase()} · **** {pm.last4}</Text>
              <Text style={styles.helper}>Exp {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Historial de pagos</Text>
        {(payments ?? []).slice(0, 5).map((pay: any) => (
          <View key={String(pay._id)} style={styles.paymentRow}>
            <Text style={styles.label}>${pay.amount.toFixed(2)} · {pay.currency?.toUpperCase?.() ?? 'USD'}</Text>
            <Text style={styles.helper}>{formatDate(pay.createdAt)}</Text>
          </View>
        ))}
        {(payments ?? []).length === 0 ? <Text style={styles.label}>Aun sin movimientos.</Text> : null}
      </View>

      <View style={styles.listRow}>
        <View style={[styles.card, styles.listCol]}>
          <Text style={styles.sectionHeading}>Juegos comprados</Text>
          {(purchases ?? []).slice(0, 6).map((row: any) => (
            <GameRow
              key={String(row._id)}
              title={row.title || row.game?.title}
              cover={row.cover_url || row.game?.cover_url}
              note={`Comprado el ${formatDate(row.createdAt)}`}
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
              note={row.expiresAt ? `Expira ${formatDate(row.expiresAt)}` : ''}
            />
          ))}
          {(rentals ?? []).length === 0 ? <Text style={styles.label}>Sin alquileres.</Text> : null}
        </View>
      </View>

      <FAQ />
    </ScrollView>
  );
}

function GameRow({ title, cover, note }: { title?: string; cover?: string; note?: string }) {
  const uri = resolveAssetUrl(cover);
  return (
    <View style={styles.gameRow}>
      {uri ? <Image source={{ uri }} style={styles.gameCover} /> : <View style={[styles.gameCover, styles.coverFallback]} />}
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
      <Text style={styles.label}>¿Como funciona el alquiler de juegos?</Text>
      <Text style={styles.label}>¿Que incluye la membresia Premium?</Text>
      <Text style={styles.label}>¿Puedo cancelar mi suscripcion?</Text>
      <Button title="Contacto" variant="ghost" style={{ alignSelf: 'flex-start', marginTop: spacing.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  authContainer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  profileContainer: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  branding: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '700',
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
  error: {
    color: '#ff7675',
  },
  switchButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: typography.h3,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0B2430',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
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
  listRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  listCol: {
    flex: 1,
    minWidth: 280,
  },
  gameRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  gameCover: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: '#0F2D3A',
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


