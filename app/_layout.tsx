import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['pointerEvents is deprecated', 'aria-hidden on an element']);
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Slot, usePathname } from 'expo-router';
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  const authPages = pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/auth/callback';

  if (!isAuth && !authPages) {
    return <Redirect href="/auth/login" />;
  }

  if (isAuth && authPages) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}
