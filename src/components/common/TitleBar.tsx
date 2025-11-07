import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export default function TitleBar({ title = 'Instagram', showBack = true, right }: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" color="#fff" size={22} />
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 48,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#fff', fontWeight: '700', fontSize: 18 },
  iconBtn: { padding: 4 },
});