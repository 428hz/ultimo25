import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

type ProfileSlim = { username: string; avatar_url: string | null };

type Props = {
  profile?: ProfileSlim;
  authorFallback: string;
  isOwner?: boolean;
  deleting?: boolean;
  onPressDelete?: () => void;
};

export default function PostHeader({ profile, authorFallback }: Props) {
  const username = profile?.username || null;
  const avatarUri = profile?.avatar_url ?? undefined;

  const initial = (username?.[0] ?? authorFallback?.[0] ?? '?').toUpperCase();

  const AvatarNode = avatarUri ? (
    <Image source={{ uri: avatarUri }} style={styles.avatar} />
  ) : (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );

  const TitleNode = username ? (
    <Link href={{ pathname: '/[username]', params: { username } }} asChild>
      <Pressable>
        <Text style={styles.username}>@{username}</Text>
      </Pressable>
    </Link>
  ) : (
    <Text style={styles.usernameMuted}>{shortId(authorFallback)}</Text>
  );

  return (
    <View style={styles.wrap}>
      {AvatarNode}
      <View style={{ flexDirection: 'column' }}>{TitleNode}</View>
    </View>
  );
}

function shortId(id: string) {
  if (!id) return 'usuario';
  if (id.length <= 10) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222' },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c2c2c',
  },
  avatarInitial: { color: '#eaeaea', fontWeight: '700', fontSize: 16 },
  username: { color: '#fff', fontWeight: '600' },
  usernameMuted: { color: '#aaa', fontWeight: '600' },
});