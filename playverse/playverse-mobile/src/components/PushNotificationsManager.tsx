import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { emitRefresh } from '../lib/notificationsBus';
import { configureNotificationHandler, registerPushToken, unregisterStoredPushToken } from '../lib/pushNotifications';

const isExpoGo = (Constants as any)?.appOwnership === 'expo';

export default function PushNotificationsManager(): React.ReactElement | null {
  const { profile } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo) return;
    configureNotificationHandler();
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      emitRefresh();
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      emitRefresh();
    });
    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo) return;
    if (!profile?._id) {
      unregisterStoredPushToken().catch(() => {});
      return;
    }
    registerPushToken({ profileId: profile._id, email: profile.email }).catch((error) => {
      console.warn('registerPushToken failure', error);
    });
  }, [profile?._id, profile?.email]);

  return null;
}
