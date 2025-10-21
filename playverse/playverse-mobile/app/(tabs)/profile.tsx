import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import ContactModal from '@/components/ContactModal';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfileScreen() {
  const cs = useColorScheme();
  const colors = Colors[cs ?? 'light'];
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [isPremium] = useState(true);

  const faqData = [
    { id: 1, q: '¿Cómo funciona el alquiler de juegos?', a: 'Podés alquilar semanal y jugar las veces que quieras.' },
    { id: 2, q: '¿Qué incluye Premium?', a: 'Catálogo completo, descuentos y cero publicidad.' },
    { id: 3, q: '¿Puedo cancelar?', a: 'Sí, desde tu perfil en cualquier momento.' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.secondary }]}>PERFIL</Text>
          <Text style={[styles.subtitle, { color: colors.white }]}>Edita tu perfil de gamer</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.white }]}>
            <Ionicons name="person" size={60} color={colors.background} />
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: colors.accent }]}>
              <Ionicons name="create" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.statusBadge,
            { backgroundColor: isPremium ? '#FFD700' : '#6B7280', borderColor: isPremium ? '#FFA500' : '#4B5563' }
          ]}>
            <Ionicons name={isPremium ? 'diamond' : 'person-outline'} size={16} color={isPremium ? '#B8860B' : '#9CA3AF'} />
            <Text style={[styles.statusText, { color: isPremium ? '#B8860B' : '#9CA3AF' }]}>
              {isPremium ? 'PREMIUM' : 'FREE'}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.white }]}>Usuario:</Text>
              <Text style={[styles.infoValue, { color: colors.accent }]}>Eros Bianchini</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.white }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: colors.accent }]}>usuario@gmail.com</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.white }]}>Contraseña:</Text>
              <Text style={[styles.infoValue, { color: colors.accent }]}>******************</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editProfileButton, { borderColor: colors.accent }]}
            onPress={() => setEditProfileModalVisible(true)}
          >
            <Ionicons name="create" size={16} color={colors.accent} />
            <Text style={[styles.editProfileText, { color: colors.accent }]}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.faqSection, { backgroundColor: colors.cardBackground, borderColor: colors.accent }]}>
          <Text style={[styles.faqTitle, { color: colors.accent }]}>Preguntas frecuentes</Text>
          {faqData.map(f => (
            <View key={f.id} style={styles.faqItem}>
              <TouchableOpacity style={styles.faqQuestion} onPress={() => setExpandedFAQ(expandedFAQ === f.id ? null : f.id)}>
                <Text style={[styles.faqQuestionText, { color: colors.white }]}>{f.q}</Text>
                <Ionicons name={expandedFAQ === f.id ? 'chevron-up' : 'chevron-down'} size={20} color={colors.white} />
              </TouchableOpacity>
              {expandedFAQ === f.id && (
                <View style={styles.faqAnswer}>
                  <Text style={[styles.faqAnswerText, { color: colors.white }]}>{f.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.contactSection}>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.accent }]}
            onPress={() => setContactModalVisible(true)}
          >
            <Ionicons name="call" size={20} color={colors.white} />
            <Text style={[styles.contactButtonText, { color: colors.white }]}>Contacto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ContactModal visible={contactModalVisible} onClose={() => setContactModalVisible(false)} />
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        currentUsername="Eros Bianchini"
        currentEmail="usuario@gmail.com"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scrollView: { flex: 1 },
  titleSection: { paddingHorizontal: 20, marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', opacity: 0.9 },
  profileSection: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 32 },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24, position: 'relative' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, marginBottom: 20, elevation: 5 },
  statusText: { fontSize: 14, fontWeight: 'bold', marginLeft: 6, letterSpacing: 1 },
  userInfo: { width: '100%', marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 16, fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: 'bold' },
  editProfileButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, borderWidth: 1 },
  editProfileText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  faqSection: { marginHorizontal: 20, marginBottom: 32, borderRadius: 16, borderWidth: 1, padding: 20 },
  faqTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  faqItem: { marginBottom: 16 },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestionText: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 12 },
  faqAnswer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  faqAnswerText: { fontSize: 14, lineHeight: 20, opacity: 0.9 },
  contactSection: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, marginBottom: 40 },
  contactButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  contactButtonText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 }
});
