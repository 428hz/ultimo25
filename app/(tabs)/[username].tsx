import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useFollow } from '@/features/create/hooks/useFollow';

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export default function ProfileScreen() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const myUserId = session?.user?.id;
  const isMe = useMemo(() => !!(myUserId && profile?.id === myUserId), [myUserId, profile?.id]);

  const { isFollowing, loading: followLoading, reload: reloadFollow, toggle: toggleFollow } =
    useFollow(profile?.id, myUserId);

  const loadProfile = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      // IMPORTANTE: quitamos 'bio' del select para evitar 400
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('username', String(username).toLowerCase())
        .maybeSingle();
      if (error) throw error;
      setProfile((data as any) || null);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo cargar el perfil.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Header: botón Ajustes cuando es mi perfil (allí está Cerrar sesión)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isMe ? (
          <Pressable onPress={() => router.push('/settings/edit-profile')} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: '#0095f6', fontWeight: '700' }}>Ajustes</Text>
          </Pressable>
        ) : null,
    });
  }, [isMe, navigation, router]);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { reloadFollow(); }, [reloadFollow, profile?.id, myUserId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Perfil no encontrado.</Text>
      </View>
    );
  }

  const initials = (profile.username?.[0] || '?').toUpperCase();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{profile.username || 'usuario'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isMe ? (
          <Pressable
            onPress={() => router.push('/settings/edit-profile')}
            style={[styles.button, { backgroundColor: '#262626' }]}
          >
            <Text style={styles.buttonText}>Editar perfil</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={toggleFollow}
            disabled={followLoading || !myUserId || profile.id === myUserId}
            style={[styles.button, { backgroundColor: isFollowing ? '#404040' : '#0095f6', opacity: followLoading ? 0.7 : 1 }]}
          >
            <Text style={styles.buttonText}>{isFollowing ? 'Dejar de seguir' : 'Seguir'}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingTop: 16, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#222' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontWeight: '700', fontSize: 28 },
  username: { color: '#fff', fontSize: 18, fontWeight: '700' },
  actions: { paddingHorizontal: 16, marginTop: 16 },
  button: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});