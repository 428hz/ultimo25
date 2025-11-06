import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { loading, isAuth } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isAuth) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}