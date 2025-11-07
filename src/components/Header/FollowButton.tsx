import React, { useEffect, useState } from 'react';
import { Alert, Button } from 'react-native';
import { followUser, unfollowUser, isFollowing } from '@/services/follows';

type Props = { targetUserId: string };

export default function FollowButton({ targetUserId }: Props) {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await isFollowing(targetUserId);
      if (mounted && res.ok) setFollowing(res.data);
      setBusy(false);
    })();
    return () => { mounted = false; };
  }, [targetUserId]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const res = following ? await unfollowUser(targetUserId) : await followUser(targetUserId);
    setBusy(false);
    if (!res.ok) {
      Alert.alert('Error', res.message);
      return;
    }
    setFollowing((v) => !v);
  };

  return <Button title={following ? 'Siguiendo' : 'Seguir'} onPress={toggle} disabled={busy} />;
}