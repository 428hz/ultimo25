import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

/**
 * Usamos la tabla 'follows' (follower_id, following_id).
 * Si tu app usa 'followers' también, avisame y adapto.
 */

export async function isFollowing(targetUserId: string): Promise<Result<boolean>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
    // data es null en count-only; usá supabase.getCount()
    // Pero en v2, count viene en la respuesta si select head:true
    // El SDK no expone count aquí, así que hacemos otra consulta mínima:
    const { data: rows, error: err2 } = await supabase
      .from('follows')
      .select('id')
      .eq('following_id', targetUserId)
      .limit(1);
    const finalError = error || err2;
    return { data: !!rows?.length, error: finalError };
  });
}

export async function followUser(targetUserId: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.from('follows').insert({ following_id: targetUserId });
    return { data: undefined as void, error };
  });
}

export async function unfollowUser(targetUserId: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.from('follows').delete().eq('following_id', targetUserId);
    return { data: undefined as void, error };
  });
}

export async function countFollowers(userId: string): Promise<Result<number>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('following_id', userId);
    return { data: data?.length ?? 0, error };
  });
}

export async function countFollowing(userId: string): Promise<Result<number>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId);
    return { data: data?.length ?? 0, error };
  });
}