import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { convexHttp } from '../lib/convexClient';

WebBrowser.maybeCompleteAuthSession();

type OAuthResult = { ok: boolean; email?: string; name?: string; avatarUrl?: string; error?: string };

function b64UrlJson<T = any>(input: string | undefined): T | undefined {
  if (!input) return undefined;
  try {
    const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

function randomNonce() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function signInWithGoogleNative(): Promise<OAuthResult> {
  const clientId = (Constants.expoConfig?.extra as any)?.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return { ok: false, error: 'Missing GOOGLE_CLIENT_ID' };

  const { uri: redirectUri } = (function(){ const isExpoGo = (require('expo-constants').default.appOwnership === 'expo'); if (isExpoGo) { const u = require('expo-auth-session').makeRedirectUri({ useProxy: true }); console.log('[Auth] Redirect URI (proxy):', u); return { uri: u }; } const u = require('expo-auth-session').makeRedirectUri({ scheme: 'playverse' }); console.log('[Auth] Redirect URI (scheme):', u); return { uri: u }; })();
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: 'id_token',
    scopes: ['openid', 'email', 'profile'],
    extraParams: { nonce: randomNonce() },
  });

  await request.makeAuthUrlAsync({ authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' });
  const result = await request.promptAsync({ authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }, { useProxy: (require('expo-constants').default.appOwnership === 'expo') });
  if (result.type !== 'success') return { ok: false, error: 'Canceled or failed' };

  const idToken = (result.params as any).id_token as string | undefined;
  if (!idToken) return { ok: false, error: 'Missing id_token' };
  const parts = idToken.split('.');
  const payload = b64UrlJson<any>(parts[1]);
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
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Upsert failed' };
  }
}

export async function signInWithMicrosoftNative(): Promise<OAuthResult> {
  const clientId = (Constants.expoConfig?.extra as any)?.microsoftClientId || process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID;
  const tenant = (Constants.expoConfig?.extra as any)?.microsoftTenantId || process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID || 'common';
  if (!clientId) return { ok: false, error: 'Missing MICROSOFT_CLIENT_ID' };

  const { uri: redirectUri } = (function(){ const isExpoGo = (require('expo-constants').default.appOwnership === 'expo'); if (isExpoGo) { const u = require('expo-auth-session').makeRedirectUri({ useProxy: true }); console.log('[Auth] Redirect URI (proxy):', u); return { uri: u }; } const u = require('expo-auth-session').makeRedirectUri({ scheme: 'playverse' }); console.log('[Auth] Redirect URI (scheme):', u); return { uri: u }; })();
  const authEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
    extraParams: { response_mode: 'fragment', nonce: randomNonce() },
  });

  await request.makeAuthUrlAsync({ authorizationEndpoint: authEndpoint });
  const result = await request.promptAsync({ authorizationEndpoint: authEndpoint }, { useProxy: (require('expo-constants').default.appOwnership === 'expo') });
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
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Upsert failed' };
  }
}


