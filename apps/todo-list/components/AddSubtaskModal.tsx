import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, description?: string) => void;
  initial?: { title?: string; description?: string };
};

export default function AddSubtaskModal({ visible, onClose, onSave, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
    }
  }, [visible, initial]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.header}>Subtask</Text>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Description (optional)" value={description} onChangeText={setDescription} style={[styles.input, { height: 80 }]} multiline />

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.save]}
              onPress={() => {
                if (!title.trim()) return;
                onSave(title.trim(), description.trim() || undefined);
                onClose();
              }}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '90%', backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  header: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  cancel: { backgroundColor: '#eee' },
  save: { backgroundColor: '#007bff' },
  btnText: { fontWeight: '700' },
});
