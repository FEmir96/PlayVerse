import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, Dimensions, RefreshControl } from 'react-native';
import { colors, radius, spacing, typography } from '../styles/theme';
import { Button, GameCard, PremiumBanner } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game, UpcomingGame } from '../types/game';

// Assets
const bgStars = require('../../assets/images/rob2.png'); // using available image as decorative background
const logo = require('../../assets/images/playverse-logo.png');

export default function HomeScreen() {
  // 1) Data: queries to Convex (HTTP polling for now)
  const { data: allGames, loading: loadingAll, refetch: refetchAll } = useConvexQuery<Game[]>(
    'queries/getGames:getGames',
    {},
    { refreshMs: 15000 }
  );

  const { data: upcoming, loading: loadingUp, refetch: refetchUp } = useConvexQuery<UpcomingGame[]>(
    'queries/getUpcomingGames:getUpcomingGames',
    { limit: 6 },
    { refreshMs: 30000 }
  );

  // 2) Derivados: nuevos por fecha
  const newest = useMemo(() => {
    const list = (allGames ?? []).slice();
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list.slice(0, 6);
  }, [allGames]);

  const refreshing = !!(loadingAll || loadingUp);
  const onRefresh = () => { refetchAll(); refetchUp(); };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Hero - cabecera con fondo, logo y CTA */}
      <ImageBackground source={bgStars} style={styles.hero} resizeMode="cover">
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>PLAYVERSE</Text>
          <Text style={styles.heroSubtitle}>
            Explora, descubre y juega. Catálogo en crecimiento con clásicos y nuevas joyas.
          </Text>
          <Button title="Explorar" variant="primary" />
        </View>
      </ImageBackground>

      {/* Nuevos juegos */}
      <Section title="Nuevos juegos" subtitle="Explora la colección. ¡Encuentra tu próxima aventura!">
        <GridTwo>
          {newest.map((g, i) => (
            <GameCard key={g.id ?? String(i)} game={g} tag={i < 2 ? 'Acción' : undefined} />
          ))}
        </GridTwo>
        <View style={{ alignItems: 'center', marginTop: spacing.md }}>
          <Button title="Ver todo" variant="ghost" />
        </View>
      </Section>

      {/* Próximamente */}
      <Section title="Próximamente">
        <GridTwo>
          {(upcoming ?? []).map((u, i) => (
            <GameCard key={u.id ?? String(i)} game={u as any} tag="Pronto" />
          ))}
        </GridTwo>
      </Section>

      {/* Premium CTA */}
      <View style={{ paddingHorizontal: spacing.xl }}>
        <PremiumBanner />
      </View>
    </ScrollView>
  );
}

// Section helper component to keep layout consistent and well commented
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

// Two-column grid for cards
function GridTwo({ children }: { children: React.ReactNode }) {
  return <View style={styles.gridTwo}>{children}</View>;
}

const { width } = Dimensions.get('window');
const CARD_W = (width - (spacing.xl * 2) - spacing.md) / 2; // paddings and gap

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 260,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,45,58,0.35)',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    width: 96,
    height: 42,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 1.2,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: typography.h2,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  gridTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  // Card override to impose two-column width
  card: {
    width: CARD_W,
  },
});
