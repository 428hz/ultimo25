import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TitleBar from '@/components/common/TitleBar';
import { getPost, type PostWithProfile } from '@/services/posts';
import PostCard from '@/components/Posts/PostCard';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const res = await getPost(String(id));
      if (!mounted) return;
      if (res.ok) setPost(res.data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!post) return null;

  const adapted = {
    id: post.id,
    author_id: post.author_id,
    media_url: post.media_url,
    text_content: post.text_content,
    profiles: post.profiles ?? undefined,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <TitleBar showBack title="Publicación" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <PostCard postData={adapted} />
      </ScrollView>
    </View>
  );
}