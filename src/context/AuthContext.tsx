import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role?: 'user' | 'moderator' | 'admin';
  updated_at?: string | null;
};

type AuthContextType = {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  loading: boolean;   // solo para “primera carga”
  isAuth: boolean;
  refreshProfile: () => Promise<void>;
  ensureProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  isAuth: false,
  refreshProfile: async () => {},
  ensureProfile: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // solo “bootstrap”
  const initializedRef = useRef(false);         // evita doble init en dev

  const fetchProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, updated_at')
      .eq('id', uid)
      .maybeSingle();
    if (error) {
      console.error('fetchProfile error:', error.message);
      return null;
    }
    return (data as Profile) ?? null;
  }, []);

  const generateUsername = (u: import('@supabase/supabase-js').User) => {
    const meta = (u.user_metadata || {}) as Record<string, any>;
    const fromMeta = meta.preferred_username || meta.user_name || meta.name;
    const fromEmail = u.email?.split('@')[0];
    const base = (fromMeta || fromEmail || 'usuario')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'usuario';
    return base.slice(0, 20);
  };

  const ensureUniqueUsername = useCallback(async (base: string) => {
    const tryUser = async (candidate: string) => {
      const { data } = await supabase.from('profiles').select('id').eq('username', candidate).maybeSingle();
      return data ? null : candidate;
    };
    const first = await tryUser(base);
    if (first) return first;
    for (let i = 1; i <= 50; i++) {
      const candidate = `${base}_${i}`;
      const ok = await tryUser(candidate);
      if (ok) return ok;
    }
    return `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  const upsertProfile = useCallback(async (u: import('@supabase/supabase-js').User) => {
    const meta = (u.user_metadata || {}) as Record<string, any>;
    const avatar = meta.avatar_url || meta.picture || null;

    const base = generateUsername(u);
    const username = await ensureUniqueUsername(base);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: u.id,
          username,
          avatar_url: avatar,
        },
        { onConflict: 'id' }
      )
      .select('id, username, avatar_url, role, updated_at')
      .single();

    if (error) {
      console.error('upsertProfile error:', error.message);
      return null;
    }
    return data as Profile;
  }, [ensureUniqueUsername]);

  const ensureProfile = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) return null;

    if (profile?.id === uid) return profile;

    const existing = await fetchProfile(uid);
    if (existing) {
      setProfile(existing);
      return existing;
    }

    const created = await upsertProfile(session.user);
    if (created) setProfile(created);
    return created;
  }, [fetchProfile, profile, session?.user, upsertProfile]);

  // Para poder llamar ensureProfile dentro del listener sin volver a montar el efecto
  const ensureProfileRef = useRef(ensureProfile);
  useEffect(() => {
    ensureProfileRef.current = ensureProfile;
  }, [ensureProfile]);

  // Bootstrap: solo una vez (aunque React dev doble-monte)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('Auth getSession error:', error.message);
        if (!cancelled) setSession(data?.session ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess ?? null);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          await ensureProfileRef.current();
        } catch (e) {
          console.warn('ensureProfile in listener failed:', (e as any)?.message);
        }
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(session.user.id);
    setProfile(p);
  }, [fetchProfile, session?.user?.id]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,               // solo “primera carga”
      isAuth: !!session?.user,
      refreshProfile,
      ensureProfile,
      signOut,
    }),
    [session, profile, loading, refreshProfile, ensureProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}