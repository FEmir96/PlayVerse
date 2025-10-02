import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const benefits = [
    {
      icon: 'download',
      title: 'Acceso ilimitado',
      description: 'Descarga y juega todos los juegos de nuestra biblioteca sin restricciones'
    },
    {
      icon: 'hand-left',
      title: 'Cero publicidad',
      description: 'Olvídate de la publicidad y disfruta de una experiencia sin interrupciones'
    },
    {
      icon: 'star',
      title: 'Descuentos exclusivos',
      description: 'Hasta 75% de descuento en compras y contenido adicional'
    }
  ];

  const plans = [
    {
      id: 'monthly',
      name: 'Mensual',
      price: '$9,99',
      period: '/mes',
      description: 'Perfecto para probar la experiencia',
      features: [
        'Acceso a toda la biblioteca',
        'Descuentos del 10%',
        'Cero publicidad',
        'Soporte prioritario'
      ],
      popular: false
    },
    {
      id: 'annual',
      name: 'Anual',
      price: '$89,99',
      period: '/año',
      originalPrice: '$119,99',
      savings: 'Ahorra $30',
      description: 'La más conveniente',
      features: [
        'La más conveniente',
        '3 meses gratis',
        'Todo lo de mensual',
        'Acceso anticipado a juegos'
      ],
      popular: true
    },
    {
      id: 'trimestral',
      name: 'Trimestral',
      price: '$24,99',
      period: '/3 meses',
      description: 'Equilibrio perfecto entre precio y flexibilidad',
      features: [
        'Mejor precio que mensual',
        'Todo lo de mensual',
        'Renovación cada 3 meses',
        'Sin permanencia'
      ],
      popular: false
    }
  ];

  const handleGoToWeb = () => {
    Alert.alert(
      'Ir a la web',
      'Para suscribirte a Premium necesitas acceder a nuestra página web. ¿Quieres abrir el navegador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir web', 
          onPress: () => Linking.openURL('https://playverse.com/premium')
        }
      ]
    );
  };

  const handleFreeTrial = () => {
    Alert.alert(
      'Prueba gratuita',
      'Para comenzar tu prueba gratuita de 7 días necesitas acceder a nuestra página web.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ir a la web', 
          onPress: () => Linking.openURL('https://playverse.com/premium/trial')
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section - Igual que tu web */}
        <LinearGradient
          colors={colors.premiumGradient}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.5, 1]}
        >
          {/* Premium Badge */}
          <View style={[styles.premiumBadge, { backgroundColor: 'rgba(209, 147, 16, 0.2)', borderColor: colors.secondary }]}>
            <Ionicons name="star" size={16} color={colors.secondary} />
            <Text style={[styles.premiumBadgeText, { color: colors.secondary }]}>Premium</Text>
          </View>

          <Text style={[styles.mainTitle, { color: colors.white }]}>
            Desbloquea el
          </Text>
          
          {/* Gradient Text - "poder del gaming" */}
          <View style={styles.gradientTextContainer}>
            <LinearGradient
              colors={['#fb923c80', '#14b8a680', '#9333ea80']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientTextBackground}
            >
              <Text style={[styles.gradientText, { color: colors.white }]}>
                poder del gaming
              </Text>
            </LinearGradient>
          </View>

          <Text style={[styles.heroSubtitle, { color: colors.white }]}>
            Accede a toda nuestra biblioteca, disfruta de descuentos exclusivos y vive la mejor experiencia gaming sin límites ni interrupciones.
          </Text>

          <View style={[styles.trialBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="star" size={16} color={colors.background} />
            <Text style={[styles.trialBadgeText, { color: colors.background }]}>Prueba gratuita de 7 días</Text>
          </View>

          <Text style={[styles.webNotice, { color: colors.gray }]}>
            Visita nuestra página web para disfrutar la prueba
          </Text>
        </LinearGradient>

        {/* Why Premium Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            ¿Por qué elegir Premium?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.white }]}>
            Descubre todos los beneficios que tenemos para ti
          </Text>
          
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name={benefit.icon as any} size={24} color={colors.background} />
                </View>
                <Text style={[styles.benefitTitle, { color: colors.white }]}>{benefit.title}</Text>
                <Text style={[styles.benefitDescription, { color: colors.white }]}>{benefit.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Plans Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>
            Elige tu plan
          </Text>
          
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planWrapper}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <View style={[styles.popularBadgeInner, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.popularText, { color: colors.background }]}>Más popular</Text>
                    </View>
                  </View>
                )}
                
                <View
                  style={[
                    styles.planCard, 
                    { backgroundColor: colors.cardBackground }, 
                    plan.popular ? styles.popularPlan : styles.regularPlan
                  ]}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, { color: colors.white }]}>{plan.name}</Text>
                    <View style={styles.planPricing}>
                      <Text style={[styles.planPrice, { color: colors.white }]}>{plan.price}</Text>
                      <Text style={[styles.planPeriod, { color: colors.white }]}>{plan.period}</Text>
                    </View>
                    {plan.originalPrice && (
                      <View style={styles.savingsContainer}>
                        <Text style={[styles.originalPrice, { color: colors.white }]}>{plan.originalPrice}</Text>
                        <Text style={[styles.savings, { color: colors.white }]}>{plan.savings}</Text>
                      </View>
                    )}
                    <Text style={[styles.planDescription, { color: colors.white }]}>{plan.description}</Text>
                  </View>

                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.planFeature}>
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                        <Text style={[styles.planFeatureText, { color: colors.white }]}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.subscriptionNotice}>
                    <Text style={[styles.subscriptionNoticeText, { color: colors.gray }]}>
                      Para suscribirte a este plan, visita nuestra página web
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

    
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 35,
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 32,
    gap: 8,
  },
  premiumBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  gradientTextContainer: {
    marginBottom: 32,
    alignSelf: 'center',
  },
  gradientTextBackground: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gradientText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    marginBottom: 12,
  },
  trialBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  webNotice: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  benefitsGrid: {
    gap: 20,
  },
  benefitCard: {
    padding: 20,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  plansContainer: {
    gap: 24,
  },
  planWrapper: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  popularBadgeInner: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
  },
  popularText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  planCard: {
    borderRadius: 20,
    padding: 28,
    marginTop: 12,
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#d19310',
  },
  regularPlan: {
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 18,
    opacity: 0.8,
    marginLeft: 4,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  savings: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  planFeatures: {
    gap: 16,
    marginBottom: 28,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planFeatureText: {
    fontSize: 16,
    flex: 1,
  },
  subscriptionNotice: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  subscriptionNoticeText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 20,
  },
  footerNote: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 20,
  },
});
