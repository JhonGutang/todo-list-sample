import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Todo } from '../constants/mockTodos';
import { CHIPS } from '../constants/chips';
import Chip from './Chip';
import DateInput from './DateInput';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (todo: Todo) => void;
};

export default function TaskModal({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [isMounted, setIsMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 visible

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
      });
    }
  }, [visible, anim]);

  const reset = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setPriority('medium');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const todo: Todo = {
      id: String(Date.now()),
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    };

    onCreate(todo);
    reset();
    onClose();
  };

  if (!isMounted) return null;

  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Modal visible={isMounted} transparent animationType="none">
      <View style={styles.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} pointerEvents="box-none">
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Create Task</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Task name" />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.multiline]} placeholder="Description" multiline />

            <Text style={styles.label}>Start date (optional)</Text>
            <DateInput value={startDate} onChange={(iso) => setStartDate(iso ?? '')} />

            <Text style={styles.label}>End date (optional)</Text>
            <DateInput value={endDate} onChange={(iso) => setEndDate(iso ?? '')} />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipsRow}>
              {CHIPS.map((c) => (
                <Chip key={c.id} label={c.label} color={c.color} variant="filter" active={priority === c.id} onPress={() => setPriority(c.id)} style={{ marginRight: 8 }} />
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionButton, styles.cancel]} onPress={() => { reset(); onClose(); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.create]} onPress={handleCreate}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  absoluteFill: { ...StyleSheet.absoluteFillObject },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '80%' },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8 },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', marginTop: 8, marginBottom: 16 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  actionButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ddd' },
  create: { backgroundColor: '#007bff' },
  cancelText: { color: '#333' },
  createText: { color: '#fff', fontWeight: '700' },
});
