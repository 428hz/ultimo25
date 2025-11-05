import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  hideProfileIcon?: boolean;
};

export default function Header({ hideProfileIcon }: Props) {
  return (
    <View style={styles.wrap}>
      <Link href="/" asChild>
        <Pressable>
          <Text style={styles.brand}>Instagram</Text>
        </Pressable>
      </Link>

      <View style={styles.actions}>
        <Link href="/" asChild>
          <Pressable>
            <Ionicons name="home-outline" size={22} color="#fff" />
          </Pressable>
        </Link>

        <Link href="/create" asChild>
          <Pressable>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </Pressable>
        </Link>

        {!hideProfileIcon && (
          <Link href="/me" asChild>
            <Pressable>
              <Ionicons name="person-outline" size={22} color="#fff" />
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: '#fff', fontSize: 20, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 14, alignItems: 'center' },
});