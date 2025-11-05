import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { isAdmin } from '@/utils/rbac';

type Row = { id: string; username: string | null; role: 'user' | 'moderator' | 'admin' | null };

export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin(profile?.role)) {
      Alert.alert('Acceso restringido', 'Debes ser admin para ver esta página.');
      router.replace('/');
    }
  }, [profile?.role, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('id, username, role').order('username', { ascending: true });
      if (error) throw error;
      setRows((data || []) as any);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cycleRole = (r: Row['role']) => (r === 'user' ? 'moderator' : r === 'moderator' ? 'admin' : 'user');

  const updateRole = async (uid: string, next: Row['role']) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: next }).eq('id', uid);
      if (error) throw error;
      setRows(prev => prev.map(p => (p.id === uid ? { ...p, role: next } : p)));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar el rol.');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administración de usuarios</Text>
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.user}>{item.username || item.id.slice(0, 8)}</Text>
            <Text style={styles.role}>{item.role || 'user'}</Text>
            <Pressable style={styles.btn} onPress={() => updateRole(item.id, cycleRole(item.role || 'user'))}>
              <Text style={styles.btnText}>Cambiar</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  center: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontWeight: '700', fontSize: 18, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  user: { color: '#ddd', flex: 1 },
  role: { color: '#aaa', width: 100 },
  btn: { backgroundColor: '#0095f6', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '700' },
});