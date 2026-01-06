import { useFocusEffect } from '@react-navigation/native';
import { Task, TaskWithSubtasks, Category } from '@todolist/shared-types';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chip from '../../components/Chip';
import TaskModal from '../../components/tasks/TaskModal';
import useDateFormatter from '../../hooks/useDateFormatter';
import { initDb, getAllCategories, createTask, setTaskCompletion, addSubtask } from '../../services';
import { useTheme } from '../../contexts/ThemeContext';
import { useTasks } from '../../contexts/TasksContext';
import TaskCard from '../../components/tasks/TaskCard';
import { getPriorityColor } from '../../utils/theme';
import { buildFilterChips } from '../../utils/categories';
import { applyTaskFilters } from '../../lib/task-filters';
import { SortOrder } from '../../types/ui';

export default function TasksPage() {
  const router = useRouter();
  const { theme, themeType } = useTheme();
  const { tasks: tasksWithSubtasks, loadTasks } = useTasks();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deadlineSort, setDeadlineSort] = useState<SortOrder>('none');
  const [modalVisible, setModalVisible] = useState(false);
  const [focusCount, setFocusCount] = useState(0);
  const insets = useSafeAreaInsets();
  const horizontalPadding = Math.max(20, insets.left, insets.right);

  const completedCount = tasksWithSubtasks.filter(t => t.completed).length;
  const totalCount = tasksWithSubtasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocusCount(prev => prev + 1);
      loadCategories();
      loadTasks();
    }, [loadCategories, loadTasks])
  );

  const filteredTasks = applyTaskFilters(
    tasksWithSubtasks,
    filter,
    priorityFilter,
    deadlineSort
  );

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await setTaskCompletion(taskId, completed);
      await loadTasks();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const renderItem = ({ item, index }: { item: TaskWithSubtasks; index: number }) => {
    return (
      <TaskCard
        key={`${item.id}-${filter}-${priorityFilter}-${deadlineSort}-${focusCount}`}
        item={item}
        index={index}
        categories={categories}
        onToggleComplete={handleToggleComplete}
        priorityColor={getPriorityColor(item.priority || '', theme)}
      />
    );
  };

  const CATEGORY_ORDER = ['cat_personal', 'cat_work', 'cat_projects', 'cat_habit', 'cat_others'];
  const filterChips = buildFilterChips(categories, CATEGORY_ORDER);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingHorizontal: horizontalPadding,
          backgroundColor: 'transparent',
          paddingVertical: 0,
          paddingTop: 16,
        }
      ]}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: theme.primary }]}>
              <Text style={[styles.logoText, { color: theme.white }]}>M</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Tasks</Text>
          </View>
          <Pressable
            style={[
              styles.addButton,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                borderWidth: 1,
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0,
                shadowRadius: 4,
                elevation: 0,
              }
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={theme.primary} />
          </Pressable>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {completedCount} of {totalCount} completed
        </Text>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
        style={[styles.categoryScroll, { marginHorizontal: horizontalPadding }]}
      >
        {filterChips.map((chip) => {
          const active = filter === chip.id;
          return (
            <Pressable
              key={chip.id}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 24,
                },
                active && {
                  backgroundColor: theme.primary,
                  borderColor: 'transparent',
                  borderWidth: 0
                }
              ]}
              onPress={() => setFilter(chip.id)}
            >
              <Text style={[
                styles.categoryPillText,
                { color: theme.textSecondary },
                active && { color: theme.white }
              ]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sort and Priority Filter Row */}
      <View style={[styles.sortFilterRow, { paddingHorizontal: horizontalPadding }]}>
        <Pressable
          style={styles.sortButton}
          onPress={() => {
            if (deadlineSort === 'none') setDeadlineSort('asc');
            else if (deadlineSort === 'asc') setDeadlineSort('desc');
            else setDeadlineSort('none');
          }}
        >
          <Text style={[styles.sortButtonText, { color: theme.textSecondary }]}>Date</Text>
          <Ionicons
            name={deadlineSort === 'asc' ? 'arrow-up' : deadlineSort === 'desc' ? 'arrow-down' : 'remove-outline'}
            size={14}
            color={theme.textSecondary}
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
                  ? theme.priorityHigh
                  : priorityFilter === 'medium'
                    ? theme.priorityMedium
                    : priorityFilter === 'low'
                      ? theme.priorityLow
                      : theme.border,
              borderRadius: 12,
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
                    ? theme.textSecondary
                    : theme.white,
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
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => `${item.id}-${filter}-${priorityFilter}-${deadlineSort}-${focusCount}`}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: horizontalPadding },
            filteredTasks.length === 0 && styles.listContentEmpty
          ]}
          scrollEnabled={filteredTasks.length > 0}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks found. Tap + to create one!</Text>
            </View>
          }
        />
      </View>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={async (task, subtasks) => {
          try {
            await createTask(task);
            if (subtasks && subtasks.length > 0) {
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
  },

  // Header
  header: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 48,
    fontWeight: '500',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category Pills
  categoryScroll: {
    height: 48,
    marginTop: 12,
    marginBottom: 8,
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 20,
  },
  categoryPill: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Sort & Filter Row
  sortFilterRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
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

  // Progress Bar
  progressBarContainer: {
    height: 6,
    width: '100%',
    position: 'relative',
    marginTop: 12,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Task List
  listContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
