import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

export type Post = {
  id: string;
  author_id: string;
  media_url: string | null;
  text_content: string | null;
  created_at: string;
};

export async function listPosts(): Promise<Result<Post[]>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, media_url, text_content, created_at')
      .order('created_at', { ascending: false });
    return { data: (data ?? []) as Post[], error };
  });
}

export async function getPost(id: string): Promise<Result<Post | null>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, author_id, media_url, text_content, created_at')
      .eq('id', id)
      .maybeSingle();
    return { data: (data ?? null) as Post | null, error };
  });
}

export async function createPost(input: {
  media_url: string | null;
  text_content: string | null;
}): Promise<Result<Post>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert(input)
      .select('id, author_id, media_url, text_content, created_at')
      .single();
    return { data: data as Post, error };
  });
}

export async function deletePost(id: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    return { data: undefined as void, error };
  });
}