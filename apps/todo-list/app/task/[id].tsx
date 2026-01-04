import React, { useState, useEffect } from 'react';

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Task, Subtask } from '@todolist/shared-types';
import useDateFormatter from '../../hooks/useDateFormatter';
import Chip from '../../components/Chip';
import AddSubtaskModal from '../../components/tasks/AddSubtaskModal';
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
        <AddSubtaskModal
          visible={subtaskModal}
          initial={editingSubtask ? { title: editingSubtask.title } : undefined}
          onClose={() => {
            setSubtaskModal(false);
            setEditingSubtask(undefined);
          }}
          onSave={async (title) => {
            if (!id) return;

            if (editingSubtask) {
              // Optimistic update for editing
              setSubtasks((prev) =>
                prev.map((st) =>
                  st.id === editingSubtask.id ? { ...st, title } : st
                )
              );

              setSubtaskModal(false);
              setEditingSubtask(undefined);

              // Update database in background
              try {
                await updateSubtask(editingSubtask.id, { title });
              } catch (error) {
                console.error('Failed to update subtask:', error);
                // Reload on error
                await loadTask();
              }
            } else {
              // Optimistic update for adding
              const tempId = 'temp_' + Date.now();
              const newSubtask: Subtask = {
                id: tempId,
                task_id: id,
                title,
                completed: false,
                order: subtasks.length,
              };

              setSubtasks((prev) => [...prev, newSubtask]);
              setSubtaskModal(false);

              // Add to database in background
              try {
                const created = await addSubtask(id, { title });
                // Replace temp subtask with real one
                setSubtasks((prev) =>
                  prev.map((st) => (st.id === tempId ? created : st))
                );
              } catch (error) {
                console.error('Failed to add subtask:', error);
                // Remove temp subtask on error
                setSubtasks((prev) => prev.filter((st) => st.id !== tempId));
              }
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

        <View style={styles.subtasksCard}>
          <Text style={styles.subtasksTitle}>Subtasks</Text>

          {subtasks.length === 0 ? (
            <Text style={styles.noSubtasksText}>No subtasks yet</Text>
          ) : (
            <ScrollView style={styles.subtasksScroll} nestedScrollEnabled>
              {subtasks.map((s) => (
                <View key={s.id} style={styles.subtaskRow}>
                  <Pressable
                    style={styles.radioButton}
                    onPress={async () => {
                      // Optimistic update - update UI immediately
                      setSubtasks((prev) =>
                        prev.map((st) =>
                          st.id === s.id ? { ...st, completed: !st.completed } : st
                        )
                      );

                      // Then update database in background
                      try {
                        await toggleSubtask(s.id);
                      } catch (error) {
                        console.error('Failed to toggle subtask:', error);
                        // Revert on error
                        setSubtasks((prev) =>
                          prev.map((st) =>
                            st.id === s.id ? { ...st, completed: !st.completed } : st
                          )
                        );
                      }
                    }}
                  >
                    {s.completed && <View style={styles.radioButtonInner} />}
                  </Pressable>
                  <Text style={[styles.subtaskTitle, s.completed && styles.subtaskTitleCompleted]}>
                    {s.title}
                  </Text>
                  <Pressable
                    onPress={() => {
                      const subtask = subtasks.find((st) => st.id === s.id);
                      setEditingSubtask(subtask);
                      setSubtaskModal(true);
                    }}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>✎</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          <Pressable
            style={styles.addSubtaskButton}
            onPress={() => {
              setEditingSubtask(undefined);
              setSubtaskModal(true);
            }}
          >
            <Text style={styles.addSubtaskText}>+ Add subtask</Text>
          </Pressable>
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
  subtasksCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  subtasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  noSubtasksText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  subtasksScroll: {
    maxHeight: 250,
    marginBottom: 12,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 18,
    color: '#666',
  },
  addSubtaskButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addSubtaskText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
