import React from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaView, StyleSheet, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header/Header';
import { useAuth } from '@/context/AuthContext';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 420 ? 8 : width < 768 ? 12 : 16;
  const { loading } = useAuth();

  return (
    <SafeAreaView style={styles.canvas}>
      <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
        <Header hideProfileIcon />
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarHideOnKeyboard: true,
              tabBarStyle: { backgroundColor: '#000', borderTopColor: '#363636' },
              tabBarActiveTintColor: 'white',
              tabBarInactiveTintColor: 'gray',
            }}
          >
            <Tabs.Screen
              name="index"
              options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }}
            />
            <Tabs.Screen
              name="create"
              options={{ title: 'Crear', tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={26} color={color} /> }}
            />
            <Tabs.Screen
              name="me"
              options={{ title: 'Perfil', tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }}
            />
            <Tabs.Screen name="[username]" options={{ href: null }} />
          </Tabs>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  container: { flex: 1, width: '100%', maxWidth: 935 },
});