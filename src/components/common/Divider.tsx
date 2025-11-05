import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = { label?: string };

export default function Divider({ label = 'o' }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
    ...(Platform.OS === 'web' ? { boxShadow: 'none' } : {}),
  } as any,
  label: { color: '#888', fontSize: 12 },
});