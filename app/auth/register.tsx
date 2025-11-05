import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { ensureProfile } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = async () => {
    const cleanUser = username.trim().toLowerCase();
    if (!name.trim()) return Alert.alert('Falta nombre');
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
      return Alert.alert('Usuario inválido', 'Usa 3-20 caracteres: letras, números o guión bajo.');
    }
    if (!email.trim() || !email.includes('@')) return Alert.alert('Email inválido');
    if (pass.length < 6) return Alert.alert('Contraseña muy corta', 'Mínimo 6 caracteres.');
    const { data: exists, error } = await supabase.from('profiles').select('id').eq('username', cleanUser).maybeSingle();
    if (error) console.warn('Check username error:', error.message);
    if (exists) return Alert.alert('Nombre de usuario ocupado', 'Elige otro.');
    return cleanUser;
  };

  const onRegister = async () => {
    try {
      const cleanUser = (await validate()) as string | undefined;
      if (!cleanUser) return;

      setLoading(true);

      const redirectTo = Linking.createURL('/auth/callback');

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            name: name.trim(),
            preferred_username: cleanUser,
          },
        },
      });

      if (error) throw error;

      if (!data.session) {
        Alert.alert('Revisa tu email', 'Te enviamos un link para confirmar tu cuenta.');
        router.replace('/auth/login');
        return;
      }

      const uid = data.session.user.id;
      const { error: upErr } = await supabase
        .from('profiles')
        .upsert({ id: uid, username: cleanUser }, { onConflict: 'id' })
        .select('id')
        .single();
      if (upErr) throw upErr;

      await ensureProfile();
      router.replace('/');
    } catch (e: any) {
      Alert.alert('No se pudo registrar', e?.message ?? 'Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor="#777" style={styles.input} />

        <TextInput
          value={username}
          onChangeText={(t) => setUsername(t.replace(/\s+/g, '_'))}
          placeholder="Nombre de usuario"
          placeholderTextColor="#777"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" style={styles.input} />

        <TextInput value={pass} onChangeText={setPass} placeholder="Contraseña" placeholderTextColor="#777" secureTextEntry style={styles.input} />

        <Pressable onPress={onRegister} disabled={loading} style={[styles.btn, loading && { opacity: 0.7 }]}>
          <Text style={styles.btnText}>{loading ? 'Creando…' : 'Registrarme'}</Text>
        </Pressable>

        <Text style={styles.footer}>
          ¿Ya tienes cuenta? <Link href="/auth/login" style={styles.link}>Inicia sesión</Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#0e0e0e', borderColor: '#222', borderWidth: 1, borderRadius: 10, padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  btn: { backgroundColor: '#0095f6', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700' },
  footer: { color: '#bbb', textAlign: 'center', marginTop: 12 },
  link: { color: '#0095f6', fontWeight: '700' },
});