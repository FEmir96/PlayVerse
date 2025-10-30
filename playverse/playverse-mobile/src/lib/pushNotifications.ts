import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { convexHttp } from './convexClient';

const STORAGE_TOKEN_KEY = 'pv.pushToken';
let handlerConfigured = false;

type RegisterOptions = {
  profileId?: string;
  email?: string;
};

function getSecureStore(): typeof import('expo-secure-store') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-secure-store');
  } catch {
    return null;
  }
}

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    lightColor: '#F2B705',
  });
}

function resolveProjectId(): string | undefined {
  const easConfig: any = (Constants as any)?.easConfig;
  if (easConfig?.projectId) return easConfig.projectId as string;
  const expoConfig: any = (Constants as any)?.expoConfig ?? (Constants as any)?.manifest;
  return (
    expoConfig?.extra?.eas?.projectId ??
    expoConfig?.extra?.easProjectId ??
    expoConfig?.extra?.expoGo?.projectId ??
    undefined
  );
}

export function configureNotificationHandler() {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  handlerConfigured = true;
}

async function getStoredToken(): Promise<string | null> {
  const secureStore = getSecureStore();
  if (!secureStore) return null;
  try {
    return await secureStore.getItemAsync(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function storeToken(token: string) {
  const secureStore = getSecureStore();
  if (!secureStore) return;
  try {
    await secureStore.setItemAsync(STORAGE_TOKEN_KEY, token);
  } catch {}
}

async function deleteStoredToken() {
  const secureStore = getSecureStore();
  if (!secureStore) return;
  try {
    await secureStore.deleteItemAsync(STORAGE_TOKEN_KEY);
  } catch {}
}

export async function registerPushToken(options: RegisterOptions = {}) {
  if (Platform.OS === 'web') return null;
  if ((Constants.appOwnership as string | undefined) === 'expo') {
    // Expo Go no soporta push remotos desde SDK 53
    return null;
  }

  configureNotificationHandler();
  await ensureNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    console.warn('registerPushToken: skipping because projectId is not available yet.');
    return null;
  }

  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });

  const token = pushToken.data;
  if (!token) return null;

  const stored = await getStoredToken();
  if (stored !== token) {
    await storeToken(token);
  }

  try {
    await (convexHttp as any).mutation('pushTokens:register', {
      token,
      platform: Platform.OS,
      profileId:
        options.profileId && options.profileId.startsWith('local:') ? undefined : options.profileId,
      email: options.email ?? undefined,
      deviceId: Constants.deviceName ?? undefined,
    });
  } catch (error) {
    console.warn('registerPushToken error', error);
  }

  return token;
}

export async function unregisterStoredPushToken() {
  if (Platform.OS === 'web') return;
  const token = await getStoredToken();
  if (!token) return;
  try {
    await (convexHttp as any).mutation('pushTokens:unregister', { token });
  } catch (error) {
    console.warn('unregisterStoredPushToken error', error);
  }
  await deleteStoredToken();
}
