import React, { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabaseClient';
import Divider from '@/components/common/Divider';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && pass.length > 0 && !loading;

  const signInEmail = useCallback(async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      if (error) {
        console.error('[Login] signInWithPassword error:', error);
        Alert.alert('Error', error.message ?? 'No se pudo iniciar sesión.');
        return;
      }
      console.log('[Login] signIn ok, user:', data.user?.id);
      await refreshProfile(); // hidrata el perfil en el contexto
      router.replace('/');    // ir a tabs/home
    } catch (e: any) {
      console.error('[Login] unexpected:', e);
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }, [canSubmit, email, pass, refreshProfile, router]);

  const signInOAuth = useCallback(async (provider: 'google' | 'facebook' | 'github') => {
    try {
      setLoading(true);
      const redirectTo =
        Platform.OS === 'web'
          ? `${window.location.origin}/auth/callback`
          : Linking.createURL('/auth/callback');

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          scopes: provider === 'facebook' ? 'public_profile,email' : undefined,
        },
      });
      if (error) {
        console.error('[Login] OAuth error:', error);
        Alert.alert('Error', error.message ?? 'No se pudo iniciar con OAuth.');
        setLoading(false);
      }
      // En OAuth el control se transfiere al provider; al volver a /auth/callback,
      // el AuthContext se hidrata y redirige.
    } catch (e: any) {
      console.error('[Login] OAuth unexpected:', e);
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar con OAuth.');
      setLoading(false);
    }
  }, []);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          editable={!loading}
        />
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="Contraseña"
          placeholderTextColor="#777"
          style={styles.input}
          secureTextEntry
          editable={!loading}
          onSubmitEditing={signInEmail}
        />

        <Pressable disabled={!canSubmit} onPress={signInEmail} style={[styles.btn, !canSubmit && { opacity: 0.6 }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Iniciar sesión</Text>}
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
    </KeyboardAvoidingView>
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
  oauthBtn: { borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  footer: { color: '#bbb', textAlign: 'center', marginTop: 12 },
  link: { color: '#0095f6', fontWeight: '700' },
});