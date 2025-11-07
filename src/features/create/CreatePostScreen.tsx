import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCreatePost } from './hooks/useCreatePost';
import ImagePickerField from './components/ImagePickerField';
import CaptionInput from './components/CaptionInput';
import PublishActions from './components/PublishActions';

export default function CreatePostScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id || null;
  const router = useRouter();

  const {
    description,
    setDescription,
    uploading,
    imageUri,
    canPublish,
    pickImage,
    publish,
    clear,
  } = useCreatePost(userId);

  const handlePublish = async () => {
    try {
      const ok = await publish();
      if (ok) router.replace('/');
    } catch (e: any) {
      console.error('Publicar error:', e?.message || e);
      Alert.alert('Error', e?.message ?? 'No se pudo crear la publicación.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#000' }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear publicación</Text>

        <ImagePickerField imageUri={imageUri} onPick={pickImage} />

        <CaptionInput value={description} onChange={setDescription} />

        <PublishActions
          canPublish={!!canPublish}
          uploading={uploading}
          onPublish={handlePublish}
          onClear={clear}
        />

        {Platform.OS === 'web' && (
          <Text style={styles.hint}>
            Si el selector falla en web, te paso una variante con input file nativo.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120, gap: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  hint: { color: '#777', fontSize: 12, marginTop: 12 },
});