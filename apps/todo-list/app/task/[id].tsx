import React, { useState } from 'react';

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import mockTodos from '../../constants/mockTodos';
import useDateFormatter from '../../hooks/useDateFormatter';
import Chip from '../../components/Chip';
import CalendarRangePicker from '../../components/CalendarRangePicker';
import SubtaskItem from '../../components/SubtaskItem';
import AddSubtaskModal from '../../components/AddSubtaskModal';

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id } = params as { id?: string };
  const todo = mockTodos.find((t) => t.id === id);
  const { formatRange, formatEndDate } = useDateFormatter();
  const [localTodo, setLocalTodo] = useState(() => (todo ? { ...todo } : undefined));
  const [menuOpen, setMenuOpen] = useState(false);
  const [subtaskModal, setSubtaskModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<string | undefined>(undefined);

  if (!todo) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.center}>
          <Text>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <View style={styles.topRight}>
        <Pressable onPress={() => setMenuOpen((s) => !s)} style={styles.menuBtn}>
          <Text style={styles.menuText}>⋯</Text>
        </Pressable>
        {menuOpen ? (
          <View style={styles.menuPopup}>
            <Pressable onPress={() => { setMenuOpen(false); /* TODO: implement edit */ }} style={styles.menuItem}>
              <Text style={styles.menuItemText}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => { setMenuOpen(false); /* TODO: implement delete */ }} style={styles.menuItem}>
              <Text style={[styles.menuItemText, { color: '#e74c3c' }]}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.calendarCard}>
          <Text style={styles.rangeText}>{formatRange(localTodo?.startDate, localTodo?.endDate)}</Text>
          <CalendarRangePicker
            startDate={localTodo?.startDate}
            endDate={localTodo?.endDate}
            onChange={(s, e) => {
              // update local todo and mutate mockTodos for persistence in this demo
              if (!localTodo) return;
              const updated = { ...localTodo, startDate: s ?? localTodo.startDate, endDate: e ?? localTodo.endDate };
              setLocalTodo(updated);
              const idx = mockTodos.findIndex((t) => t.id === localTodo.id);
              if (idx >= 0) mockTodos[idx] = updated;
            }}
          />
        </View>
        <AddSubtaskModal
          visible={subtaskModal}
          initial={editingSubtask ? localTodo?.subtasks?.find((s) => s.id === editingSubtask) : undefined}
          onClose={() => { setSubtaskModal(false); setEditingSubtask(undefined); }}
          onSave={(title, description) => {
            if (!localTodo) return;
            if (editingSubtask) {
              const subs = (localTodo.subtasks ?? []).map((ss) => (ss.id === editingSubtask ? { ...ss, title, description } : ss));
              const updated = { ...localTodo, subtasks: subs };
              setLocalTodo(updated);
              const idx = mockTodos.findIndex((t) => t.id === localTodo.id);
              if (idx >= 0) mockTodos[idx] = updated;
            } else {
              // generate a simple incrementing numeric id (per-todo)
              const existing = (localTodo.subtasks ?? []).map((s) => Number(s.id)).filter((n) => !Number.isNaN(n));
              const max = existing.length ? Math.max(...existing) : 0;
              const idNew = String(max + 1);
              const newSub = { id: idNew, title, description, completed: false };
              const subs = [...(localTodo.subtasks ?? []), newSub];
              const updated = { ...localTodo, subtasks: subs };
              setLocalTodo(updated);
              const idx = mockTodos.findIndex((t) => t.id === localTodo.id);
              if (idx >= 0) mockTodos[idx] = updated;
            }
          }}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{todo.name}</Text>
          {todo.description ? <Text style={styles.desc}>{todo.description}</Text> : null}
          <View style={styles.rowBetween}>
            <Chip label={todo.priority} variant="label" color={getPriorityColor(todo.priority)} />
            <Text style={styles.idText}>ID: {todo.id}</Text>
          </View>

          {/* Action buttons moved to top-right menu */}
        </View>

        <View style={styles.timelineContainer}>
          {(localTodo?.subtasks ?? []).length === 0 ? (
            <Text style={{ color: '#666', marginTop: 8 }}>No subtasks</Text>
          ) : (
            (localTodo?.subtasks ?? []).map((s, idx) => (
              <View key={s.id} style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <View style={styles.timelineDot} />
                  {idx !== (localTodo?.subtasks?.length ?? 0) - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <SubtaskItem
                    id={s.id}
                    title={s.title}
                    description={s.description}
                    completed={s.completed}
                    onToggle={(sid) => {
                      if (!localTodo) return;
                      const subs = (localTodo.subtasks ?? []).map((ss) => (ss.id === sid ? { ...ss, completed: !ss.completed } : ss));
                      const updated = { ...localTodo, subtasks: subs };
                      setLocalTodo(updated);
                      const idx2 = mockTodos.findIndex((t) => t.id === localTodo.id);
                      if (idx2 >= 0) mockTodos[idx2] = updated;
                    }}
                    onEdit={(sid) => {
                      setEditingSubtask(sid);
                      setSubtaskModal(true);
                    }}
                  />
                </View>
              </View>
            ))
          )}

          <View style={styles.addButtonWrap}>
            <Pressable style={styles.addButton} onPress={() => { setEditingSubtask(undefined); setSubtaskModal(true); }}>
              <Text style={styles.addButtonText}>Add Subtask</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getPriorityColor(p: string) {
  if (p === 'high') return '#e74c3c';
  if (p === 'medium') return '#f39c12';
  return '#2ecc71';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { padding: 12 },
  backText: { color: '#007bff', fontWeight: '600' },
  content: { padding: 16, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  calendarCard: { backgroundColor: '#f2f7ff', padding: 12, borderRadius: 8, marginBottom: 12 },
  calendarTitle: { fontWeight: '700', marginBottom: 8 },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateBox: { flex: 1, alignItems: 'center', padding: 8 },
  dateLabel: { color: '#555', marginBottom: 4 },
  dateValue: { fontSize: 18, fontWeight: '700' },
  rangeText: { marginTop: 8, color: '#666', fontSize: 12, textAlign: 'center' },
  card: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  desc: { color: '#555', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  idText: { color: '#888', fontSize: 12 },
  actionsRow: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  editBtn: { backgroundColor: '#e6f7ff' },
  deleteBtn: { backgroundColor: '#ffecec' },
  actionText: { fontWeight: '700' },
  topRight: { position: 'absolute', right: 12, top: 12, zIndex: 20 },
  menuBtn: { padding: 8, borderRadius: 8 },
  menuText: { fontSize: 22, color: '#333' },
  menuPopup: { position: 'absolute', right: 0, top: 36, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, width: 120, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 6 },
  menuItem: { paddingVertical: 8, paddingHorizontal: 12 },
  menuItemText: { fontWeight: '600' },
  addSubtaskBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  timelineContainer: { marginTop: 12, padding: 8 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  timelineMarker: { width: 24, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 6, backgroundColor: '#007bff', marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e6eefc', marginTop: 6 },
  addButtonWrap: { alignItems: 'center', marginTop: 12 },
  addButton: { backgroundColor: '#007bff', width: '80%', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
});
