import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

type UserSession = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type AuthCtx = {
  session: UserSession | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  updateProfile: async () => false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', uid)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  }, []);

  const ensureProfile = useCallback(async (uid: string, email?: string | null) => {
    let p = await fetchProfile(uid);
    if (!p) {
      const fallback = (email?.split('@')[0] || 'usuario') + '';
      const { error } = await supabase
        .from('profiles')
        .insert({ id: uid, username: fallback });
      if (error) throw error;
      p = await fetchProfile(uid);
    }
    setProfile(p);
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    const p = await fetchProfile(uid);
    setProfile(p);
  }, [session, fetchProfile]);

  const updateProfile = useCallback(async (patch: Partial<Profile>) => {
    const uid = session?.user?.id;
    if (!uid) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ ...patch, id: uid })
      .eq('id', uid);
    if (error) {
      console.warn('[updateProfile] error', error);
      return false;
    }
    await refreshProfile();
    return true;
  }, [session, refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      const uid = data.session?.user?.id || null;
      if (uid) {
        await ensureProfile(uid, data.session?.user?.email);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user?.id) {
        await ensureProfile(sess.user.id, sess.user.email);
      } else {
        setProfile(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const value = useMemo<AuthCtx>(() => ({
    session,
    profile,
    loading,
    refreshProfile,
    updateProfile,
    signOut,
  }), [session, profile, loading, refreshProfile, updateProfile, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}