import { useCallback, useMemo, useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import type { Comment, ProfileSlim } from './types';

async function safeCount(table: string, filters: [string, any][]) {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    filters.forEach(([c, v]) => (q = q.eq(c, v)));
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  } catch (e) {
    console.warn(`Count falló en ${table}:`, (e as any)?.message);
    return 0;
  }
}

export function useLikes(postId: number, userId?: string) {
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    const cnt = await safeCount('likes', [['post_id', postId]]);
    setLikesCount(cnt);
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();
        if (error) throw error;
        setLiked(!!data);
      } catch (e) {
        // Si falla el chequeo, asumimos no-like para no romper la UI
        console.warn('Chequeo de like falló:', (e as any)?.message);
        setLiked(false);
      }
    }
  }, [postId, userId]);

  const toggle = useCallback(async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        if (error) throw error;
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId } as any);
        if (error) {
          // Manejo idempotente: si ya existía el like (409/23505), sincronizamos estado sin romper
          const msg = (error as any)?.message || '';
          const code = (error as any)?.code || '';
          if (code === '23505' || msg.includes('duplicate key value')) {
            setLiked(true);
            // opcional: asegurar conteo real desde servidor
            const cnt = await safeCount('likes', [['post_id', postId]]);
            setLikesCount(cnt);
          } else {
            throw error;
          }
        } else {
          setLiked(true);
          setLikesCount((c) => c + 1);
        }
      }
    } catch (e) {
      console.error('Toggle like error:', (e as any)?.message || e);
      // Como fallback, recargar estado real desde servidor
      await reload();
    } finally {
      setLoading(false);
    }
  }, [liked, postId, userId, loading, reload]);

  return { likesCount, liked, loading, reload, toggle };
}

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const cnt = await safeCount('comments', [['post_id', postId]]);
    setCommentsCount(cnt);

    try {
      const { data, error } = await supabase
  .from('comments')
  .select('id, post_id, author_id, content, created_at')
  .eq('post_id', postId)
  .order('created_at', { ascending: true });

      if (error) throw error;

      const rows = (data || []) as any[];

      const authorIds = Array.from(new Set(rows.map((r) => r.author_id))).filter(Boolean) as string[];
      const authorsMap: Record<string, ProfileSlim> = {};
      if (authorIds.length) {
        try {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', authorIds);
          (profs || []).forEach((p: any) => (authorsMap[p.id] = { username: p.username, avatar_url: p.avatar_url }));
        } catch {}
      }
      const mapped: Comment[] = rows.map((r) => ({
        id: String(r.id),
        content: r.content ?? '',
        author_id: r.author_id,
        author: authorsMap[r.author_id] ?? null,
        created_at: r.created_at ?? null,
      }));
      setComments(mapped);
    } catch (e) {
      console.error('Lectura de comments falló:', e);
      setComments([]);
    }
  }, [postId]);

  const add = useCallback(
    async (text: string, authorId: string): Promise<boolean> => {
      if (!text.trim()) return false;
      setLoading(true);
      try {
        const { error } = await supabase.from('comments').insert({
          post_id: postId,
          author_id: authorId,
          content: text.trim(),
        } as any);
        if (error) {
          console.error('Insert comment error:', (error as any)?.message || error);
          return false;
        }
        setCommentsCount((c) => c + 1);
        await load();
        return true;
      } catch (e) {
        console.error('Add comment error:', (e as any)?.message || e);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [load, postId]
  );

  const remove = useCallback(
    async (commentId: string) => {
      setLoading(true);
      try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);
        if (error) throw error;
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentsCount((c) => Math.max(0, c - 1));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { comments, commentsCount, loading, load, add, remove };
}

export function useNormalizedPostId(rawId: string | number) {
  return useMemo(() => (typeof rawId === 'string' ? Number(rawId) : rawId), [rawId]);
}