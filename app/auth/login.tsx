import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabaseClient';
import Divider from '@/components/common/Divider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const signInEmail = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
      if (error) throw error;
      // El Guard en app/_layout.tsx redirige al Home tras autenticación
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const signInOAuth = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      setLoading(true);
      const redirectTo = Linking.createURL('/auth/callback');
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar con OAuth.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}>Instagram</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          placeholderTextColor="#777"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="Contraseña"
          placeholderTextColor="#777"
          style={styles.input}
          secureTextEntry
        />

        <Pressable disabled={loading} onPress={signInEmail} style={[styles.btn, loading && { opacity: 0.7 }]}>
          <Text style={styles.btnText}>Iniciar sesión</Text>
        </Pressable>

        <View style={{ height: 14 }} />
        <Divider label="o" />
        <View style={{ height: 14 }} />

        <Pressable disabled={loading} onPress={() => signInOAuth('google')} style={[styles.oauthBtn, { backgroundColor: '#ea4335' }]}>
          <Text style={styles.btnText}>Continuar con Google</Text>
        </Pressable>
        <Pressable disabled={loading} onPress={() => signInOAuth('facebook')} style={[styles.oauthBtn, { backgroundColor: '#1877f2' }]}>
          <Text style={styles.btnText}>Continuar con Facebook</Text>
        </Pressable>
        <Pressable disabled={loading} onPress={() => signInOAuth('github')} style={[styles.oauthBtn, { backgroundColor: '#333' }]}>
          <Text style={styles.btnText}>Continuar con GitHub</Text>
        </Pressable>

        <View style={{ height: 10 }} />

        <Text style={styles.footer}>
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/register" style={styles.link}>
            Regístrate
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0e0e0e',
    borderColor: '#222',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  brand: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  btn: { backgroundColor: '#0095f6', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  oauthBtn: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  footer: { color: '#bbb', textAlign: 'center', marginTop: 12 },
  link: { color: '#0095f6', fontWeight: '700' },
});