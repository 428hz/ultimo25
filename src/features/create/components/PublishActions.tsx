import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  canPublish: boolean;
  uploading: boolean;
  onPublish: () => void;
  onClear: () => void;
};

export default function PublishActions({ canPublish, uploading, onPublish, onClear }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClear} disabled={uploading}>
        <Text style={styles.btnGhostText}>Limpiar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnPrimary, (!canPublish || uploading) && { opacity: 0.6 }]}
        onPress={onPublish}
        disabled={!canPublish || uploading}
      >
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Publicar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 12, width: '100%', maxWidth: 614 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: '#444' },
  btnGhostText: { color: '#ddd', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#0095f6' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});