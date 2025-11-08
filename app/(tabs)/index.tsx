import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { listPosts, type PostWithProfile } from '@/services/posts';
import PostCard from '@/components/Posts/PostCard';

export default function HomeScreen() {
  const [items, setItems] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    const res = await listPosts();
    if (!res.ok) setError(res.message || 'No se pudieron cargar los posts');
    setItems(res.ok ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>{error}</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#777' }}>No hay publicaciones</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => <PostCard postData={{
        id: item.id,
        author_id: item.author_id,
        media_url: item.media_url,
        text_content: item.text_content,
        profiles: item.profiles ?? undefined,
      }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      contentContainerStyle={{ paddingVertical: 10 }}
      style={{ backgroundColor: '#000' }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
});