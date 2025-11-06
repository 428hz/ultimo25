import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

type Role = 'user' | 'moderator' | 'admin';

type Props = {
  roles?: Role[];           // si no se pasa, solo requiere estar autenticado
  fallbackHref?: string;    // dónde mandar si no tiene permiso
  children?: React.ReactNode;
};

export default function RoleGate({ roles, fallbackHref = '/', children }: Props) {
  const { loading, isAuth, profile } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuth) {
    return <Redirect href="/auth/login" />;
  }

  if (roles && roles.length > 0) {
    const role = profile?.role ?? 'user';
    if (!roles.includes(role)) {
      return <Redirect href={fallbackHref} />;
    }
  }

  return <>{children}</>;
}