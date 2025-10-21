import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import SectionHeader from '@/components/SectionHeader';
import GameCard from '@/components/GameCard';
import PremiumBanner from '@/components/PremiumBanner';

export default function HomeTab() {
  const games = [
    { title: 'Tomb Raider', genre: 'Acción', rating: 4.5 },
    { title: 'Hades', genre: 'Roguelike', rating: 4.8 },
    { title: 'Forza', genre: 'Carreras', rating: 4.3 },
    { title: 'Celeste', genre: 'Plataformas', rating: 4.7 }
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroBanner />
        <SectionHeader title="Recomendados" subtitle="elige tu próxima aventura" />
        <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
          {games.map((g, i) => (
            <View key={i} style={{ marginRight: 12 }}>
              <GameCard
                title={g.title}
                genre={g.genre}
                rating={g.rating}
                description="Descripción breve del juego."
                rentalPrice="$2,99/sem"
                purchasePrice="$19,99"
              />
            </View>
          ))}
        </ScrollView>
        <PremiumBanner />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1 }, row: { paddingHorizontal: 16, paddingBottom: 8 } });
