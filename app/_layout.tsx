import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['pointerEvents is deprecated', 'aria-hidden on an element']);

import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Guard />
    </AuthProvider>
  );
}

function Guard() {
  const { isAuth, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const authPages =
      pathname === '/auth/login' ||
      pathname === '/auth/register' ||
      pathname === '/auth/callback';

    let target: string | null = null;

    if (!isAuth && !authPages) {
      target = '/auth/login';
    } else if (isAuth && authPages) {
      target = '/';
    }

    if (
      target &&
      target !== pathname &&
      target !== lastRedirectRef.current
    ) {
      lastRedirectRef.current = target;
      router.replace(target);
    }
  }, [loading, isAuth, pathname, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return <Slot />;
}