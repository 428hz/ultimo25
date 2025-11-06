import * as Linking from 'expo-linking';
import { supabase } from './supabaseClient';
import { Result, safeCall } from './errors';

type Provider = 'google' | 'facebook' | 'github';

export async function signInWithProvider(provider: Provider): Promise<Result<void>> {
  const redirectTo = Linking.createURL('/auth/callback');
  return safeCall(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // Fuerza selector de cuenta en Google
        queryParams: { prompt: 'consent' },
      },
    });
    return { data: undefined as void, error };
  });
}

export async function signInWithEmail(email: string, password: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { data: undefined as void, error };
  });
}

export async function signUpWithEmail(email: string, password: string): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { data: undefined as void, error };
  });
}

export async function signOut(): Promise<Result<void>> {
  return safeCall(async () => {
    const { error } = await supabase.auth.signOut();
    return { data: undefined as void, error };
  });
}