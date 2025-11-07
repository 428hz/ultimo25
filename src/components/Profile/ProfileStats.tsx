import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { countFollowers, countFollowing } from '@/services/follows';

export default function ProfileStats({ userId }: { userId: string }) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [a, b] = await Promise.all([countFollowers(userId), countFollowing(userId)]);
      if (!mounted) return;
      if (a.ok) setFollowers(a.data);
      if (b.ok) setFollowing(b.data);
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <View style={styles.row}>
      <Text style={styles.stat}><Text style={styles.bold}>{followers}</Text> seguidores</Text>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.stat}><Text style={styles.bold}>{following}</Text> seguidos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 10, marginTop: 8 },
  stat: { color: '#eaeaea' },
  dot: { color: '#777' },
  bold: { fontWeight: '700', color: '#fff' },
});