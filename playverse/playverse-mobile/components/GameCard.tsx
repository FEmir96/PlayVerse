import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface GameCardProps {
  title: string;
  genre: string;
  rating: number;
  description: string;
  imageUrl?: string;
  isComingSoon?: boolean;
  releaseDate?: string;
  rentalPrice?: string;
  purchasePrice?: string;
  validUntil?: string;
  cardType?: 'catalog' | 'my-games' | 'favorites' | 'purchases';
  onPress?: () => void;
  onFavorite?: () => void;
  onReminder?: () => void;
}

export default function GameCard({
  title,
  genre,
  rating,
  description,
  imageUrl,
  isComingSoon = false,
  releaseDate,
  rentalPrice,
  purchasePrice,
  validUntil,
  cardType = 'catalog',
  onPress,
  onFavorite,
  onReminder,
}: GameCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground }]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <View style={styles.genreTag}>
          <Text style={[styles.genreText, { color: colors.primary }]}>{genre}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={colors.secondary} />
          <Text style={[styles.ratingText, { color: colors.white }]}>{rating}</Text>
        </View>
        {/* Placeholder para la imagen del juego */}
        <View style={[styles.gameImage, { backgroundColor: '#1E293B' }]}>
          <View style={styles.gameImageContent}>
            <Ionicons name="game-controller" size={30} color={colors.white} />
            <View style={[styles.gameImageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.secondary }]} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity onPress={isComingSoon ? onReminder : onFavorite}>
            <Ionicons 
              name={isComingSoon ? "notifications-outline" : "heart-outline"} 
              size={20} 
              color={colors.secondary} 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.description, { color: colors.gray }]} numberOfLines={2}>
          {description}
        </Text>
        
        {isComingSoon ? (
          <Text style={[styles.releaseDate, { color: colors.accent }]}>
            Llega el {releaseDate}
          </Text>
        ) : cardType === 'my-games' ? (
          <Text style={[styles.validUntil, { color: '#00e0d1' }]}>
            Válido hasta el {validUntil}
          </Text>
        ) : cardType === 'purchases' ? (
          <Text style={[styles.purchasedText, { color: '#00e065' }]}>
            Comprado
          </Text>
        ) : (
          <View style={styles.pricingRow}>
            <View style={styles.priceContainerLeft}>
              <Text style={[styles.priceLabel, { color: colors.gray }]}>Alquiler</Text>
              <Text style={[styles.price, { color: colors.white }]}>{rentalPrice}</Text>
            </View>
            <View style={styles.priceContainerRight}>
              <Text style={[styles.priceLabel, { color: colors.gray }]}>Compra</Text>
              <Text style={[styles.price, { color: colors.white }]}>{purchasePrice}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    width: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  genreTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#d19310',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  genreText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  gameImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gameImageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gameImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 8,
  },
  releaseDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainerLeft: {
    alignItems: 'flex-start',
  },
  priceContainerRight: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  validUntil: {
    fontSize: 12,
    fontWeight: '600',
  },
  purchasedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
