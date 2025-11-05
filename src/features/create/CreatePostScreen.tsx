import React from 'react';
import { Platform, StyleSheet, Text, View, Alert } from 'react-native';
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16, alignItems: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12, alignSelf: 'flex-start' },
  hint: { color: '#777', fontSize: 12, marginTop: 12, alignSelf: 'flex-start' },
});