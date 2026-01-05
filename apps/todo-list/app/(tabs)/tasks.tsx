import { useFocusEffect } from '@react-navigation/native';
import { Task, TaskWithSubtasks, Category } from '@todolist/shared-types';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../../components/Chip';
import TaskModal from '../../components/tasks/TaskModal';
import useDateFormatter from '../../hooks/useDateFormatter';
import { initDb, getAllCategories, createTask, getAllTasks, getSubtasksForTask } from '../../services';
import Colors from '../../constants/Colors';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksWithSubtasks, setTasksWithSubtasks] = useState<TaskWithSubtasks[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { formatRange } = useDateFormatter();
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deadlineSort, setDeadlineSort] = useState<string>('none');
  const [modalVisible, setModalVisible] = useState(false);

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
      if (filter === 'all') {
        return task.category_id !== 'cat_completed';
      }
      return task.category_id === filter;
    })
    .filter((task) => {
      if (priorityFilter === 'all') return true;
      return task.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (deadlineSort === 'none') return 0;
      const dateA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      const dateB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
      if (deadlineSort === 'asc') return dateA - dateB;
      else if (deadlineSort === 'desc') return dateB - dateA;
      return 0;
    });

  const completedCount = tasksWithSubtasks.filter(t => t.completed).length;
  const totalCount = tasksWithSubtasks.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.priorityHigh;
      case 'medium': return Colors.priorityMedium;
      case 'low': return Colors.priorityLow;
      default: return 'transparent';
    }
  };

  const renderItem = ({ item }: { item: TaskWithSubtasks }) => {
    const dateLabel = formatRange(item.startDate ?? undefined, item.endDate ?? undefined);
    const category = categories.find((c) => c.id === item.category_id);
    const categoryColor = category?.color || Colors.textSecondary;
    const categoryName = category?.name || 'Uncategorized';
    const priorityColor = getPriorityColor(item.priority || '');

    const handleToggleComplete = async (e: any) => {
      e.stopPropagation();
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
          pressed && styles.cardPressed
        ]}
        onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
      >
        {/* Priority Indicator Dot */}
        {priorityColor !== 'transparent' && (
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        )}

        <View style={styles.cardContent}>
          {/* Checkbox */}
          <Pressable
            style={styles.checkboxContainer}
            onPress={handleToggleComplete}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
              {item.completed && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
            </View>
          </Pressable>

          {/* Task Content */}
          <View style={styles.taskContent}>
            <Text style={[styles.title, item.completed && styles.titleCompleted]}>
              {item.name}
            </Text>
            {item.description ? (
              <Text style={[styles.desc, item.completed && styles.descCompleted]} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Chip label={categoryName} color={categoryColor} variant="label" />
              {dateLabel && <Text style={styles.date}>{dateLabel}</Text>}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const filterChips = [
    { id: 'all', label: 'All' },
    ...categories
      .filter((cat) => cat.id !== 'cat_completed')
      .map((cat) => ({ id: cat.id, label: cat.name })),
    ...categories
      .filter((cat) => cat.id === 'cat_completed')
      .map((cat) => ({ id: cat.id, label: cat.name })),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.headerTitle}>Tasks</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={Colors.primary} />
          </Pressable>
        </View>
        <Text style={styles.headerSubtitle}>{completedCount} of {totalCount} completed</Text>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
        style={styles.categoryScroll}
      >
        {filterChips.map((chip) => {
          const active = filter === chip.id;
          return (
            <Pressable
              key={chip.id}
              style={[styles.categoryPill, active && styles.categoryPillActive]}
              onPress={() => setFilter(chip.id)}
            >
              <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sort and Priority Filter Row */}
      <View style={styles.sortFilterRow}>
        <Pressable
          style={styles.sortButton}
          onPress={() => {
            if (deadlineSort === 'none') setDeadlineSort('asc');
            else if (deadlineSort === 'asc') setDeadlineSort('desc');
            else setDeadlineSort('none');
          }}
        >
          <Text style={styles.sortButtonText}>Date</Text>
          <Ionicons
            name={deadlineSort === 'asc' ? 'arrow-up' : deadlineSort === 'desc' ? 'arrow-down' : 'remove-outline'}
            size={14}
            color={Colors.textSecondary}
            style={{ marginLeft: 4 }}
          />
        </Pressable>

        {/* Priority Chip */}
        <Pressable
          style={[
            styles.priorityChip,
            {
              backgroundColor:
                priorityFilter === 'high'
                  ? Colors.priorityHigh
                  : priorityFilter === 'medium'
                    ? Colors.priorityMedium
                    : priorityFilter === 'low'
                      ? Colors.priorityLow
                      : '#E5E7EB',
            },
          ]}
          onPress={() => {
            if (priorityFilter === 'all') setPriorityFilter('high');
            else if (priorityFilter === 'high') setPriorityFilter('medium');
            else if (priorityFilter === 'medium') setPriorityFilter('low');
            else setPriorityFilter('all');
          }}
        >
          <Text
            style={[
              styles.priorityChipText,
              {
                color:
                  priorityFilter === 'all'
                    ? Colors.textSecondary
                    : Colors.white,
              },
            ]}
          >
            {priorityFilter === 'all'
              ? 'Priority'
              : priorityFilter === 'high'
                ? 'High'
                : priorityFilter === 'medium'
                  ? 'Medium'
                  : 'Low'}
          </Text>
        </Pressable>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, filteredTasks.length === 0 && styles.listContentEmpty]}
        scrollEnabled={filteredTasks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found. Tap + to create one!</Text>
          </View>
        }
      />

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={async (task, subtasks) => {
          try {
            await createTask(task);
            if (subtasks && subtasks.length > 0) {
              const { addSubtask } = await import('../../services');
              for (let i = 0; i < subtasks.length; i++) {
                await addSubtask(task.id, { title: subtasks[i], order: i });
              }
            }
            await loadTasks();
            await loadCategories();
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 48,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category Pills
  categoryScroll: {
    height: 40,
    marginTop: 12,
    marginBottom: 8,
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: Colors.white,
  },

  // Sort & Filter Row
  sortFilterRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexGrow: 0,
    flexShrink: 0,
    gap: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Task List
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flex: 1,
    paddingBottom: 20, // Override the large bottom padding when empty
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Task Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardPressed: {
    opacity: 0.7,
  },
  priorityIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    paddingTop: 2,
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  taskContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  descCompleted: {
    color: Colors.textTertiary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});