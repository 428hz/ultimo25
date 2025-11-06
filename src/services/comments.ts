import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

export async function listCommentsByPost(postId: string): Promise<Result<Comment[]>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, post_id, author_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    return { data: (data ?? []) as Comment[], error };
  });
}

export async function addComment(postId: string, content: string): Promise<Result<Comment>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, content })
      .select('id, post_id, author_id, content, created_at')
      .single();
    return { data: data as Comment, error };
  });
}

export async function deleteComment(id: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    return { data: undefined as void, error };
  });
}