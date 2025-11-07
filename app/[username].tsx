import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TitleBar from '@/components/common/TitleBar';
import { getProfileByUsername } from '@/services/profiles';
import ProfileStats from '@/components/Profile/ProfileStats';
import ProfilePostsGrid from '@/components/Profile/ProfilePostsGrid';
import FollowButton from '@/components/Header/FollowButton';

export default function PublicProfile() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const [user, setUser] = useState<{ id: string; username: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!username || typeof username !== 'string') {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await getProfileByUsername(username);
      if (!mounted) return;
      if (res.ok) setUser(res.data as any);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <TitleBar showBack title="Perfil" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Usuario no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <TitleBar showBack title="Perfil" />
      <View style={{ paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]} />
          )}
          <Text style={styles.username}>@{user.username}</Text>
        </View>
        <ProfileStats userId={user.id} />
        <View style={{ marginTop: 8 }}>
          <FollowButton targetUserId={user.id} />
        </View>
      </View>

      <ProfilePostsGrid userId={user.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  username: { color: '#fff', fontSize: 18, fontWeight: '700' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#222' },
  placeholder: { backgroundColor: '#333' },
});