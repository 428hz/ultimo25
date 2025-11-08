import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCreatePost } from './hooks/useCreatePost';
import ImagePickerField from './components/ImagePickerField';
import CaptionInput from './components/CaptionInput';

export default function CreatePostScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const router = useRouter();

  const { description, setDescription, uploading, imageUri, canPublish, pickImage, publish, clear } =
    useCreatePost(userId);

  const handlePublish = async () => {
    try {
      const ok = await publish();
      if (ok) router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la publicación.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Crear publicación</Text>
          <ImagePickerField imageUri={imageUri} onPick={pickImage} />
          <CaptionInput value={description} onChange={setDescription} />

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.clearBtn]} onPress={clear} disabled={uploading}>
              <Text style={styles.btnTxt}>Limpiar</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btn,
                { backgroundColor: canPublish ? '#1677ff' : '#2a4a77', opacity: uploading ? 0.6 : 1 },
              ]}
              onPress={handlePublish}
              disabled={!canPublish || uploading}
            >
              <Text style={[styles.btnTxt, { color: '#fff' }]}>{uploading ? 'Publicando…' : 'Publicar'}</Text>
            </Pressable>
          </View>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scroll: {
    flex: 1,
    ...(Platform.OS === 'web' ? { overflowY: 'auto' as any } : {}),
  },
  content: { padding: 16, paddingBottom: 160, flexGrow: 1 },
  inner: { width: '100%', maxWidth: 614, alignSelf: 'center', gap: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#1677ff',
    minWidth: 140,
    alignItems: 'center',
  },
  clearBtn: { backgroundColor: '#333' },
  btnTxt: { color: '#ddd', fontWeight: '700' },
});