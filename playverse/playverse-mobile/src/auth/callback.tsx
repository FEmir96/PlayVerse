import { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Muy importante: permite a expo-auth-session completar el flujo en web
WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallback() {
  useEffect(() => {
    // Intentá cerrar el popup (si el navegador lo permite)
    const t = setTimeout(() => {
      try { window.close(); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 16, textAlign: 'center' }}>
        Volviendo a PlayVerse… ya podés cerrar esta pestaña.
      </Text>
    </View>
  );
}
