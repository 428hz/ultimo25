import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { ensureProfile } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // Si no hay código, salir del callback hacia login una sola vez
        if (!code || typeof code !== 'string') {
          router.replace('/auth/login');
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        await ensureProfile();
        router.replace('/');
      } catch (e) {
        console.error('OAuth callback error:', e);
        router.replace('/auth/login');
      }
    })();
  }, [code]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#fff" />
    </View>
  );
}