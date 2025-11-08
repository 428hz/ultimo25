import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

// A sigue a B => follower_id = A, following_id = B

export async function isFollowing(targetUserId: string): Promise<Result<boolean>> {
  return safeCall(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const me = sess.session?.user?.id;
    if (!me) return { data: false, error: null as any };

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id', { count: 'exact', head: false })
      .eq('follower_id', me)
      .eq('following_id', targetUserId)
      .limit(1);

    if (error) return { data: false, error };
    return { data: (data?.length ?? 0) > 0, error: null as any };
  });
}

export async function followUser(targetUserId: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const me = sess.session?.user?.id;
    if (!me) throw new Error('No autenticado');

    const { error } = await supabase.from('follows').insert({
      follower_id: me,
      following_id: targetUserId,
    });
    return { data: undefined as void, error };
  });
}

export async function unfollowUser(targetUserId: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const me = sess.session?.user?.id;
    if (!me) throw new Error('No autenticado');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', me)
      .eq('following_id', targetUserId);

    return { data: undefined as void, error };
  });
}

// Followers: personas que SIGUEN a este usuario => following_id = userId
export async function countFollowers(userId: string): Promise<Result<number>> {
  return safeCall(async () => {
    const { count, error } = await supabase
      .from('follows')
      .select('follower_id', { count: 'exact', head: false })
      .eq('following_id', userId);

    return { data: count ?? 0, error };
  });
}

// Following: personas a las que este usuario SIGUE => follower_id = userId
export async function countFollowing(userId: string): Promise<Result<number>> {
  return safeCall(async () => {
    const { count, error } = await supabase
      .from('follows')
      .select('following_id', { count: 'exact', head: false })
      .eq('follower_id', userId);

    return { data: count ?? 0, error };
  });
}