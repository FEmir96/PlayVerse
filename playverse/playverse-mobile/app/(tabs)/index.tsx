import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Importar componentes
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import SectionHeader from '@/components/SectionHeader';
import GameCard from '@/components/GameCard';
import PremiumBanner from '@/components/PremiumBanner';
import GameDetailModal from '@/components/GameDetailModal';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  // Datos de ejemplo para los juegos
  const newGames = [
    {
      id: '1',
      title: 'Tomb Raider',
      genre: 'Acción',
      rating: 4.5,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$19,99',
    },
    {
      id: '2',
      title: 'Cyberpunk 2077',
      genre: 'RPG',
      rating: 4.2,
      description: 'Un RPG de mundo abierto ambientado en el futuro distópico',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$29,99',
    },
    {
      id: '3',
      title: 'The Witcher 3',
      genre: 'RPG',
      rating: 4.8,
      description: 'Una épica aventura de fantasía con Geralt de Rivia',
      rentalPrice: '$2,49/sem',
      purchasePrice: '$24,99',
    },
    {
      id: '4',
      title: 'Assassin\'s Creed Valhalla',
      genre: 'Acción',
      rating: 4.3,
      description: 'Vive la era vikinga en esta aventura de mundo abierto',
      rentalPrice: '$3,49/sem',
      purchasePrice: '$34,99',
    },
    {
      id: '5',
      title: 'Red Dead Redemption 2',
      genre: 'Aventura',
      rating: 4.7,
      description: 'Una historia épica del Salvaje Oeste americano',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$39,99',
    },
  ];

  const popularGames = [
    {
      id: '11',
      title: 'Call of Duty: Modern Warfare',
      genre: 'FPS',
      rating: 4.6,
      description: 'La guerra moderna en su máxima expresión',
      rentalPrice: '$4,99/sem',
      purchasePrice: '$59,99',
    },
    {
      id: '12',
      title: 'FIFA 24',
      genre: 'Deportes',
      rating: 4.4,
      description: 'El fútbol más realista del mundo',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$49,99',
    },
    {
      id: '13',
      title: 'Minecraft',
      genre: 'Aventura',
      rating: 4.8,
      description: 'Construye, explora y sobrevive en mundos infinitos',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$24,99',
    },
    {
      id: '14',
      title: 'Grand Theft Auto V',
      genre: 'Acción',
      rating: 4.7,
      description: 'Vive la vida criminal en Los Santos',
      rentalPrice: '$3,49/sem',
      purchasePrice: '$29,99',
    },
    {
      id: '15',
      title: 'Fortnite',
      genre: 'Battle Royale',
      rating: 4.3,
      description: 'Construye, lucha y sobrevive en el último juego en pie',
      rentalPrice: 'Gratis',
      purchasePrice: 'Gratis',
    },
  ];

  const topRatedGames = [
    {
      id: '16',
      title: 'The Legend of Zelda: Breath of the Wild',
      genre: 'Aventura',
      rating: 4.9,
      description: 'Una aventura épica en el reino de Hyrule',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$39,99',
    },
    {
      id: '17',
      title: 'The Witcher 3: Wild Hunt',
      genre: 'RPG',
      rating: 4.9,
      description: 'La mejor aventura de Geralt de Rivia',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$19,99',
    },
    {
      id: '18',
      title: 'Red Dead Redemption 2',
      genre: 'Aventura',
      rating: 4.8,
      description: 'Una historia épica del Salvaje Oeste',
      rentalPrice: '$3,49/sem',
      purchasePrice: '$34,99',
    },
    {
      id: '19',
      title: 'God of War',
      genre: 'Acción',
      rating: 4.8,
      description: 'La épica aventura de Kratos y su hijo',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$29,99',
    },
    {
      id: '20',
      title: 'Elden Ring',
      genre: 'RPG',
      rating: 4.9,
      description: 'Un mundo de fantasía oscura épico',
      rentalPrice: '$4,99/sem',
      purchasePrice: '$49,99',
    },
  ];

  const comingSoonGames = [
    {
      id: '6',
      title: 'Elden Ring',
      genre: 'RPG',
      rating: 4.9,
      description: 'Un mundo de fantasía oscura creado por FromSoftware',
      releaseDate: '15/08/2025',
    },
    {
      id: '7',
      title: 'God of War: Ragnarök',
      genre: 'Acción',
      rating: 4.6,
      description: 'Continúa la épica aventura de Kratos y Atreus',
      releaseDate: '22/09/2025',
    },
    {
      id: '8',
      title: 'Spider-Man 2',
      genre: 'Acción',
      rating: 4.4,
      description: 'Swing por Nueva York como el amigable vecino Spider-Man',
      releaseDate: '10/10/2025',
    },
    {
      id: '9',
      title: 'Horizon Forbidden West',
      genre: 'Aventura',
      rating: 4.5,
      description: 'Explora un mundo post-apocalíptico lleno de máquinas',
      releaseDate: '05/11/2025',
    },
    {
      id: '10',
      title: 'Final Fantasy XVI',
      genre: 'RPG',
      rating: 4.7,
      description: 'Una nueva entrega de la legendaria saga de Square Enix',
      releaseDate: '18/12/2025',
    },
  ];

  const handleGamePress = (game: any) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGame(null);
  };

  const handleSeeAllPress = () => {
    router.push('/(tabs)/catalog');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroBanner />
        
        {/* Sección Nuevos Juegos */}
        <SectionHeader
          title="Nuevos juegos"
          subtitle="Explora la colección. ¡Encuentra tu próxima aventura!"
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.gamesScrollView}
          contentContainerStyle={styles.gamesContainer}
        >
          {newGames.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              genre={game.genre}
              rating={game.rating}
              description={game.description}
              rentalPrice={game.rentalPrice}
              purchasePrice={game.purchasePrice}
              onPress={() => handleGamePress(game)}
              onFavorite={() => console.log('Favorite pressed:', game.title)}
            />
          ))}
        </ScrollView>

        {/* Sección Populares */}
        <SectionHeader
          title="Populares"
          subtitle="Los juegos más jugados esta semana"
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.gamesScrollView}
          contentContainerStyle={styles.gamesContainer}
        >
          {popularGames.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              genre={game.genre}
              rating={game.rating}
              description={game.description}
              rentalPrice={game.rentalPrice}
              purchasePrice={game.purchasePrice}
              onPress={() => handleGamePress(game)}
              onFavorite={() => console.log('Favorite pressed:', game.title)}
            />
          ))}
        </ScrollView>

        {/* Sección Mejor puntuados */}
        <SectionHeader
          title="Mejor puntuados"
          subtitle="Los juegos con las mejores calificaciones"
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.gamesScrollView}
          contentContainerStyle={styles.gamesContainer}
        >
          {topRatedGames.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              genre={game.genre}
              rating={game.rating}
              description={game.description}
              rentalPrice={game.rentalPrice}
              purchasePrice={game.purchasePrice}
              onPress={() => handleGamePress(game)}
              onFavorite={() => console.log('Favorite pressed:', game.title)}
            />
          ))}
        </ScrollView>

        {/* Botón Ver todo */}
        <View style={styles.seeAllContainer}>
          <TouchableOpacity 
            style={[styles.seeAllButton, { backgroundColor: colors.accent }]}
            onPress={handleSeeAllPress}
          >
            <Text style={[styles.seeAllButtonText, { color: colors.primary }]}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {/* Sección Próximamente */}
        <SectionHeader
          title="Próximamente"
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.gamesScrollView}
          contentContainerStyle={styles.gamesContainer}
        >
          {comingSoonGames.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              genre={game.genre}
              rating={game.rating}
              description={game.description}
              isComingSoon={true}
              releaseDate={game.releaseDate}
              onPress={() => handleGamePress(game)}
              onReminder={() => console.log('Reminder set for:', game.title)}
            />
          ))}
        </ScrollView>

        <PremiumBanner />
      </ScrollView>

      {/* Game Detail Modal */}
      <GameDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        game={selectedGame}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50, // Espacio para la navegación inferior
  },
  gamesScrollView: {
    marginBottom: 20,
  },
  gamesContainer: {
    paddingHorizontal: 20,
  },
  seeAllContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 35,
  },
  seeAllButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  seeAllButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
