import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Comment } from '../types';

type Props = {
  comment: Comment;
  canDelete: boolean;
  deleting?: boolean;
  onDelete?: (id: string) => void;
};

export default function CommentItem({ comment, canDelete, deleting, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: comment.author?.avatar_url || `https://i.pravatar.cc/100?u=${comment.author?.username ?? comment.id}` }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>
          <Text style={styles.user}>{comment.author?.username ?? 'usuario'} </Text>
          {comment.content}
        </Text>
      </View>
      {canDelete && (
        <Pressable
          onPress={() => onDelete?.(comment.id)}
          disabled={deleting}
          style={{ padding: 4, opacity: deleting ? 0.5 : 1 }}
          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
        >
          {deleting ? <ActivityIndicator size="small" color="#f55" /> : <Ionicons name="trash-outline" size={18} color="#f55" />}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingBottom: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#555' },
  text: { color: '#ddd', flexShrink: 1 },
  user: { color: '#fff', fontWeight: '600' },
});