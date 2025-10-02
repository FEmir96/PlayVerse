import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import PlayverseLogo from '@/components/PlayverseLogo';
import GameCard from '@/components/GameCard';
import Header from '@/components/Header';
import GameDetailModal from '@/components/GameDetailModal';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const categories = ['Todos', 'Acción', 'RPG', 'Carreras'];

  // Datos de ejemplo para los juegos favoritos (más juegos para probar la paginación)
  const allFavoriteGames = [
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
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$29,99',
    },
    {
      id: '3',
      title: 'FIFA 24',
      genre: 'Deportes',
      rating: 4.7,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$39,99',
    },
    {
      id: '4',
      title: 'Call of Duty',
      genre: 'Acción',
      rating: 4.3,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$4,99/sem',
      purchasePrice: '$49,99',
    },
    {
      id: '5',
      title: 'Mario Kart',
      genre: 'Carreras',
      rating: 4.8,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$24,99',
    },
    {
      id: '6',
      title: 'The Witcher 3',
      genre: 'RPG',
      rating: 4.9,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$19,99',
    },
    {
      id: '7',
      title: 'Assassin\'s Creed',
      genre: 'Acción',
      rating: 4.1,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$29,99',
    },
    {
      id: '8',
      title: 'Need for Speed',
      genre: 'Carreras',
      rating: 4.4,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$34,99',
    },
    {
      id: '9',
      title: 'Final Fantasy',
      genre: 'RPG',
      rating: 4.6,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$4,99/sem',
      purchasePrice: '$39,99',
    },
    {
      id: '10',
      title: 'GTA V',
      genre: 'Acción',
      rating: 4.7,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$3,99/sem',
      purchasePrice: '$19,99',
    },
    {
      id: '11',
      title: 'Minecraft',
      genre: 'Aventura',
      rating: 4.8,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$2,99/sem',
      purchasePrice: '$24,99',
    },
    {
      id: '12',
      title: 'Red Dead Redemption',
      genre: 'Aventura',
      rating: 4.9,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      rentalPrice: '$4,99/sem',
      purchasePrice: '$49,99',
    },
  ];

  // Filtrar juegos por categoría y búsqueda
  const filteredGames = allFavoriteGames.filter(game => {
    const matchesCategory = selectedCategory === 'Todos' || game.genre === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleGamePress = (game: any) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGame(null);
  };

  const renderGameCard = ({ item }: { item: any }) => (
    <View style={styles.gameCardContainer}>
      <GameCard
        title={item.title}
        genre={item.genre}
        rating={item.rating}
        description={item.description}
        rentalPrice={item.rentalPrice}
        purchasePrice={item.purchasePrice}
        cardType="favorites"
        onPress={() => handleGamePress(item)}
        onFavorite={() => console.log('Remove from favorites:', item.title)}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.heroGradient}
          style={styles.gradient}
        >
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.secondary }]}>FAVORITOS</Text>
            <Text style={[styles.subtitle, { color: colors.white }]}>
              Elige cual será tu próxima aventura entre tus títulos favoritos
            </Text>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.gray }]}>
              <Ionicons name="search" size={20} color={colors.gray} />
              <TextInput
                style={[styles.searchInput, { color: colors.white }]}
                placeholder="Buscar por título..."
                placeholderTextColor={colors.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity>
                <Ionicons name="filter" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>  

        {/* Games Grid */}
        <FlatList
          data={currentGames}
          renderItem={renderGameCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gamesGrid}
          columnWrapperStyle={styles.gameRow}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={[styles.paginationText, { color: colors.gray }]}>
                Página {currentPage} de {totalPages} • {filteredGames.length} juegos
              </Text>
            </View>
            
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { 
                    backgroundColor: currentPage === 1 ? colors.gray : colors.secondary,
                    opacity: currentPage === 1 ? 0.5 : 1
                  }
                ]}
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={20} color={colors.background} />
              </TouchableOpacity>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.pageButton,
                    {
                      backgroundColor: currentPage === page ? colors.accent : colors.cardBackground,
                      borderColor: currentPage === page ? colors.accent : colors.gray,
                    }
                  ]}
                  onPress={() => goToPage(page)}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      {
                        color: currentPage === page ? colors.background : colors.gray,
                      }
                    ]}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  { 
                    backgroundColor: currentPage === totalPages ? colors.gray : colors.secondary,
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }
                ]}
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  gradient: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  notificationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesContent: {
    alignItems: 'center',
  },
  categoryArrow: {
    padding: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gamesGrid: {
    paddingLeft: 24,
  },
  gameRow: {
    justifyContent: 'space-between',
  },
  gameCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
