import React, { useState, useEffect } from 'react';

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Task, Subtask } from '@todolist/shared-types';
import useDateFormatter from '../../hooks/useDateFormatter';
import Chip from '../../components/Chip';
import CalendarRangePicker from '../../components/CalendarRangePicker';
import SubtaskItem from '../../components/SubtaskItem';
import AddSubtaskModal from '../../components/AddSubtaskModal';
import { getTaskById, updateTask, deleteTask } from '../../services/tasks';
import { getSubtasksForTask, addSubtask, updateSubtask, toggleSubtask } from '../../services/subtasks';
import { initDb } from '../../services';

export default function TaskDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id } = params as { id?: string };
  const { formatRange, formatEndDate } = useDateFormatter();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subtaskModal, setSubtaskModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | undefined>(undefined);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Ensure database is initialized before loading task
      await initDb();
      const loadedTask = await getTaskById(id);
      if (loadedTask) {
        setTask(loadedTask);
        const loadedSubtasks = await getSubtasksForTask(id);
        setSubtasks(loadedSubtasks);
      }
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !task) return;
    try {
      await deleteTask(id);
      router.back();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
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
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                handleDelete();
              }}
              style={styles.menuItem}
            >
              <Text style={[styles.menuItemText, { color: '#e74c3c' }]}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.calendarCard}>
          <Text style={styles.rangeText}>{formatRange(task.startDate ?? undefined, task.endDate ?? undefined)}</Text>
          <CalendarRangePicker
            startDate={task.startDate ?? undefined}
            endDate={task.endDate ?? undefined}
            onChange={async (s, e) => {
              if (!id) return;
              try {
                const updated = await updateTask(id, {
                  startDate: s ?? null,
                  endDate: e ?? null,
                });
                if (updated) {
                  setTask(updated);
                }
              } catch (error) {
                console.error('Failed to update task dates:', error);
              }
            }}
          />
        </View>
        <AddSubtaskModal
          visible={subtaskModal}
          initial={editingSubtask ? { title: editingSubtask.title, description: editingSubtask.description ?? undefined } : undefined}
          onClose={() => {
            setSubtaskModal(false);
            setEditingSubtask(undefined);
          }}
          onSave={async (title, description) => {
            if (!id) return;
            try {
              if (editingSubtask) {
                const updated = await updateSubtask(editingSubtask.id, { title, description: description ?? null });
                if (updated) {
                  await loadTask();
                }
              } else {
                await addSubtask(id, { title, description: description ?? null });
                await loadTask();
              }
              setSubtaskModal(false);
              setEditingSubtask(undefined);
            } catch (error) {
              console.error('Failed to save subtask:', error);
            }
          }}
        />

        <View style={styles.card}>
          <Text style={styles.title}>{task.name}</Text>
          {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}
          <View style={styles.rowBetween}>
            <Chip label={task.priority ?? 'medium'} variant="label" color={getPriorityColor(task.priority ?? 'medium')} />
            <Text style={styles.idText}>ID: {task.id}</Text>
          </View>

          {/* Action buttons moved to top-right menu */}
        </View>

        <View style={styles.timelineContainer}>
          {subtasks.length === 0 ? (
            <Text style={{ color: '#666', marginTop: 8 }}>No subtasks</Text>
          ) : (
            subtasks.map((s, idx) => (
              <View key={s.id} style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <View style={styles.timelineDot} />
                  {idx !== subtasks.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <SubtaskItem
                    id={s.id}
                    title={s.title}
                    description={s.description ?? undefined}
                    completed={s.completed ?? false}
                    onToggle={async (sid) => {
                      try {
                        await toggleSubtask(sid);
                        await loadTask();
                      } catch (error) {
                        console.error('Failed to toggle subtask:', error);
                      }
                    }}
                    onEdit={(sid) => {
                      const subtask = subtasks.find((st) => st.id === sid);
                      setEditingSubtask(subtask);
                      setSubtaskModal(true);
                    }}
                  />
                </View>
              </View>
            ))
          )}

          <View style={styles.addButtonWrap}>
            <Pressable
              style={styles.addButton}
              onPress={() => {
                setEditingSubtask(undefined);
                setSubtaskModal(true);
              }}
            >
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
