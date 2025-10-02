import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Switch,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'premium';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: '¡Tu alquiler de Tomb Raider vence mañana!',
      message: 'No olvides renovar tu alquiler para seguir disfrutando del juego.',
      time: 'Hace 5m',
      isRead: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Nuevo juego añadido: "Cyberpunk 2077"',
      message: 'Ya está disponible para alquiler y compra en nuestro catálogo.',
      time: 'Hace 1h',
      isRead: false,
    },
    {
      id: '3',
      type: 'info',
      title: '"The Witcher 3" estará disponible la próxima semana',
      message: 'Prepárate para esta épica aventura de fantasía.',
      time: 'Hace 3h',
      isRead: true,
    },
    {
      id: '4',
      type: 'success',
      title: '¡Pago procesado exitosamente!',
      message: 'Tu suscripción Premium se ha renovado por 1 mes más.',
      time: 'Hace 1d',
      isRead: true,
    },
    {
      id: '5',
      type: 'premium',
      title: 'Descuento exclusivo Premium',
      message: 'Aprovecha un 20% de descuento en todos los juegos esta semana.',
      time: 'Hace 2d',
      isRead: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      case 'success':
        return 'checkmark-circle';
      case 'premium':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#FF6B6B';
      case 'info':
        return '#4ECDC4';
      case 'success':
        return '#45B7D1';
      case 'premium':
        return '#FFD93D';
      default:
        return colors.gray;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.white }]}>Notificaciones</Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.badgeText, { color: colors.white }]}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Notifications Toggle */}
        <View style={[styles.toggleSection, { borderColor: colors.secondary }]}>
          <View style={styles.toggleLeft}>
            <Ionicons name="notifications" size={20} color={colors.white} />
            <Text style={[styles.toggleText, { color: colors.white }]}>Notificaciones</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.gray, true: colors.accent }}
            thumbColor={colors.white}
          />
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                { 
                  backgroundColor: notification.isRead ? 'transparent' : colors.cardBackground,
                  borderColor: colors.secondary 
                }
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationLeft}>
                <View 
                  style={[
                    styles.notificationIcon, 
                    { backgroundColor: getNotificationColor(notification.type) }
                  ]}
                >
                  <Ionicons 
                    name={getNotificationIcon(notification.type)} 
                    size={16} 
                    color={colors.white} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationTitle, 
                    { 
                      color: colors.white,
                      fontWeight: notification.isRead ? 'normal' : 'bold'
                    }
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.gray }]}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.gray }]}>
                    {notification.time}
                  </Text>
                </View>
              </View>
              {!notification.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer Actions */}
        {unreadCount > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.markAllButton, { borderColor: colors.secondary }]}
              onPress={markAllAsRead}
            >
              <Text style={[styles.markAllText, { color: colors.white }]}>
                Marcar todas como leídas
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  markAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  markAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
