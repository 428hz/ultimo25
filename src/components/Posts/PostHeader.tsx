import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ProfileSlim } from './types';

type Props = {
  profile?: ProfileSlim;
  authorFallback: string;
  isOwner: boolean;
  deleting?: boolean;
  onPressDelete?: () => void;
};

export default function PostHeader({ profile, authorFallback, isOwner, deleting, onPressDelete }: Props) {
  const username = profile?.username ?? authorFallback ?? 'usuario';

  return (
    <View style={styles.header}>
      <Image
        source={{ uri: profile?.avatar_url || `https://i.pravatar.cc/150?u=${username}` }}
        style={styles.avatar}
      />

      <Pressable onPress={() => router.push(`/${username}`)} style={{ flex: 1 }}>
        <Text style={styles.username}>{username}</Text>
      </Pressable>

      {isOwner && (
        <Pressable onPress={onPressDelete} disabled={!!deleting} style={{ marginLeft: 'auto' }}>
          {deleting ? (
            <ActivityIndicator color="#f55" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#f55" />
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#555' },
  username: { color: '#fff', fontWeight: '600' },
});