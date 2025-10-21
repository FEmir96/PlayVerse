import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function RegisterScreen({ onSwitchToLogin, showHeader = true }: { onSwitchToLogin?: () => void; showHeader?: boolean; }) {
  const cs = useColorScheme(); const colors = Colors[cs ?? 'light']; const router = useRouter();
  const [username, setUsername] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState(''), [accept, setAccept] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {showHeader && (
        <View style={styles.header}>
          <Image source={require('@/assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
          <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
            <Ionicons name="home-outline" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.secondary }]}>PLAYVERSE</Text>
          <Text style={[styles.subtitle, { color: colors.white }]}>Únete y elige tu próxima aventura</Text>
          <View style={[styles.formCard, { backgroundColor: colors.cardBackground, borderColor: colors.secondary }]}>
            <View style={styles.formHeader}><Ionicons name="person-add" size={20} color={colors.secondary} /><Text style={[styles.formTitle, { color: colors.secondary }]}>Crear cuenta</Text></View>
            <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.white }]}>Nombre de usuario</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]} placeholder="Tu nombre gamer" placeholderTextColor={colors.gray} value={username} onChangeText={setUsername} autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.white }]}>Email</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]} placeholder="tu@email.com" placeholderTextColor={colors.gray} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.white }]}>Contraseña</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]} placeholder="Tu contraseña" placeholderTextColor={colors.gray} value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            <View style={styles.inputGroup}><Text style={[styles.inputLabel, { color: colors.white }]}>Repetir contraseña</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.secondary, color: colors.white }]} placeholder="Repite tu contraseña" placeholderTextColor={colors.gray} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            </View>
            <View style={styles.checkboxRow}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAccept(!accept)}>
                <View style={[styles.checkbox, { borderColor: accept ? colors.secondary : colors.gray }]}>{accept && <Ionicons name="checkmark" size={16} color={colors.secondary} />}</View>
                <Text style={{ color: colors.white }}>Acepto los <Text style={{ color: colors.secondary, fontWeight: 'bold' }}>Términos y condiciones</Text></Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.registerButton, { backgroundColor: colors.accent }]} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="arrow-forward" size={20} color={colors.white} /><Text style={[styles.registerButtonText, { color: colors.white }]}>Registrarse</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.white }}>¿Ya tienes una cuenta? <Text style={{ color: colors.secondary, fontWeight: 'bold' }} onPress={onSwitchToLogin || (() => router.replace('/login'))}>Inicia sesión aquí</Text></Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,paddingTop:50,paddingBottom:20},
  logoImage:{width:90,height:30}, homeButton:{padding:8}, scrollContent:{flexGrow:1,paddingBottom:100},
  content:{flex:1,alignItems:'center',paddingHorizontal:20}, title:{fontSize:32,fontWeight:'bold',marginBottom:16,textAlign:'center'},
  subtitle:{fontSize:16,textAlign:'center',marginBottom:40,opacity:0.9}, formCard:{width:'100%',borderRadius:16,borderWidth:1,padding:24},
  formHeader:{flexDirection:'row',alignItems:'center',marginBottom:24}, formTitle:{fontSize:20,fontWeight:'bold',marginLeft:8},
  inputGroup:{marginBottom:20}, inputLabel:{fontSize:16,fontWeight:'600',marginBottom:8},
  input:{borderWidth:1,borderRadius:8,paddingHorizontal:16,paddingVertical:12,fontSize:16},
  checkboxRow:{flexDirection:'row',alignItems:'center',marginBottom:24}, checkboxContainer:{flexDirection:'row',alignItems:'center',flex:1},
  checkbox:{width:20,height:20,borderWidth:2,borderRadius:4,justifyContent:'center',alignItems:'center',marginRight:8},
  registerButton:{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingVertical:16,borderRadius:12,marginBottom:20},
  registerButtonText:{fontSize:18,fontWeight:'bold',marginLeft:8}
});
