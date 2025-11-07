import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

export type Post = {
  id: string;
  author_id: string;
  media_url: string | null;
  text_content: string | null;
  created_at: string;
};

export type ProfileSlim = { id: string; username: string; avatar_url: string | null };
export type PostWithProfile = Post & { profiles?: ProfileSlim | null };

function normalizeRow(row: any): PostWithProfile {
  const profilesRaw = row?.profiles;
  const profiles: ProfileSlim | null = Array.isArray(profilesRaw)
    ? profilesRaw[0] ?? null
    : profilesRaw ?? null;

  return {
    id: String(row.id),
    author_id: String(row.author_id),
    media_url: row.media_url ?? null,
    text_content: row.text_content ?? null,
    created_at: row.created_at ?? '',
    profiles,
  };
}

export async function listPosts(): Promise<Result<PostWithProfile[]>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        media_url,
        text_content,
        created_at,
        profiles:profiles (
          id,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    return { data: (data ?? []).map(normalizeRow), error };
  });
}

export async function listPostsByUser(userId: string): Promise<Result<PostWithProfile[]>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        media_url,
        text_content,
        created_at,
        profiles:profiles (
          id,
          username,
          avatar_url
        )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    return { data: (data ?? []).map(normalizeRow), error };
  });
}

export async function getPost(id: string): Promise<Result<PostWithProfile | null>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        media_url,
        text_content,
        created_at,
        profiles:profiles (
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .maybeSingle();

    return { data: data ? normalizeRow(data) : null, error };
  });
}

export async function createPost(input: {
  media_url: string | null;
  text_content: string | null;
}): Promise<Result<PostWithProfile>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert(input)
      .select(`
        id,
        author_id,
        media_url,
        text_content,
        created_at,
        profiles:profiles (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    return { data: normalizeRow(data), error };
  });
}

export async function deletePost(id: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    return { data: undefined as void, error };
  });
}