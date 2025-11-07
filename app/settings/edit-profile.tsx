import React, { useEffect, useState } from 'react';
import { Alert, Image, TextInput, View, Button, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { safeCall } from '@/services/errors';
import { signOut as signOutService } from '@/services/auth';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
  }, [profile?.username, profile?.avatar_url]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (!asset?.uri) return;

    try {
      setBusy(true);
      const uid = profile?.id!;
      const ext = (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `avatars/${uid}-${Date.now()}.${ext}`;

      const blob = await (await fetch(asset.uri)).blob();
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });
      if (error) throw error;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(data.path);
      setAvatarUrl(pub.publicUrl);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo subir la imagen');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!profile?.id) return;
    setBusy(true);
    const result = await safeCall(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ username, avatar_url: avatarUrl })
        .eq('id', profile.id);
      return { data: undefined, error };
    });
    setBusy(false);

    if (!result.ok) {
      Alert.alert('Error', result.message);
      return;
    }

    await refreshProfile();
    Alert.alert('Listo', 'Perfil actualizado');
    setTimeout(() => router.back(), 400);
  };

  const doSignOut = async () => {
    const res = await signOutService();
    if (!res.ok) {
      Alert.alert('Error', res.message);
      return;
    }
    router.replace('/auth/login');
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, gap: 12, padding: 16 }}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: 120, height: 120, borderRadius: 60, alignSelf: 'center' }} />
      ) : null}
      <Button title="Cambiar foto" onPress={pickImage} disabled={busy} />
      <TextInput
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 }}
      />
      <Button title={busy ? 'Guardando...' : 'Guardar'} onPress={save} disabled={busy} />
      <View style={{ height: 8 }} />
      <Button title="Cerrar sesión" color="#c0392b" onPress={doSignOut} />
    </View>
  );
}