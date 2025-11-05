import { useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/services/supabaseClient';

const BUCKET = 'posts';

// Fallback compatible (SDKs nuevos/antiguos y web)
const MEDIA_TYPES: any =
  (ImagePicker as any).MediaType?.Images ??
  (ImagePicker as any).MediaTypeOptions?.Images ??
  (ImagePicker as any).MediaTypeOptions?.All ??
  undefined;

export function useCreatePost(userId?: string | null) {
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const canPublish = useMemo(
    () => !!userId && (!!imageUri || !!description.trim()),
    [userId, imageUri, description]
  );

  const pickImage = async () => {
    try {
      // En web no hace falta permiso, pero no daña si se pide
      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar una imagen.');
          return;
        }
      }

      const options: any = { quality: 1, allowsEditing: false };
      if (MEDIA_TYPES) options.mediaTypes = MEDIA_TYPES;

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e: any) {
      console.error('ImagePicker error:', e?.message || e);
      Alert.alert('Error', e?.message ?? 'No se pudo abrir la galería.');
    }
  };

  const clear = () => {
    setImageUri(null);
    setDescription('');
  };

  const uploadToStorage = async (uri: string, uid: string) => {
    const extGuess = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const filePath = `${uid}/${Date.now()}.${extGuess}`;

    const res = await fetch(uri);
    const blob = await res.blob();
    const contentType = blob.type || `image/${extGuess}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
      upsert: true,
      contentType,
    });
    if (upErr) throw upErr;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const publish = async () => {
    if (!userId) {
      Alert.alert('Debes iniciar sesión para publicar.');
      return false;
    }
    if (!canPublish) {
      Alert.alert('Completa la publicación', 'Selecciona una imagen o escribe una descripción.');
      return false;
    }

    try {
      setUploading(true);

      let mediaUrl: string | null = null;
      if (imageUri) {
        mediaUrl = await uploadToStorage(imageUri, userId);
      }

      const { error } = await supabase.from('posts').insert({
        author_id: userId,
        media_url: mediaUrl,
        text_content: description.trim() || null,
      } as any);
      if (error) throw error;

      clear();
      return true;
    } finally {
      setUploading(false);
    }
  };

  return {
    description,
    setDescription,
    uploading,
    imageUri,
    setImageUri,
    canPublish,
    pickImage,
    publish,
    clear,
  };
}