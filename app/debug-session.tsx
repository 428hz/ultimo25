import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/services/supabaseClient';

export default function DebugSession() {
  const [sess, setSess] = useState<any>(null);

  const load = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.warn('getSession error:', error.message);
    setSess(data?.session ?? null);
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const clear = async () => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.clear();
    } catch {}
    await supabase.auth.signOut();
    setSess(null);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Debug Session</Text>
      <Text style={styles.mono}>{JSON.stringify(sess, null, 2)}</Text>

      <View style={{ height: 12 }} />
      <TouchableOpacity style={styles.btn} onPress={load}>
        <Text style={styles.btnText}>Reload session</Text>
      </TouchableOpacity>

      <View style={{ height: 8 }} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#444' }]} onPress={clear}>
        <Text style={styles.btnText}>Clear localStorage + Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  title: { color: '#fff', fontWeight: '700', fontSize: 18, marginBottom: 8 },
  mono: { color: '#0f0', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  btn: { backgroundColor: '#0095f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});