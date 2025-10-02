import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ContactModal({ visible, onClose }: ContactModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitContact = () => {
    console.log('Contact form submitted:', contactForm);
    onClose();
    // Aquí podrías enviar el formulario a un servidor
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.secondary }]}>CONTACTO</Text>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.modalDescription, { color: colors.white }]}>
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti, contáctanos y te responderemos lo antes posible
          </Text>

          {/* Contact Form */}
          <View style={[styles.contactFormCard, { backgroundColor: colors.cardBackground, borderColor: colors.secondary }]}>
            <View style={styles.formHeader}>
              <Ionicons name="chatbubble" size={20} color={colors.secondary} />
              <Text style={[styles.formTitle, { color: colors.secondary }]}>Envíanos un mensaje</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Nombre completo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="Tu nombre"
                placeholderTextColor={colors.gray}
                value={contactForm.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="tu@email.com"
                placeholderTextColor={colors.gray}
                value={contactForm.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Asunto</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="¿En qué podemos ayudarte?"
                placeholderTextColor={colors.gray}
                value={contactForm.subject}
                onChangeText={(value) => handleInputChange('subject', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Mensaje</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="Cuéntanos los detalles..."
                placeholderTextColor={colors.gray}
                value={contactForm.message}
                onChangeText={(value) => handleInputChange('message', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.accent }]}
              onPress={handleSubmitContact}
            >
              <Text style={[styles.submitButtonText, { color: colors.white }]}>Enviar mensaje</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.contactInfo}>
            <View style={[styles.contactCard, { backgroundColor: colors.cardBackground, borderColor: colors.secondary }]}>
              <View style={[styles.contactIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="mail" size={20} color={colors.background} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={[styles.contactTitle, { color: colors.white }]}>Email</Text>
                <Text style={[styles.contactText, { color: colors.white }]}>soporte@playverse.com</Text>
                <Text style={[styles.contactText, { color: colors.white }]}>ventas@playverse.com</Text>
              </View>
            </View>

            <View style={[styles.contactCard, { backgroundColor: colors.cardBackground, borderColor: colors.secondary }]}>
              <View style={[styles.contactIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="call" size={20} color={colors.background} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={[styles.contactTitle, { color: colors.white }]}>Teléfono</Text>
                <Text style={[styles.contactText, { color: colors.white }]}>+1 (555) 123-4567</Text>
                <Text style={[styles.contactHours, { color: colors.gray }]}>Lun - Vie: 9:00 AM – 6:00 PM</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },
  contactFormCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 100,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    gap: 16,
    marginBottom: 40,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactHours: {
    fontSize: 12,
    marginTop: 4,
  },
});
