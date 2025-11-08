import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export default function CaptionInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <TextInput
        placeholder="Escribe un pie de foto..."
        placeholderTextColor="#777"
        value={value}
        onChangeText={onChange}
        multiline
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    minHeight: 44,
    maxHeight: 160,
  },
});