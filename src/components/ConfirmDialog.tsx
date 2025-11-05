import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  message?: React.ReactNode | string | number;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title = 'Confirmar',
  message = '',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const renderMessage = () => {
    if (typeof message === 'string' || typeof message === 'number') {
      return <Text style={styles.msg}>{String(message)}</Text>;
    }
    return <View style={{ marginTop: 6 }}>{message}</View>;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {renderMessage()}

          <View style={styles.row}>
            <Pressable onPress={onCancel} disabled={loading} style={[styles.btn, styles.ghostBtn]}>
              <Text style={styles.ghostText}>{cancelText}</Text>
            </Pressable>

            <Pressable onPress={onConfirm} disabled={loading} style={[styles.btn, styles.primaryBtn]}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{confirmText}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,.6)', justifyContent: 'center', alignItems: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: 'none' } : {}),
  } as any,
  card: {
    width: '90%', maxWidth: 420, backgroundColor: '#0e0e0e',
    borderColor: '#222', borderWidth: 1, borderRadius: 12, padding: 16,
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 6, textAlign: 'center' },
  msg: { color: '#ddd', marginTop: 6, textAlign: 'center' },
  row: { marginTop: 14, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  btn: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  ghostBtn: { backgroundColor: '#1a1a1a' },
  primaryBtn: { backgroundColor: '#0095f6' },
  ghostText: { color: '#ddd', fontWeight: '600' },
  primaryText: { color: '#fff', fontWeight: '700' },
});