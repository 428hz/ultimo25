import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { listPostsByUser, type PostWithProfile } from '@/services/posts';

export default function ProfilePostsGrid({ userId }: { userId: string }) {
  const [items, setItems] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await listPostsByUser(userId);
      if (mounted) {
        if (res.ok) setItems(res.data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!items.length) return null;

  return (
    <FlatList
      data={items}
      numColumns={3}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <Link href={`/post/${item.id}`} asChild>
          <Pressable style={styles.cell}>
            {item.media_url ? (
              <Image source={{ uri: item.media_url }} style={styles.thumb} />
            ) : (
              <View style={styles.emptyThumb} />
            )}
          </Pressable>
        </Link>
      )}
      contentContainerStyle={{ paddingHorizontal: 6, paddingTop: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  cell: { width: '33.3333%', aspectRatio: 1, padding: 4 },
  thumb: { width: '100%', height: '100%', borderRadius: 6, backgroundColor: '#111' },
  emptyThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },
});