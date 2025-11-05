import { useCallback, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export function useFollow(targetUserId?: string, myUserId?: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!targetUserId || !myUserId) return;
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', myUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();
    if (!error) setIsFollowing(!!data);
  }, [targetUserId, myUserId]);

  const toggle = useCallback(async () => {
    if (!targetUserId || !myUserId || loading) return;
    if (targetUserId === myUserId) return; // no seguirse a sí mismo
    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', myUserId)
          .eq('following_id', targetUserId);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: myUserId, following_id: targetUserId } as any);
        if (error) {
          const code = (error as any)?.code || '';
          const msg = (error as any)?.message || '';
          if (code === '23505' || msg.includes('duplicate key')) {
            setIsFollowing(true);
          } else {
            throw error;
          }
        } else {
          setIsFollowing(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isFollowing, targetUserId, myUserId, loading]);

  return { isFollowing, loading, reload, toggle };
}