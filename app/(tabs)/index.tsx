import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import Post from '@/components/Posts/Posts';
import type { PostData } from '@/components/Posts/types';

const DEBUG = true;

type Row = {
  id: string | number;
  author_id: string;
  media_url: string | null;
  text_content: string | null;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const normalize = (r: Row): PostData => ({
  id: r.id,
  author_id: r.author_id,
  media_url: r.media_url ?? '',
  text_content: r.text_content ?? '',
  profiles: {
    username: r.profiles?.username ?? '',
    avatar_url: r.profiles?.avatar_url ?? null,
  },
});

export default function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchPosts = async () => {
        setLoading(true);
        setErrMsg(null);
        DEBUG && console.time('[Home] fetchPosts');
        try {
          DEBUG && console.log('[Home] query /rest/v1/posts start');
          const { data, error, status } = await supabase
            .from('posts')
            .select(`
              id, author_id, media_url, text_content,
              profiles:author_id ( username, avatar_url )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

          DEBUG && console.log('[Home] query result', { status, rows: (data as any[])?.length ?? 0, error: error?.message });

          if (error) throw error;

          const rows = ((data ?? []) as unknown) as Row[];
          const normalized = rows.map(normalize);
          if (!cancelled) setPosts(normalized);
        } catch (e: any) {
          const msg = e?.message || e?.error_description || 'No se pudieron cargar las publicaciones. Revisa policies/Network.';
          DEBUG && console.error('[Home] fetch error', msg, e);
          setErrMsg(msg);
        } finally {
          DEBUG && console.timeEnd('[Home] fetchPosts');
          if (!cancelled) setLoading(false);
        }
      };

      fetchPosts();
      return () => { cancelled = true; };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (errMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errMsg}</Text>
        <Text style={styles.hint}>
          Revisá Network → /rest/v1/posts. Si devuelve 401/403, son las policies RLS o la sesión.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.feed}
        data={posts}
        renderItem={({ item }) => (
          <Post
            postData={item}
            onDelete={(id) => setPosts((cur) => cur.filter((p) => String(p.id) !== String(id)))}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Todavía no hay publicaciones. ¡Sé el primero!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  feed: { width: '100%', maxWidth: 614 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 16 },
  emptyText: { color: '#a8a8a8', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#ff6b6b', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  hint: { color: '#bbb', fontSize: 12, textAlign: 'center', maxWidth: 520 },
});