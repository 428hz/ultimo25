import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  liked: boolean;
  likesText: string;
  onToggleLike: () => void;
  onToggleComments: () => void;
};

export default function PostActions({ liked, likesText, onToggleLike, onToggleComments }: Props) {
  return (
    <>
      <View style={styles.actions}>
        <Pressable onPress={onToggleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#e74c3c' : '#fff'} />
        </Pressable>
        <Pressable onPress={onToggleComments}>
          <Ionicons name="chatbubble-outline" size={26} color="#fff" />
        </Pressable>
        <Ionicons name="paper-plane-outline" size={26} color="#fff" />
        {/* Bookmark removido por ahora */}
      </View>
      <Text style={styles.likesText}>{likesText}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingTop: 10 },
  likesText: { color: '#fff', fontWeight: '600', paddingHorizontal: 10, paddingTop: 6 },
});