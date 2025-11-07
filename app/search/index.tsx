import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import TitleBar from '@/components/common/TitleBar';
import { searchPosts, searchUsers, type PostHit, type UserHit } from '@/services/search';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState<UserHit[]>([]);
  const [posts, setPosts] = useState<PostHit[]>([]);

  useEffect(() => {
    const h = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setUsers([]);
        setPosts([]);
        return;
      }
      setBusy(true);
      const [ru, rp] = await Promise.all([searchUsers(term), searchPosts(term)]);
      if (ru.ok) setUsers(ru.data);
      if (rp.ok) setPosts(rp.data);
      setBusy(false);
    }, 250);
    return () => clearTimeout(h);
  }, [q]);

  const showEmpty = useMemo(() => !busy && !users.length && !posts.length && !!q.trim(), [busy, users, posts, q]);

  return (
    <View style={styles.page}>
      <TitleBar showBack title="Buscar" />

      <TextInput
        placeholder="Buscar usuarios o posts…"
        placeholderTextColor="#888"
        value={q}
        onChangeText={setQ}
        style={styles.input}
      />

      {busy && <ActivityIndicator style={{ marginTop: 12 }} />}

      {!!users.length && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Usuarios</Text>
          {users.map((u) => (
            <Link key={u.id} href={`/${u.username}`} asChild>
              <Pressable style={styles.item}>
                <Text style={styles.user}>@{u.username}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {!!posts.length && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Posts</Text>
          {posts.map((p) => (
            <View key={p.id} style={styles.item}>
              <Link href={`/post/${p.id}`} asChild>
                <Pressable>
                  <Text style={styles.postCaption}>{p.text_content || '(sin texto)'}</Text>
                </Pressable>
              </Link>
              {p.username && (
                <Link href={`/${p.username}`} asChild>
                  <Pressable>
                    <Text style={styles.userLight}>@{p.username}</Text>
                  </Pressable>
                </Link>
              )}
            </View>
          ))}
        </View>
      )}

      {showEmpty && <Text style={styles.empty}>Sin resultados</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', padding: 8 },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
  section: { color: '#aaa', fontWeight: '700', marginBottom: 6, marginTop: 8 },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#0c0c0c',
  },
  user: { color: '#fff', fontWeight: '700' },
  userLight: { color: '#9ad', marginTop: 4 },
  postCaption: { color: '#eaeaea' },
  empty: { color: '#777', marginTop: 12 },
});