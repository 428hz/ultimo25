import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import TitleBar from '@/components/common/TitleBar';
import { getProfileByUsername } from '@/services/profiles';
import { supabase } from '@/services/supabaseClient';

type Hit = { id: string; username: string | null };

export default function FollowingList() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const [owner, setOwner] = useState<{ id: string; username: string | null } | null>(null);
  const [items, setItems] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!username) return;
      const p = await getProfileByUsername(String(username));
      if (p.ok && p.data) {
        setOwner(p.data);
        const { data } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', p.data.id);
        const ids = (data || []).map((r: any) => r.following_id);
        if (ids.length) {
          const { data: users } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', ids);
          if (mounted) setItems((users || []) as any);
        } else {
          if (mounted) setItems([]);
        }
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [username]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <TitleBar showBack title="Seguidos" />
      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <View style={{ padding: 12, gap: 8 }}>
          {items.map((u) => (
            <Link key={u.id} href={`/${u.username}`} asChild>
              <Pressable style={styles.item}>
                <Text style={styles.name}>@{u.username}</Text>
              </Pressable>
            </Link>
          ))}
          {!items.length && <Text style={styles.empty}>Sin seguidos</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { borderWidth: 1, borderColor: '#222', borderRadius: 10, padding: 12 },
  name: { color: '#fff', fontWeight: '700' },
  empty: { color: '#777' },
});