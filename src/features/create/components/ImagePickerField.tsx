import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  imageUri: string | null;
  onPick: () => void;
};

export default function ImagePickerField({ imageUri, onPick }: Props) {
  return (
    <TouchableOpacity style={styles.imagePicker} onPress={onPick}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
      ) : (
        <Text style={styles.imagePlaceholder}>Toca para elegir una imagen</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imagePicker: {
    width: '100%',
    maxWidth: 614,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#363636',
    borderRadius: 8,
    backgroundColor: '#101010',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#aaa' },
});