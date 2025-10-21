import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import Header from '@/components/Header';
import SectionHeader from '@/components/SectionHeader';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function LibraryTab() {
  const cs = useColorScheme();
  const colors = Colors[cs ?? 'light'];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Mis juegos" subtitle="alquileres y compras" />
        <Text style={{ paddingHorizontal: 20, color: colors.gray, marginBottom: 24 }}>
          No hay juegos activos por ahora.
        </Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1 } });
