import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  id: string;
  title: string;
  completed?: boolean;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export default function SubtaskItem({ id, title, completed, onToggle, onEdit }: Props) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.left} onPress={() => onToggle?.(id)}>
        <View style={[styles.checkbox, completed ? styles.checked : null]}>
          {completed ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
        <View style={styles.texts}>
          <Text style={[styles.title, completed ? styles.completedText : null]}>{title}</Text>
        </View>
      </Pressable>

      <Pressable style={styles.more} onPress={() => onEdit?.(id)}>
        <Text style={styles.moreText}>⋯</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checked: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  checkMark: { color: '#fff', fontWeight: '700' },
  texts: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: '#888' },
  more: { paddingHorizontal: 12, paddingVertical: 6 },
  moreText: { fontSize: 20, color: '#666' },
});
