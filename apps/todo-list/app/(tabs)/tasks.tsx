import { useFocusEffect } from '@react-navigation/native';
import { Task, TaskWithSubtasks, Category } from '@todolist/shared-types';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Modal, ScrollView } from 'react-native';
import Chip from '../../components/Chip';
import TaskModal from '../../components/tasks/TaskModal';
import useDateFormatter from '../../hooks/useDateFormatter';
import { initDb, getAllCategories, createTask, getAllTasks, getSubtasksForTask } from '../../services';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksWithSubtasks, setTasksWithSubtasks] = useState<TaskWithSubtasks[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { formatRange } = useDateFormatter();
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all'); // all, low, medium, high
  const [deadlineSort, setDeadlineSort] = useState<string>('none'); // none, asc, desc
  const [modalVisible, setModalVisible] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      await initDb();
      const loadedTasks = await getAllTasks();
      setTasks(loadedTasks);

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
      loadCategories();
      loadTasks();
    }, [loadCategories, loadTasks])
  );

  const filteredTasks = tasksWithSubtasks
    .filter((task) => {
      // Category filter
      if (filter === 'all') {
        // Exclude completed tasks from "All" view
        return task.category_id !== 'cat_completed';
      }
      return task.category_id === filter;
    })
    .filter((task) => {
      // Priority filter
      if (priorityFilter === 'all') return true;
      return task.priority === priorityFilter;
    })
    .sort((a, b) => {
      // Deadline sort
      if (deadlineSort === 'none') return 0;

      const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;

      if (deadlineSort === 'asc') {
        return dateA - dateB;
      } else if (deadlineSort === 'desc') {
        return dateB - dateA;
      }
      return 0;
    });

  const renderItem = ({ item }: { item: TaskWithSubtasks }) => {
    const dateLabel = formatRange(item.startDate ?? undefined, item.endDate ?? undefined);
    const category = categories.find((c) => c.id === item.category_id);
    const categoryColor = category?.color || '#999';
    const categoryName = category?.name || 'Uncategorized';

    const handleToggleComplete = async (e: any) => {
      e.stopPropagation(); // Prevent navigation to task details
      try {
        const { setTaskCompletion } = await import('../../services');
        await setTaskCompletion(item.id, !item.completed);
        await loadTasks();
      } catch (error) {
        console.error('Failed to toggle task completion:', error);
      }
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          item.completed && styles.cardCompleted,
          pressed ? styles.cardPressed : null
        ]}
        onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
      >
        {item.subtasks && item.subtasks.length ? (
          <View style={styles.subtaskCorner}>
            <Text style={styles.subtaskText}>
              {item.subtasks.filter((s) => s.completed).length}/{item.subtasks.length}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardContent}>
          {/* Radio Button */}
          <Pressable
            style={styles.radioButton}
            onPress={handleToggleComplete}
          >
            <View style={[styles.radioOuter, item.completed && styles.radioOuterChecked]}>
              {item.completed && <View style={styles.radioInner} />}
            </View>
          </Pressable>

          {/* Task Content */}
          <View style={styles.taskContent}>
            <Text style={[styles.title, item.completed && styles.titleCompleted]}>
              {item.name}
            </Text>
            {item.description ? (
              <Text style={[styles.desc, item.completed && styles.descCompleted]}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.row}>
              <Chip label={categoryName} color={categoryColor} variant="label" />
              <Text style={styles.dates}>{dateLabel}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const filterChips = [
    { id: 'all', label: 'All', color: '#999' },
    ...categories
      .filter((cat) => cat.id !== 'cat_completed') // Exclude Completed from normal position
      .map((cat) => ({ id: cat.id, label: cat.name, color: cat.color || '#999' })),
    // Add Completed category at the end if it exists
    ...categories
      .filter((cat) => cat.id === 'cat_completed')
      .map((cat) => ({ id: cat.id, label: cat.name, color: cat.color || '#999' })),
  ];

  return (
    <View style={styles.container}>
      {/* Category Filter Chips */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterScroll}
        >
          {filterChips.map((chip) => {
            const active = filter === chip.id;
            return (
              <Chip
                key={chip.id}
                label={chip.label}
                color={chip.color}
                variant="filter"
                active={active}
                onPress={() => setFilter(chip.id)}
                style={{ marginRight: 8 }}
              />
            );
          })}
        </ScrollView>

        {/* Filter Button - Always visible */}
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonIcon}>⚙</Text>
          <Text style={styles.filterButtonText}>Filter</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, filteredTasks.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found. Create one to get started!</Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={async (task, subtasks) => {
          try {
            await createTask(task);

            // Save subtasks if any
            if (subtasks && subtasks.length > 0) {
              const { addSubtask } = await import('../../services');
              for (let i = 0; i < subtasks.length; i++) {
                await addSubtask(task.id, { title: subtasks[i], order: i });
              }
            }

            await loadTasks();
            await loadCategories(); // Reload categories in case a new one was created
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }}
      />

      {/* Filter Modal */}
      {showFilterModal && (
        <Pressable
          style={styles.filterModalBackdrop}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable style={styles.filterModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.filterModalTitle}>Filter Options</Text>

            {/* Priority Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionLabel}>Priority</Text>
              <View style={styles.filterOptions}>
                {['all', 'low', 'medium', 'high'].map((p) => (
                  <Pressable
                    key={p}
                    style={[
                      styles.filterOption,
                      priorityFilter === p && styles.filterOptionActive,
                    ]}
                    onPress={() => setPriorityFilter(p)}
                  >
                    <View
                      style={[
                        styles.filterOptionDot,
                        {
                          backgroundColor:
                            p === 'all'
                              ? '#999'
                              : p === 'high'
                                ? '#e74c3c'
                                : p === 'medium'
                                  ? '#f39c12'
                                  : '#2ecc71',
                        },
                      ]}
                    />
                    <Text style={styles.filterOptionText}>
                      {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                    {priorityFilter === p && <Text style={styles.filterOptionCheck}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Deadline Sort Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionLabel}>Deadline Sort</Text>
              <View style={styles.filterOptions}>
                {[
                  { id: 'none', label: 'None' },
                  { id: 'asc', label: 'Ascending (Earliest First)' },
                  { id: 'desc', label: 'Descending (Latest First)' },
                ].map((d) => (
                  <Pressable
                    key={d.id}
                    style={[
                      styles.filterOption,
                      deadlineSort === d.id && styles.filterOptionActive,
                    ]}
                    onPress={() => setDeadlineSort(d.id)}
                  >
                    <Text style={styles.filterOptionText}>{d.label}</Text>
                    {deadlineSort === d.id && <Text style={styles.filterOptionCheck}>✓</Text>}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Close Button */}
            <Pressable
              style={styles.filterModalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.filterModalCloseText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 120 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterScroll: {
    flex: 1,
  },
  filterScrollContent: {
    paddingRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginLeft: 8,
  },
  filterButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  filterModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  filterOptions: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterOptionActive: {
    backgroundColor: '#f0f7ff',
  },
  filterOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  filterOptionCheck: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '700',
  },
  filterModalCloseButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  filterModalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chipsContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    padding: 4,
    marginRight: 8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterChecked: {
    borderColor: '#10b981',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
  },
  taskContent: {
    flex: 1,
  },
  cardPressed: { opacity: 0.8 },
  cardCompleted: {
    backgroundColor: '#e8e8e8',
    opacity: 0.85,
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  desc: { color: '#555', marginBottom: 8 },
  descCompleted: {
    color: '#999',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { color: '#fff', fontWeight: '600', textTransform: 'capitalize' },
  dates: { color: '#666', fontSize: 12 },
  subtaskCorner: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#eef6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 5,
  },
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});