import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { blobFromUri, uploadObjectToBucket } from '@/utils/storageUpload';
import { supabase } from '@/services/supabaseClient';
import { router } from 'expo-router';

export default function CreateNative() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setImageUri(res.assets[0].uri);
    }
  };

  const clear = () => {
    setImageUri(null);
    setCaption('');
  };

  const publish = async () => {
    if (posting) return;
    if (!userId) { Alert.alert('Debes iniciar sesión'); return; }
    if (!imageUri) { Alert.alert('Elegí una imagen'); return; }
    try {
      setPosting(true);
      const blob = await blobFromUri(imageUri);
      const path = `${userId}/${Date.now()}.jpg`;

      const media_url = await uploadObjectToBucket({
        bucket: 'posts',
        path,
        data: blob,
        contentType: 'image/jpeg',
      });

      const { error: insErr } = await supabase
        .from('posts')
        .insert({ author_id: userId, media_url, text_content: caption })
        .single();
      if (insErr) throw insErr;

      Alert.alert('Listo', 'Publicación creada con éxito', [{ text: 'OK', onPress: () => router.replace('/') }]);
      clear();
    } catch (e: any) {
      console.error('Publicar error (native):', e?.message || e);
      Alert.alert('Error', e?.message || 'No se pudo publicar');
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Crear publicación</Text>

      <TouchableOpacity style={styles.pick} onPress={pickImage} disabled={posting}>
        <Text style={styles.pickText}>{imageUri ? 'Cambiar imagen' : 'Elegir imagen'}</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />}

      <TextInput
        placeholder="Escribe un pie de foto…"
        placeholderTextColor="#777"
        value={caption}
        onChangeText={setCaption}
        style={styles.input}
        editable={!posting}
        multiline
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#222' }]} onPress={clear} disabled={posting}>
          <Text style={styles.btnText}>Limpiar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, posting && { opacity: 0.7 }]} onPress={publish} disabled={posting}>
          <Text style={styles.btnText}>{posting ? 'Publicando…' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', padding: 12 },
  title: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 10 },
  pick: { backgroundColor: '#1f1f1f', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  pickText: { color: '#fff', fontWeight: '700' },
  preview: { width: '100%', height: 360, backgroundColor: '#111', borderWidth: 1, borderColor: '#333', borderRadius: 8, marginBottom: 10 },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    marginBottom: 10,
  },
  btn: { flex: 1, backgroundColor: '#0095f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});