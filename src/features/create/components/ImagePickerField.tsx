import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  imageUri: string | null;
  onPick: () => void;
};

export default function ImagePickerField({ imageUri, onPick }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onPick} style={styles.button}>
        <Text style={styles.btnTxt}>Cambiar imagen</Text>
      </Pressable>

      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={{ color: '#777' }}>Sin imagen</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  button: {
    backgroundColor: '#222',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnTxt: { color: '#ddd', fontWeight: '700' },
  preview: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    backgroundColor: '#0b0b0b',
    padding: 8,
    minHeight: 120,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#000',
  },
});