// playverse/playverse-mobile/app/(tabs)/my-games.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import GameDetailModal from '@/components/GameDetailModal';
import { LinearGradient } from 'expo-linear-gradient';

// 👇 importa el tipo y el cliente HTTP de Convex
import type { Game } from '@/src/types/game';
import { convexHttp } from '@/src/lib/convexClient';

export default function MyGamesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeTab, setActiveTab] = useState<'rentals' | 'purchases'>('rentals');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Datos
  const [rentals, setRentals] = useState<Game[]>([]);
  const [purchases, setPurchases] = useState<Game[]>([]);

  const categories = ['Todos', 'Acción', 'RPG', 'Carreras'];

  // Seeds locales (se usan como fallback si Convex no devuelve datos)
  const seedMyGames: Game[] = [
    {
      id: '1',
      title: 'Tomb Raider',
      genre: 'Acción',
      rating: 4.5,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '20/07/2025',
    },
    {
      id: '2',
      title: 'Cyberpunk 2077',
      genre: 'RPG',
      rating: 4.2,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '25/07/2025',
    },
    {
      id: '3',
      title: 'FIFA 24',
      genre: 'Deportes',
      rating: 4.7,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '30/07/2025',
    },
    {
      id: '4',
      title: 'Call of Duty',
      genre: 'Acción',
      rating: 4.3,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'expired',
      validUntil: '15/06/2025',
    },
    {
      id: '5',
      title: 'Mario Kart',
      genre: 'Carreras',
      rating: 4.8,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '22/07/2025',
    },
    {
      id: '6',
      title: 'The Witcher 3',
      genre: 'RPG',
      rating: 4.9,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'expired',
      validUntil: '10/06/2025',
    },
    {
      id: '7',
      title: "Assassin's Creed",
      genre: 'Acción',
      rating: 4.1,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '28/07/2025',
    },
    {
      id: '8',
      title: 'Need for Speed',
      genre: 'Carreras',
      rating: 4.4,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'expired',
      validUntil: '05/06/2025',
    },
    {
      id: '9',
      title: 'Final Fantasy',
      genre: 'RPG',
      rating: 4.6,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '15/08/2025',
    },
    {
      id: '10',
      title: 'GTA V',
      genre: 'Acción',
      rating: 4.7,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '12/08/2025',
    },
    {
      id: '11',
      title: 'Minecraft',
      genre: 'Aventura',
      rating: 4.8,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'expired',
      validUntil: '01/06/2025',
    },
    {
      id: '12',
      title: 'Red Dead Redemption',
      genre: 'Aventura',
      rating: 4.9,
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit nulla tristique',
      status: 'valid',
      validUntil: '20/08/2025',
    },
  ];

  // Carga inicial desde Convex (evita TS2345 casteando el cliente a any)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [r, p] = await Promise.all([
          (convexHttp as any).query('games:listMyRentals', {}),
          (convexHttp as any).query('games:listMyPurchases', {}),
        ]);

        if (!mounted) return;

        setRentals(Array.isArray(r) && r.length ? (r as Game[]) : seedMyGames);
        const fallbackPurchases = seedMyGames.slice(0, 6).map((g) => ({ ...g, validUntil: undefined }));
        setPurchases(Array.isArray(p) && p.length ? (p as Game[]) : fallbackPurchases);
      } catch (e) {
        setRentals(seedMyGames);
        setPurchases(seedMyGames.slice(0, 6).map((g) => ({ ...g, validUntil: undefined })));
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dataset base según tab
  const baseList = activeTab === 'purchases' ? purchases : rentals;

  // Filtrado por categoría y búsqueda
  const filteredGames = useMemo(() => {
    return baseList.filter((game) => {
      const matchesCategory = selectedCategory === 'Todos' || game.genre === selectedCategory;
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [baseList, selectedCategory, searchQuery]);

  // Paginación
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage) || 1;
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Resetear página cuando cambian filtros o pestaña
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, activeTab]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleGamePress = (game: Game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGame(null);
  };

  const renderGameCard = ({ item }: { item: Game }) => (
    <View style={styles.gameCardContainer}>
      <GameCard
        title={item.title}
        genre={item.genre}
        rating={item.rating}
        description={item.description}
        validUntil={item.validUntil}
        cardType={activeTab === 'purchases' ? 'purchases' : 'my-games'}
        onPress={() => handleGamePress(item)}
        onFavorite={() => console.log('Add to favorites:', item.title)}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={colors.heroGradient} style={styles.gradient}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.secondary }]}>MIS JUEGOS</Text>
            <Text style={[styles.subtitle, { color: colors.white }]}>
              Tu arsenal personal de aventuras. ¡Selecciona tu próxima misión!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: activeTab === 'purchases' ? colors.secondary : 'transparent',
                  borderColor: colors.secondary,
                },
              ]}
              onPress={() => setActiveTab('purchases')}
            >
              <Ionicons
                name="bookmark"
                size={20}
                color={activeTab === 'purchases' ? colors.background : colors.secondary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: activeTab === 'purchases' ? colors.background : colors.secondary,
                  },
                ]}
              >
                Mis compras
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: activeTab === 'rentals' ? colors.secondary : 'transparent',
                  borderColor: colors.secondary,
                },
              ]}
              onPress={() => setActiveTab('rentals')}
            >
              <Ionicons
                name="time"
                size={20}
                color={activeTab === 'rentals' ? colors.background : colors.secondary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: activeTab === 'rentals' ? colors.background : colors.secondary,
                  },
                ]}
              >
                Mis alquileres
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

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

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity style={styles.categoryArrow}>
              <Ionicons name="chevron-back" size={20} color={colors.gray} />
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? colors.secondary : 'transparent',
                    borderColor: selectedCategory === category ? colors.secondary : colors.gray,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category ? colors.background : colors.gray,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.categoryArrow}>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>
          </ScrollView>
        </View>

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
                    opacity: currentPage === 1 ? 0.5 : 1,
                  },
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
                    },
                  ]}
                  onPress={() => goToPage(page)}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      {
                        color: currentPage === page ? colors.background : colors.gray,
                      },
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
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  },
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
      <GameDetailModal visible={modalVisible} onClose={handleCloseModal} game={selectedGame || undefined} />
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
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
