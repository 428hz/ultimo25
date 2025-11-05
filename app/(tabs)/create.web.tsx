import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { uploadObjectToBucket } from '@/utils/storageUpload';
import { supabase } from '@/services/supabaseClient';
import { router } from 'expo-router';

export default function CreateWeb() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);

  const chooseFile = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setCaption('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const publish = async () => {
    if (posting || !userId || !file) return;

    try {
      setPosting(true);

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${userId}/${Date.now()}.${ext}`;

      const media_url = await uploadObjectToBucket({
        bucket: 'posts',
        path,
        data: file,
        contentType: file.type || 'image/jpeg',
      });

      const { error } = await supabase
        .from('posts')
        .insert({ author_id: userId, media_url, text_content: caption })
        .single();

      if (error) throw error;

      setSuccess(true);
      clear();
      setTimeout(() => router.replace('/'), 1200);
    } catch (e: any) {
      console.error('Publicar error (web):', e?.message || e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Crear publicación</Text>

      {success && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Publicación creada con éxito</Text>
        </View>
      )}

      <Pressable style={styles.pick} onPress={chooseFile} disabled={posting} accessibilityRole="button">
        <Text style={styles.pickText}>{file ? 'Cambiar imagen' : 'Elegir imagen'}</Text>
      </Pressable>
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />

      {preview && <Image source={{ uri: preview }} style={styles.preview} resizeMode="contain" />}

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
        <Pressable style={[styles.btn, { backgroundColor: '#222' }]} onPress={clear} disabled={posting}>
          <Text style={styles.btnText}>Limpiar</Text>
        </Pressable>
        <Pressable style={[styles.btn, posting && { opacity: 0.7 }]} onPress={publish} disabled={posting}>
          <Text style={styles.btnText}>{posting ? 'Publicando…' : 'Publicar'}</Text>
        </Pressable>
      </View>

      <View style={{ height: 12 }} />
      <Text style={{ color: '#999' }}>En web se usa input file nativo para máxima compatibilidad.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', padding: 12 },
  title: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 10 },
  banner: {
    backgroundColor: '#113f1a',
    borderColor: '#1f7a2e',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  bannerText: { color: '#9ee6ad', fontWeight: '700', textAlign: 'center' },
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