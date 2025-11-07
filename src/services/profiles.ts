import { supabase } from '@/services/supabaseClient';
import { Result, safeCall } from './errors';

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export async function getProfileByUsername(username: string): Promise<Result<Profile | null>> {
  return safeCall(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('username', username)
      .maybeSingle();

    return { data: (data ?? null) as Profile | null, error };
  });
}