import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width, height } = Dimensions.get('window');

interface GameDetailModalProps {
  visible: boolean;
  onClose: () => void;
  game?: {
    id: string;
    title: string;
    genre: string;
    rating: number;
    description: string;
    rentalPrice: string;
    purchasePrice: string;
    isPremium: boolean;
  };
}

export default function GameDetailModal({ visible, onClose, game }: GameDetailModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  // Datos de ejemplo del juego si no se proporciona uno
  const gameData = game || {
    id: '1',
    title: 'Tomb Raider',
    genre: 'Acción',
    rating: 4.5,
    description: 'Embárcate en una aventura épica llena de misterios antiguos, tesoros perdidos y peligros mortales. Lara Croft regresa en su aventura más emocionante hasta la fecha, explorando tumbas olvidadas y enfrentándose a enemigos que pondrán a prueba todas sus habilidades.',
    rentalPrice: '$2,99/sem',
    purchasePrice: '$19,99',
    isPremium: false,
  };

  const gameInfo = {
    developer: 'Crystal Dynamics',
    publisher: 'Square Enix',
    releaseDate: '15 de Marzo, 2024',
    classification: 'T (Teen)',
    size: '45 GB',
    languages: ['Español', 'Inglés', 'Francés', 'Alemán'],
  };

  const features = [
    'Modo historia épico de 20+ horas',
    'Soporte para 120 FPS',
    'Gráficos 4K Ultra HD',
    'Modo cooperativo online',
  ];

  // Array de imágenes para el carrusel
  const galleryImages = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=11',
    'https://picsum.photos/400/300?random=21',
    'https://picsum.photos/400/300?random=31',
  ];

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    setImageError(false);
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
    setImageError(false);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
    setImageError(false);
  };

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      translateY.setValue(0);
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // END
      if (event.nativeEvent.translationY > 100) {
        handleClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header con botón de cerrar */}
        <View style={styles.header}>
          <View style={styles.dragIndicator} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image 
              source={{ uri: galleryImages[selectedImageIndex] }} 
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
            {imageError && (
              <View style={[styles.heroImage, styles.placeholderContainer]}>
                <Ionicons name="game-controller" size={60} color={colors.gray} />
                <Text style={[styles.placeholderText, { color: colors.gray }]}>
                  {gameData.title}
                </Text>
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.heroGradient}
            />
            
            {/* Game Title and Rating */}
            <View style={styles.heroInfo}>
              <Text style={[styles.gameTitle, { color: colors.secondary }]}>{gameData.title}</Text>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={16} color={colors.secondary} />
                <Text style={[styles.ratingText, { color: colors.secondary }]}>{gameData.rating}</Text>
              </View>
              <View style={[styles.genreBadge, { borderColor: colors.secondary }]}>
                <Text style={[styles.genreText, { color: colors.secondary }]}>{gameData.genre}</Text>
              </View>
            </View>
          </View>

          {/* Image Gallery */}
          <View style={styles.gallerySection}>
            <View style={styles.galleryContainer}>
              <TouchableOpacity 
                style={styles.galleryArrow}
                onPress={handlePreviousImage}
              >
                <Ionicons name="chevron-back" size={20} color={colors.gray} />
              </TouchableOpacity>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
                contentContainerStyle={styles.galleryContent}
              >
                {galleryImages.map((imageUri, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.galleryItem,
                      selectedImageIndex === index && styles.selectedGalleryItem
                    ]}
                    onPress={() => handleImageSelect(index)}
                  >
                    <Image 
                      source={{ uri: imageUri }} 
                      style={[
                        styles.galleryImage,
                        selectedImageIndex === index && styles.selectedGalleryImage
                      ]}
                      resizeMode="cover"
                      onError={() => {}}
                    />
                    {index === galleryImages.length - 1 && (
                      <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.galleryArrow}
                onPress={handleNextImage}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pricing Section */}
          <View style={[styles.pricingSection, { borderColor: colors.secondary }]}>
            <Text style={[styles.premiumText, { color: colors.text }]}>
              ¡Disfruta un 10% de descuento si te suscribes a premium!
            </Text>
            
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.gray }]}>Alquiler mensual</Text>
                <Text style={[styles.rentalPrice, { color: colors.text }]}>{gameData.rentalPrice}</Text>
              </View>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.gray }]}>Precio de compra</Text>
                <Text style={[styles.purchasePrice, { color: colors.text }]}>{gameData.purchasePrice}</Text>
              </View>
            </View>
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.favoriteButton, { borderColor: colors.secondary }]}
                onPress={toggleFavorite}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color={colors.secondary} 
                />
                <Text style={[styles.favoriteButtonText, { color: colors.secondary }]}>Favoritos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.shareButton, { borderColor: colors.secondary }]}>
                <Ionicons name="share-outline" size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.webText, { color: colors.gray }]}>
              ¡Accede desde la web para adquirir o jugar cualquier juego de nuestro catálogo!
            </Text>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Descripción</Text>
            <Text style={[styles.description, { color: colors.gray }]}>
              {gameData.description}
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Características principales</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
                <Text style={[styles.featureText, { color: colors.gray }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Game Information Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Información del juego</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray }]}>Desarrollador:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{gameInfo.developer}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray }]}>Editor:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{gameInfo.publisher}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray }]}>Fecha de lanzamiento:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{gameInfo.releaseDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray }]}>Clasificación:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{gameInfo.classification}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.gray }]}>Tamaño:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{gameInfo.size}</Text>
              </View>
            </View>
            
            <View style={styles.languagesSection}>
              <Text style={[styles.languagesLabel, { color: colors.gray }]}>Idiomas:</Text>
              <View style={styles.languagesContainer}>
                {gameInfo.languages.map((language, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.languageButton, { borderColor: colors.secondary }]}
                  >
                    <Text style={[styles.languageText, { color: colors.text }]}>{language}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  genreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  gallerySection: {
    paddingVertical: 20,
  },
  galleryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryArrow: {
    padding: 8,
  },
  galleryScroll: {
    flex: 1,
  },
  galleryContent: {
    paddingHorizontal: 8,
  },
  galleryItem: {
    marginHorizontal: 4,
    position: 'relative',
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricingSection: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  purchasePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rentalPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  favoriteButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  infoGrid: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  languagesSection: {
    marginTop: 0,
    marginBottom: 28,
  },
  languagesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedGalleryItem: {
    borderWidth: 2,
    borderColor: '#d19310',
    borderRadius: 8,
  },
  selectedGalleryImage: {
    opacity: 0.8,
  },
});

