import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function PremiumBanner() {
  const cs = useColorScheme(); const colors = Colors[cs ?? 'light']; const router = useRouter();

  return (
    <TouchableOpacity style={{ marginHorizontal:20, marginTop: 28, borderRadius:12, overflow:'hidden' }} onPress={() => router.push('/premium')} activeOpacity={0.9}>
      <LinearGradient colors={colors.premiumGradient} style={{ padding: 20 }} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={{ alignItems:'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.white, textAlign: 'center', marginBottom: 6 }}>
            ¿Listo para una experiencia premium?
          </Text>
          <Text style={{ fontSize: 14, color: colors.white, textAlign: 'center', opacity: 0.9, marginBottom: 16 }}>
            Catálogo ilimitado, descuentos exclusivos, cero publicidad y más.
          </Text>
          <View style={[styles.btn, { backgroundColor: colors.white }]}>
            <Text style={{ color: '#6B21A8', fontWeight: 'bold' }}>Descubrir Premium</Text>
            <Ionicons name="arrow-forward" size={14} color="#6B21A8" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn:{ flexDirection:'row', alignItems:'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, gap: 6,
    shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:8, borderWidth:1, borderColor:'rgba(255,255,255,0.2)' }
});
