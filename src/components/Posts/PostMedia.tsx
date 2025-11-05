import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function PostMedia({ uri }: { uri: string | null | undefined }) {
  if (!uri) {
    return (
      <View style={[styles.media, styles.mediaPlaceholder]}>
        <Text style={{ color: '#888' }}>Sin imagen</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.media} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  media: { width: '100%', aspectRatio: 1, backgroundColor: '#000' },
  mediaPlaceholder: { justifyContent: 'center', alignItems: 'center' },
});