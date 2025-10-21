import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { GameCard, SearchBar, Chip, Button } from '../components';
import { useConvexQuery } from '../lib/useConvexQuery';
import type { Game } from '../types/game';

const { width } = Dimensions.get('window');
const CARD_W = (width - (spacing.xl * 2) - spacing.md) / 2;

const CATEGORIES = ['Todos', 'Acción', 'RPG', 'Carreras'];

export default function CatalogScreen() {
  const { data: allGames, loading, refetch } = useConvexQuery<Game[]>('queries/getGames:getGames', {}, { refreshMs: 20000 });
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');

  const filtered = useMemo(() => {
    let list = (allGames ?? []).slice();
    if (q.trim()) list = list.filter(g => g.title.toLowerCase().includes(q.trim().toLowerCase()));
    if (cat !== 'Todos') list = list.filter(g => (g.genres || []).some(x => x?.toLowerCase().includes(cat.toLowerCase())));
    // grid ordering by createdAt desc as a reasonable default
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return list;
  }, [allGames, q, cat]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshControl={<RefreshControl refreshing={!!loading} onRefresh={refetch} tintColor={colors.accent} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>CATÁLOGO DE JUEGOS</Text>
        <Text style={styles.subtitle}>¡Sumérgete en el PlayVerse! Encuentra tu próxima obsesión.</Text>
      </View>

      <View style={styles.controls}>
        <SearchBar value={q} onChangeText={setQ} />
        <View style={styles.chipsRow}>
          {CATEGORIES.map(c => (
            <Chip key={c} label={c} selected={c === cat} onPress={() => setCat(c)} />
          ))}
        </View>
      </View>

      {filtered.length === 0 && !loading ? (
        <View style={styles.empty}><Text style={styles.subtitle}>No se encontraron juegos.</Text></View>
      ) : (
        <View style={styles.gridTwo}>
          {filtered.map((g, i) => (
            <GameCard key={g.id ?? String(i)} game={g} style={{ width: CARD_W }} />
          ))}
        </View>
      )}

      <View style={{ alignItems: 'center', padding: spacing.xl }}>
        <Button title="Cargar más" variant="ghost" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.accent,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  controls: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  empty: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
