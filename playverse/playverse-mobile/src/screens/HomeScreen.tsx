import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography } from '../styles/theme';
import { Button, GameCard, PremiumBanner } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game, UpcomingGame } from '../types/game';
import type { RootStackParamList } from '../navigation/AppNavigator';

const bgStars = require('../../assets/images/rob2.png');
const logo = require('../../assets/images/playverse-logo.png');

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.xl * 2 - spacing.md) / 2;

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: allGames, loading: loadingAll, refetch: refetchAll } = useConvexQuery<Game[]>(
    'queries/getGames:getGames',
    {},
    { refreshMs: 15000 }
  );

  const { data: upcoming, loading: loadingUpcoming, refetch: refetchUpcoming } = useConvexQuery<UpcomingGame[]>(
    'queries/getUpcomingGames:getUpcomingGames',
    { limit: 6 },
    { refreshMs: 30000 }
  );

  const newest = useMemo(() => {
    const list = (allGames ?? []).slice();
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list.slice(0, 6);
  }, [allGames]);

  const refreshing = !!(loadingAll || loadingUpcoming);
  const onRefresh = () => {
    refetchAll();
    refetchUpcoming();
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <ImageBackground source={bgStars} style={styles.hero} resizeMode="cover">
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heroTitle}>PLAYVERSE</Text>
          <Text style={styles.heroSubtitle}>
            Explora, descubre y juega. Catalogo en crecimiento con clasicos y nuevas joyas.
          </Text>
          <Button title="Explorar" variant="primary" />
        </View>
      </ImageBackground>

      <Section title="Nuevos juegos" subtitle="Explora la coleccion. Encuentra tu proxima aventura!">
        <View style={styles.grid}>
          {newest.map((game: any, index) => (
            <GameCard
              key={String(game._id ?? index)}
              game={{
                id: String(game._id ?? index),
                title: game.title,
                cover_url: game.cover_url,
                weeklyPrice: game.weeklyPrice,
                purchasePrice: game.purchasePrice,
                igdbRating: game.igdbRating,
                createdAt: game.createdAt,
                description: game.description,
              }}
              tag={index < 2 ? 'Accion' : undefined}
              style={{ width: CARD_WIDTH }}
              onPress={() => game._id && navigation.navigate('GameDetail', { gameId: String(game._id) })}
            />
          ))}
        </View>
        <View style={styles.ctaRow}>
          <Button title="Ver todo" variant="ghost" />
        </View>
      </Section>

      <Section title="Proximamente">
        <View style={styles.grid}>
          {(upcoming ?? []).map((item: any, index) => (
            <GameCard
              key={String(item.id ?? index)}
              game={item as any}
              tag="Pronto"
              style={{ width: CARD_WIDTH }}
              onPress={() => item.gameId && navigation.navigate('GameDetail', { gameId: String(item.gameId) })}
            />
          ))}
        </View>
      </Section>

      <View style={{ paddingHorizontal: spacing.xl }}>
        <PremiumBanner />
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
    gap: spacing.sm,
  },
  logo: {
    width: 96,
    height: 42,
  },
  heroTitle: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '900',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  ctaRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
