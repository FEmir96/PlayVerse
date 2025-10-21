import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = (Constants.expoConfig?.extra as any) ?? {};

function baseFromWindow(): string | undefined {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin;
      if (/localhost:8081/i.test(origin)) {
        return extra.webAssetBase || extra.webAuthUrl;
      }
      return origin;
    }
  }
  return undefined;
}

export function resolveAssetUrl(input?: string | null): string | undefined {
  if (!input) return undefined;
  if (/^https?:/i.test(input)) return input;

  const base = baseFromWindow() || extra.webAssetBase || extra.webAuthUrl;
  if (!base) return undefined;

  return `${String(base).replace(/\/$/, '')}/${String(input).replace(/^\//, '')}`;
}
