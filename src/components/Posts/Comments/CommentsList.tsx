import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

type ProfileSlim = { username: string; avatar_url: string | null };
type Comment = {
  id: string;
  content: string;
  author_id?: string;
  author?: ProfileSlim | null;
  created_at?: string | null;
};

type Props = {
  comments: Comment[];
  currentUserId?: string;
  isPostOwner?: boolean;
  deletingCommentId?: string | null;
  onRequestDelete?: (id: string) => void;
};

export default function CommentsList({
  comments,
  currentUserId,
  isPostOwner,
  deletingCommentId,
  onRequestDelete,
}: Props) {
  const renderItem = ({ item }: { item: Comment }) => {
    const uname = item.author?.username || null;
    const canDelete = isPostOwner || (!!currentUserId && item.author_id === currentUserId);
    const deleting = deletingCommentId === item.id;

    const UsernameNode = uname ? (
      <Link href={{ pathname: '/[username]', params: { username: uname } }} asChild>
        <Pressable>
          <Text style={styles.username}>@{uname}</Text>
        </Pressable>
      </Link>
    ) : (
      <Text style={styles.usernameMuted}>{shortId(item.author_id || '')}</Text>
    );

    return (
      <View style={styles.row}>
        <View style={styles.bubble}>
          {UsernameNode}
          <Text style={styles.content}>{item.content}</Text>
        </View>
        {canDelete && (
          <Pressable onPress={() => onRequestDelete?.(item.id)} disabled={deleting} style={styles.deleteBtn}>
            {deleting ? <ActivityIndicator size="small" /> : <Text style={styles.deleteTxt}>🗑️</Text>}
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={comments}
      keyExtractor={(c) => c.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      scrollEnabled={false}
    />
  );
}

function shortId(id: string) {
  if (!id) return 'usuario';
  if (id.length <= 10) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 10 },
  bubble: { flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#2c2c2c', borderRadius: 8, padding: 8 },
  username: { color: '#fff', fontWeight: '600', marginBottom: 2 },
  usernameMuted: { color: '#aaa', fontWeight: '600', marginBottom: 2 },
  content: { color: '#eaeaea' },
  deleteBtn: { width: 36, alignItems: 'center', justifyContent: 'center' },
  deleteTxt: { color: '#c0392b', fontSize: 16 },
});