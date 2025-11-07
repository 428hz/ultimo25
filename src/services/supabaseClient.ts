import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[Supabase] URL present?', !!SUPABASE_URL, 'Key present?', !!SUPABASE_ANON_KEY);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const hints = [
    !SUPABASE_URL && '• Falta EXPO_PUBLIC_SUPABASE_URL',
    !SUPABASE_ANON_KEY && '• Falta EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'Asegurate que .env esté en la raíz del proyecto (ultimo25), sin comillas ni espacios extra.',
    'Reiniciá con caché limpio: npx expo start --web --clear'
  ].filter(Boolean).join('\n');
  throw new Error(`ConfigError: variables de entorno de Supabase inválidas.\n${hints}`);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});