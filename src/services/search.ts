import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

export type UserHit = { id: string; username: string; avatar_url: string | null };
export type PostHit = { id: string; text_content: string | null; author_id: string; username?: string | null };

export async function searchUsers(q: string): Promise<Result<UserHit[]>> {
  return safeCall(async () => {
    const term = q.trim();
    if (!term) return { data: [] as UserHit[], error: null as any };
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${term}%`)
      .limit(25);
    return { data: (data ?? []) as UserHit[], error };
  });
}

export async function searchPosts(q: string): Promise<Result<PostHit[]>> {
  return safeCall(async () => {
    const term = q.trim();
    if (!term) return { data: [] as PostHit[], error: null as any };
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        text_content,
        author_id,
        profiles:profiles (
          username
        )
      `)
      .ilike('text_content', `%${term}%`)
      .limit(25);

    const hits =
      (data ?? []).map((r: any) => ({
        id: String(r.id),
        text_content: r.text_content ?? null,
        author_id: r.author_id,
        username: Array.isArray(r.profiles) ? r.profiles[0]?.username ?? null : r.profiles?.username ?? null,
      })) as PostHit[];

    return { data: hits, error };
  });
}