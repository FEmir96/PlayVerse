import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import Header from '@/components/Header';
import SectionHeader from '@/components/SectionHeader';
import GameCard from '@/components/GameCard';

export default function CatalogTab() {
  const list = Array.from({ length: 8 }).map((_, i) => ({
    title: `Juego ${i + 1}`,
    genre: ['Acción', 'RPG', 'Aventura', 'Estrategia'][i % 4],
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10
  }));

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Catálogo" subtitle="explora todos los juegos" />
        <View style={styles.grid}>
          {list.map((g, i) => (
            <View key={i} style={styles.gridItem}>
              <GameCard
                title={g.title}
                genre={g.genre}
                rating={g.rating}
                description="Un gran juego para tu colección."
                rentalPrice="$2,99/sem"
                purchasePrice="$19,99"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 20 },
  gridItem: { width: '50%', padding: 4 }
});
