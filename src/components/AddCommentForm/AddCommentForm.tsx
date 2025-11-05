import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';

type Props = {
  postId: number | string;
  onCreated?: () => void;
};

export default function AddCommentForm({ postId, onCreated }: Props) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const { session } = useAuth();
  const userId = session?.user?.id;

  const normalizedPostId = typeof postId === 'string' ? Number(postId) : postId;

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Debes iniciar sesión para comentar.');
      return;
    }
    if (!value.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase.from('comments').insert({
        post_id: normalizedPostId,
        author_id: userId,
        content: value.trim(),
      } as any);
      if (error) throw error;

      setValue('');
      onCreated?.();
    } catch (e: any) {
      console.error('Insert comment error:', e?.message || e);
      Alert.alert('Error', e?.message ?? 'No se pudo agregar el comentario.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Añade un comentario…"
        placeholderTextColor="#888"
        style={styles.input}
        editable={!sending}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={sending || !value.trim()}
        style={[styles.sendBtn, (sending || !value.trim()) && { opacity: 0.6 }]}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>{sending ? 'Enviando…' : 'Publicar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingBottom: 10 },
  input: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 6,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sendBtn: { backgroundColor: '#0095f6', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
});