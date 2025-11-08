import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import TitleBar from '@/components/common/TitleBar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const { profile, updateProfile, signOut, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUsername(profile?.username || '');
  }, [profile]);

  const onSave = async () => {
    if (!username.trim()) {
      Alert.alert('Atención', 'El nombre de usuario no puede estar vacío.');
      return;
    }
    setSaving(true);
    try {
      const ok = await updateProfile({ username: username.trim() });
      if (ok) {
        router.back();
      } else {
        Alert.alert('Error', 'No se pudo guardar el perfil.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <TitleBar showBack title="Editar perfil" />
      <View style={styles.body}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          placeholder="usuario"
          placeholderTextColor="#777"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Pressable onPress={onSave} disabled={saving} style={[styles.btn, styles.primaryBtn]}>
          <Text style={styles.btnTxt}>{saving ? 'Guardando…' : 'Guardar'}</Text>
        </Pressable>

        <Pressable onPress={signOut} style={[styles.btn, styles.dangerBtn]}>
          <Text style={styles.btnTxt}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  body: { padding: 16, gap: 12 },
  label: { color: '#aaa', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtn: { backgroundColor: '#1677ff' },
  dangerBtn: { backgroundColor: '#c0392b' },
  btnTxt: { color: '#fff', fontWeight: '700' },
});