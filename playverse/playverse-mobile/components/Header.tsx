import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import NotificationsModal from './NotificationsModal';

export default function Header() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const handleNotificationPress = () => {
    setNotificationsVisible(true);
  };

  const handleCloseNotifications = () => {
    setNotificationsVisible(false);
  };

  const handleLoginPress = () => {
    router.push('/auth');
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/playverse-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.rightButtons}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Ionicons name="log-in-outline" size={24} color={colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <View style={styles.notificationContainer}>
              <Ionicons name="notifications-outline" size={24} color={colors.secondary} />
              <View style={[styles.notificationBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.badgeText, { color: colors.white }]}>3</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <NotificationsModal
        visible={notificationsVisible}
        onClose={handleCloseNotifications}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 50,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 90,
    height: 30,
    padding: 2,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButton: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  notificationButton: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
