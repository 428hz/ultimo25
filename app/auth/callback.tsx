import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { ensureProfile } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (code && typeof code === 'string') {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        await ensureProfile();
        if (!cancelled) router.replace('/');
      } catch (e) {
        console.error('OAuth callback error:', e);
        if (!cancelled) router.replace('/auth/login');
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#fff" />
    </View>
  );
}