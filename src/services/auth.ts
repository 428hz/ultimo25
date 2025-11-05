import * as Linking from 'expo-linking';
import { supabase } from './supabaseClient';

type Provider = 'google' | 'facebook' | 'github';

export async function signInWithProvider(provider: Provider) {
  const redirectTo = Linking.createURL('/auth/callback');
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: { prompt: 'consent' },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}