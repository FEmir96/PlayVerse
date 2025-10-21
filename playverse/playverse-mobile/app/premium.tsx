import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PremiumScreen() {
  const cs = useColorScheme(); const colors = Colors[cs ?? 'light'];

  const benefits = [
    { icon: 'download', title: 'Acceso ilimitado', description: 'Juega toda la biblioteca sin límites' },
    { icon: 'hand-left', title: 'Cero publicidad', description: 'Experiencia sin interrupciones' },
    { icon: 'star', title: 'Descuentos', description: 'Hasta 75% en compras y DLCs' }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={colors.premiumGradient} style={styles.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={[styles.badge, { borderColor: colors.secondary, backgroundColor: 'rgba(209,147,16,0.15)' }]}>
            <Ionicons name="star" size={16} color={colors.secondary} />
            <Text style={{ color: colors.secondary, fontWeight: 'bold', marginLeft: 8 }}>Premium</Text>
          </View>
          <Text style={[styles.title, { color: colors.white }]}>Desbloquea el <Text style={{ color: colors.secondary }}>poder del gaming</Text></Text>
          <Text style={[styles.subtitle, { color: colors.white }]}>Catálogo completo, descuentos y cero publicidad.</Text>
        </LinearGradient>

        <View style={{ padding: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.white }]}>Beneficios</Text>
          <View style={{ gap: 12 }}>
            {benefits.map((b, i) => (
              <View key={i} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}><Ionicons name={b.icon as any} size={20} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.white }]}>{b.title}</Text>
                  <Text style={{ color: colors.white, opacity: 0.9 }}>{b.description}</Text>
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
  hero:{ paddingHorizontal:20, paddingVertical:32, alignItems:'center' },
  badge:{ flexDirection:'row', alignItems:'center', borderWidth:1, borderRadius:20, paddingHorizontal:12, paddingVertical:6, marginBottom:12 },
  title:{ fontSize:28, fontWeight:'bold', textAlign:'center', marginBottom:8 },
  subtitle:{ textAlign:'center', opacity:0.9 },
  sectionTitle:{ fontSize:22, fontWeight:'bold', marginBottom:12 },
  card:{ flexDirection:'row', alignItems:'center', borderRadius:12, padding:16, gap:12 },
  iconWrap:{ width:36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center' },
  cardTitle:{ fontSize:16, fontWeight:'bold', marginBottom:4 }
});
