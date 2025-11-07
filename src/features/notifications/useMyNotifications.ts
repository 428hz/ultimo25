import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { listMyNotifications, markNotificationRead, type Notification } from '@/services/notifications';

export function useMyNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await listMyNotifications();
      setLoading(false);
      if (!res.ok) {
        Alert.alert('Error', res.message);
        return;
      }
      setItems(res.data);
    })();
  }, []);

  const markRead = async (id: string) => {
    const res = await markNotificationRead(id);
    if (!res.ok) {
      Alert.alert('Error', res.message);
      return;
    }
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  return { items, loading, markRead };
}