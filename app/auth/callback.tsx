import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const ran = useRef(false);
  const { refreshProfile } = useAuth();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        if (typeof code !== 'string' || !code) {
          router.replace('/auth/login');
          return;
        }
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        await refreshProfile();
        router.replace('/');
      } catch (e) {
        console.error('OAuth callback error:', e);
        router.replace('/auth/login');
      }
    })();
  }, [code, refreshProfile, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}