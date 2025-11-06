import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

export type Notification = {
  id: string;
  user_id: string;   // destinatario
  actor_id: string;  // quién causó la notif
  type: string;      // 'like' | 'comment' | 'follow' ...
  post_id: string | null;
  is_read: boolean | null;
  created_at: string;
};

export async function listMyNotifications(): Promise<Result<Notification[]>> {
  return safeCall(async () => {
    const { data: user, error: uerr } = await supabase.auth.getUser();
    if (uerr) return { data: [] as Notification[], error: uerr };
    const uid = user.user?.id!;
    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, actor_id, type, post_id, is_read, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    return { data: (data ?? []) as Notification[], error };
  });
}

export async function markNotificationRead(id: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    return { data: undefined as void, error };
  });
}

export async function markAllNotificationsRead(): Promise<Result<void>> {
  return safeCall(async () => {
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id!;
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', uid);
    return { data: undefined as void, error };
  });
}