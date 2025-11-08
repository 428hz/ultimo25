import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View, Pressable } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import ProfileStats from '@/components/Profile/ProfileStats';
import ProfilePostsGrid from '@/components/Profile/ProfilePostsGrid';
import { Link } from 'expo-router';

export default function MeScreen() {
  const { session, profile } = useAuth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ paddingHorizontal: 10, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]} />
          )}
          <Text style={styles.username}>{profile?.username ?? 'usuario'}</Text>
        </View>

        <ProfileStats userId={userId} username={profile?.username} />

        <Link href="/settings/edit-profile" asChild>
          <Pressable style={styles.btn}>
            <Text style={styles.btnTxt}>Editar perfil</Text>
          </Pressable>
        </Link>
      </View>

      <ProfilePostsGrid userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  username: { color: '#fff', fontSize: 18, fontWeight: '700' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#222' },
  placeholder: { backgroundColor: '#333' },
  btn: {
    marginTop: 8,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnTxt: { color: '#ddd', fontWeight: '700' },
});