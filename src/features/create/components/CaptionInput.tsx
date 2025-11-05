import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

type Props = {
  value: string;
  onChange: (t: string) => void;
};

export default function CaptionInput({ value, onChange }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="Escribe un pie de foto..."
      placeholderTextColor="#888"
      style={styles.input}
      multiline
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    maxWidth: 614,
    marginTop: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});