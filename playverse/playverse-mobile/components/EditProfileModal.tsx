import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentUsername?: string;
  currentEmail?: string;
}

export default function EditProfileModal({ 
  visible, 
  onClose, 
  currentUsername = "Eros Bianchini",
  currentEmail = "usuario@gmail.com"
}: EditProfileModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [profileForm, setProfileForm] = useState({
    username: currentUsername,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // Validaciones básicas
    if (!profileForm.username.trim()) {
      Alert.alert('Error', 'El nombre de usuario no puede estar vacío');
      return;
    }

    // Si quiere cambiar la contraseña, validar que todos los campos estén llenos
    if (profileForm.newPassword || profileForm.confirmPassword || profileForm.currentPassword) {
      if (!profileForm.currentPassword) {
        Alert.alert('Error', 'Debes ingresar tu contraseña actual');
        return;
      }
      if (!profileForm.newPassword) {
        Alert.alert('Error', 'Debes ingresar una nueva contraseña');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    // Aquí harías la llamada a la API para actualizar el perfil
    console.log('Profile updated:', {
      username: profileForm.username,
      passwordChanged: !!profileForm.newPassword
    });

    Alert.alert(
      'Éxito', 
      'Perfil actualizado correctamente',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const resetForm = () => {
    setProfileForm({
      username: currentUsername,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.secondary }]}>EDITAR PERFIL</Text>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.modalDescription, { color: colors.white }]}>
            Actualiza tu información personal y cambia tu contraseña si lo deseas
          </Text>

          {/* Profile Form */}
          <View style={[styles.profileFormCard, { backgroundColor: colors.cardBackground, borderColor: colors.secondary }]}>
            <View style={styles.formHeader}>
              <Ionicons name="person" size={20} color={colors.secondary} />
              <Text style={[styles.formTitle, { color: colors.secondary }]}>Información personal</Text>
            </View>

            {/* Username Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Nombre de usuario</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]}
                placeholder="Tu nombre gamer"
                placeholderTextColor={colors.gray}
                value={profileForm.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="words"
              />
            </View>

            {/* Email Field (Read-only for now) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Email</Text>
              <View style={[styles.input, styles.readOnlyInput, { backgroundColor: colors.background, borderColor: colors.gray }]}>
                <Text style={[styles.readOnlyText, { color: colors.gray }]}>{currentEmail}</Text>
                <Ionicons name="lock-closed" size={16} color={colors.gray} />
              </View>
              <Text style={[styles.helperText, { color: colors.gray }]}>
                El email no se puede cambiar por ahora
              </Text>
            </View>
          </View>

          {/* Password Change Section */}
          <View style={[styles.passwordFormCard, { backgroundColor: colors.cardBackground, borderColor: colors.accent }]}>
            <View style={styles.formHeader}>
              <Ionicons name="lock-closed" size={20} color={colors.accent} />
              <Text style={[styles.formTitle, { color: colors.accent }]}>Cambiar contraseña</Text>
            </View>

            <Text style={[styles.sectionDescription, { color: colors.white }]}>
              Deja estos campos vacíos si no quieres cambiar tu contraseña
            </Text>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Contraseña actual</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.accent, color: colors.white }]}
                  placeholder="Tu contraseña actual"
                  placeholderTextColor={colors.gray}
                  value={profileForm.currentPassword}
                  onChangeText={(value) => handleInputChange('currentPassword', value)}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.gray} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Nueva contraseña</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.accent, color: colors.white }]}
                  placeholder="Tu nueva contraseña"
                  placeholderTextColor={colors.gray}
                  value={profileForm.newPassword}
                  onChangeText={(value) => handleInputChange('newPassword', value)}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.gray} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.white }]}>Confirmar nueva contraseña</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.accent, color: colors.white }]}
                  placeholder="Repite tu nueva contraseña"
                  placeholderTextColor={colors.gray}
                  value={profileForm.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.gray} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: colors.gray }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.gray }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.secondary }]}
              onPress={handleSaveProfile}
            >
              <Ionicons name="checkmark" size={20} color={colors.background} />
              <Text style={[styles.saveButtonText, { color: colors.background }]}>Guardar cambios</Text>
            </TouchableOpacity>
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
  profileFormCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
  },
  passwordFormCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
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
  sectionDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
    fontStyle: 'italic',
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
  readOnlyInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readOnlyText: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
