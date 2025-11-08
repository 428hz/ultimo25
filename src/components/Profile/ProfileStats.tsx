import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { countFollowers, countFollowing } from '@/services/follows';
import { Link } from 'expo-router';

export default function ProfileStats({ userId, username }: { userId: string; username?: string | null }) {
  const [followers, setFollowers] = useState<number | null>(null);
  const [following, setFollowing] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [a, b] = await Promise.all([countFollowers(userId), countFollowing(userId)]);
      if (!mounted) return;
      if (a.ok) setFollowers(a.data);
      if (b.ok) setFollowing(b.data);
    })();
    return () => { mounted = false; };
  }, [userId]);

  const uname = username || 'usuario';

  return (
    <View style={styles.row}>
      <Link href={`/${uname}/followers`} asChild>
        <Pressable><Text style={styles.stat}><Text style={styles.bold}>{followers ?? '…'}</Text> seguidores</Text></Pressable>
      </Link>
      <Text style={styles.dot}>•</Text>
      <Link href={`/${uname}/following`} asChild>
        <Pressable><Text style={styles.stat}><Text style={styles.bold}>{following ?? '…'}</Text> seguidos</Text></Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 },
  stat: { color: '#eaeaea', fontSize: 14 },
  dot: { color: '#777' },
  bold: { fontWeight: '700', color: '#fff' },
});