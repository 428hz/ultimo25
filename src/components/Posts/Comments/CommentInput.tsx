import React from 'react';
import { StyleSheet, Text, TextInput, Pressable, View } from 'react-native';

type Props = {
  value: string;
  onChange: (t: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function CommentInput({ value, onChange, onSubmit, disabled }: Props) {
  return (
    <View style={styles.inputRow}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Añade un comentario…"
        placeholderTextColor="#888"
        style={styles.input}
      />
      <Pressable onPress={onSubmit} style={[styles.sendBtn, disabled && { opacity: 0.6 }]} disabled={disabled}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Publicar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingBottom: 10 },
  input: { flex: 1, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: '#363636', borderRadius: 6, color: '#fff', paddingHorizontal: 10, paddingVertical: 8 },
  sendBtn: { backgroundColor: '#0095f6', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
});