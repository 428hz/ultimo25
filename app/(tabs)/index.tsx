import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import PostCard from '@/components/Posts/PostCard';
import { listPosts } from '@/services/posts';
import type { PostData } from '@/components/Posts/types';

export default function FeedScreen() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await listPosts();
    if (!res.ok) {
      Alert.alert('Error', res.message);
      return;
    }
    // listPosts devuelve id/author_id/media_url/text_content; PostCard acepta profiles como opcional
    setPosts(res.data as unknown as PostData[]);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDeleted = useCallback((deletedId: string | number) => {
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(deletedId)));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => <PostCard postData={item} onDelete={handleDeleted} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
}