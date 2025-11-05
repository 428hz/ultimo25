import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function MeRedirect() {
  const { session, profile, ensureProfile, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (loading) return;

      if (!session?.user) {
        if (!cancelled) {
          setResolvedUsername(null);
          setReady(true);
        }
        return;
      }

      const p = profile ?? (await ensureProfile());
      if (cancelled) return;

      setResolvedUsername(p?.username ?? null);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, session?.user?.id, profile?.username, ensureProfile]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!session?.user) {
    return <Redirect href="/auth/login" />;
  }

  if (resolvedUsername) {
    // 'as const' para typedRoutes
    return <Redirect href={{ pathname: '/[username]' as const, params: { username: resolvedUsername } }} />;
  }

  return <Redirect href="/settings/edit-profile" />;
}