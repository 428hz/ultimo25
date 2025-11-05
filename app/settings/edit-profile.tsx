import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { router } from 'expo-router';

export default function EditProfilePage() {
  const { session, profile, refreshProfile, signOut } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setUsername(profile?.username ?? ''); }, [profile?.username]);

  const onSave = async () => {
    if (!session?.user?.id) return;
    const clean = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
      Alert.alert('Usuario inválido', 'Usa 3-20 caracteres: letras, números o guión bajo.');
      return;
    }
    try {
      setSaving(true);
      const { data: exists } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', clean)
        .neq('id', session.user.id)
        .maybeSingle();
      if (exists) {
        Alert.alert('Nombre de usuario ocupado', 'Elige otro nombre de usuario.');
        return;
      }
      const { error } = await supabase.from('profiles').update({ username: clean }).eq('id', session.user.id);
      if (error) throw error;
      await refreshProfile();
      Alert.alert('Guardado', 'Tu perfil fue actualizado.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    try { await signOut(); } finally { router.replace('/auth/login'); }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Editar perfil</Text>
      <Text style={styles.label}>Nombre de usuario</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="tu_usuario"
        placeholderTextColor="#777"
        style={styles.input}
      />
      <Pressable onPress={onSave} disabled={saving} style={[styles.btn, saving && { opacity: 0.6 }]}>
        <Text style={styles.btnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
      </Pressable>

      <View style={{ height: 24 }} />
      <Pressable onPress={onSignOut} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', padding: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { color: '#bbb', marginBottom: 6 },
  input: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  btn: { backgroundColor: '#0095f6', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: { borderColor: '#444', borderWidth: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#161616' },
  logoutText: { color: '#ff6b6b', fontWeight: '700' },
});