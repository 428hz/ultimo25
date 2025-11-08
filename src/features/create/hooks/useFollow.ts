import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

function looksLikeUUID(s?: string) {
  return !!s && /^[0-9a-fA-F-]{36}$/.test(s);
}

export function useFollow(targetUserId?: string, myUserId?: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!looksLikeUUID(targetUserId) || !looksLikeUUID(myUserId)) {
      setIsFollowing(false);
      return;
    }
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', myUserId as string)
      .eq('following_id', targetUserId as string)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[useFollow::reload] error', error);
      return;
    }
    setIsFollowing(!!data);
  }, [targetUserId, myUserId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggle = useCallback(async () => {
    if (!looksLikeUUID(targetUserId) || !looksLikeUUID(myUserId) || loading) return;
    if (targetUserId === myUserId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', myUserId as string)
          .eq('following_id', targetUserId as string);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: myUserId, following_id: targetUserId } as any);
        if (error) {
          const code = (error as any)?.code || '';
          const msg = (error as any)?.message || '';
          if (code === '23505' || msg?.toLowerCase?.().includes('duplicate')) {
            setIsFollowing(true);
          } else {
            throw error;
          }
        } else {
          setIsFollowing(true);
        }
      }
    } catch (e) {
      console.warn('[useFollow::toggle] error', e);
    } finally {
      setLoading(false);
    }
  }, [isFollowing, targetUserId, myUserId, loading]);

  return { isFollowing, loading, reload, toggle };
}