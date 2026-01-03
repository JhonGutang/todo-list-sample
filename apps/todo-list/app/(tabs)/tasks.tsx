import React, { useState, useCallback } from 'react';
import { Text, View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Task, TaskWithSubtasks } from '@todolist/shared-types';
import { CHIPS, FILTER_CHIPS } from '../../constants/chips';
import useDateFormatter from '../../hooks/useDateFormatter';
import Chip from '../../components/Chip';
import TaskModal from '../../components/TaskModal';
import { useRouter } from 'expo-router';
import { getAllTasks, createTask } from '../../services/tasks';
import { getSubtasksForTask } from '../../services/subtasks';
import { initDb } from '../../services';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksWithSubtasks, setTasksWithSubtasks] = useState<TaskWithSubtasks[]>([]);
  const { formatRange } = useDateFormatter();
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      // Ensure database is initialized before loading tasks
      await initDb();
      const loadedTasks = await getAllTasks();
      setTasks(loadedTasks);
      
      // Load subtasks for each task
      const tasksWithSubs = await Promise.all(
        loadedTasks.map(async (task) => {
          const subtasks = await getSubtasksForTask(task.id);
          return { ...task, subtasks };
        })
      );
      setTasksWithSubtasks(tasksWithSubs);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );


  const filteredTasks = filter === 'all' ? tasksWithSubtasks : tasksWithSubtasks.filter((t) => t.priority === filter);

  const renderItem = ({ item }: { item: TaskWithSubtasks }) => {
    const dateLabel = formatRange(item.startDate ?? undefined, item.endDate ?? undefined);
    const priority = item.priority ?? 'medium';
    const tag = CHIPS.find((t) => t.id === priority) ?? { color: '#999', label: priority };

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
        onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
      >
        {item.subtasks && item.subtasks.length ? (
          <View style={styles.subtaskCorner}>
            <Text style={styles.subtaskText}>{item.subtasks.filter((s) => s.completed).length}/{item.subtasks.length}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{item.name}</Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        <View style={styles.row}>
          <Chip label={tag.label} color={tag.color} variant="label" />
          <Text style={styles.dates}>{dateLabel}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {FILTER_CHIPS.map((tag) => {
          const active = filter === tag.id;
          return (
            <Chip
              key={tag.id}
              label={tag.label}
              color={tag.color}
              variant="filter"
              active={active}
              onPress={() => setFilter(tag.id as any)}
              style={{ marginRight: 8 }}
            />
          );
        })}
      </View>

      <FlatList data={filteredTasks} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} />

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={async (task) => {
          try {
            const created = await createTask(task);
            await loadTasks(); // Reload to get the new task with subtasks
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 120 },
  chipsContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12 },
  cardPressed: { opacity: 0.8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  desc: { color: '#555', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  high: { backgroundColor: '#e74c3c' },
  medium: { backgroundColor: '#f39c12' },
  low: { backgroundColor: '#2ecc71' },
  dates: { color: '#666', fontSize: 12 },
  subtaskCorner: { position: 'absolute', right: 12, top: 12, backgroundColor: '#eef6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 5 },
  subtaskText: { color: '#007bff', fontWeight: '700', fontSize: 12 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 28 },
});