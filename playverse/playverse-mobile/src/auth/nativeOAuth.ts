// playverse/playverse-mobile/src/auth/nativeOAuth.ts
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { convexHttp } from '../lib/convexClient';

WebBrowser.maybeCompleteAuthSession();

type OAuthResult = {
  ok: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
  error?: string;
};

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

function randomNonce() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function b64UrlJson<T = unknown>(input?: string): T | undefined {
  if (!input) return undefined;
  try {
    const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
    if (typeof atob === 'function') {
      const json = decodeURIComponent(escape(atob(base64)));
      return JSON.parse(json) as T;
    }
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

type PromptOptions = AuthSession.AuthRequestPromptOptions & { useProxy?: boolean };
type RedirectSetup = { redirectUri: string; promptOptions: PromptOptions };

function resolveRedirect(): RedirectSetup {
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';

  if (isExpoGo || isWeb) {
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true } as any);
    console.log('[Auth] Redirect URI (expo proxy):', redirectUri);
    return { redirectUri, promptOptions: { useProxy: true } as PromptOptions };
  }

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'playverse', path: 'auth/callback' });
  console.log('[Auth] Redirect URI (native):', redirectUri);
  return {
    redirectUri,
    promptOptions: {},
  };
}

export async function signInWithGoogleNative(): Promise<OAuthResult> {
  const clientId =
    (Constants.expoConfig?.extra as any)?.googleClientId ?? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return { ok: false, error: 'Missing GOOGLE_CLIENT_ID' };

  const { redirectUri, promptOptions } = resolveRedirect();

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: 'id_token',
    usePKCE: false,
    scopes: ['openid', 'email', 'profile'],
    extraParams: { nonce: randomNonce() },
  });

  const authUrl = await request.makeAuthUrlAsync({ authorizationEndpoint: GOOGLE_AUTH_ENDPOINT });
  console.log('[Auth] Google authUrl:', authUrl);

  const result = await request.promptAsync(
    { authorizationEndpoint: GOOGLE_AUTH_ENDPOINT },
    promptOptions as AuthSession.AuthRequestPromptOptions
  );
  if (result.type !== 'success') return { ok: false, error: 'Canceled or failed' };

  const idToken = (result.params as any).id_token as string | undefined;
  if (!idToken) return { ok: false, error: 'Missing id_token' };

  const payload = b64UrlJson<any>(idToken.split('.')[1]);
  const email = String(payload?.email || '').toLowerCase();
  const name = String(payload?.name || '');
  const avatarUrl = String(payload?.picture || '');
  const sub = String(payload?.sub || '');
  if (!email) return { ok: false, error: 'Token without email' };

  try {
    await (convexHttp as any).mutation('auth:oauthUpsert', {
      email,
      name,
      avatarUrl,
      provider: 'google',
      providerId: sub,
    });
    return { ok: true, email, name, avatarUrl };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Upsert failed' };
  }
}

export async function signInWithMicrosoftNative(): Promise<OAuthResult> {
  const clientId =
    (Constants.expoConfig?.extra as any)?.microsoftClientId ??
    process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
  const tenant =
    (Constants.expoConfig?.extra as any)?.microsoftTenantId ??
    process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID ??
    'common';
  if (!clientId) return { ok: false, error: 'Missing MICROSOFT_CLIENT_ID' };

  const { redirectUri, promptOptions } = resolveRedirect();
  const authEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: 'id_token',
    usePKCE: false,
    scopes: ['openid', 'profile', 'email'],
    extraParams: { response_mode: 'fragment', nonce: randomNonce() },
  });

  const authUrl = await request.makeAuthUrlAsync({ authorizationEndpoint: authEndpoint });
  console.log('[Auth] Microsoft authUrl:', authUrl);

  const result = await request.promptAsync(
    { authorizationEndpoint: authEndpoint },
    promptOptions as AuthSession.AuthRequestPromptOptions
  );
  if (result.type !== 'success') return { ok: false, error: 'Canceled or failed' };

  const idToken = (result.params as any).id_token as string | undefined;
  if (!idToken) return { ok: false, error: 'Missing id_token' };

  const payload = b64UrlJson<any>(idToken.split('.')[1]);
  const email = String(payload?.email || payload?.preferred_username || '').toLowerCase();
  const name = String(payload?.name || '');
  const sub = String(payload?.sub || '');
  if (!email) return { ok: false, error: 'Token without email' };

  try {
    await (convexHttp as any).mutation('auth:oauthUpsert', {
      email,
      name,
      provider: 'microsoft',
      providerId: sub,
    });
    return { ok: true, email, name };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Upsert failed' };
  }
}

