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
import { initDb, getAllCategories, createTask, getAllTasks, getSubtasksForTask, setTaskCompletion, addSubtask } from '../../services';
import { useTheme } from '../../contexts/ThemeContext';
import TaskCard from '../../components/tasks/TaskCard';

export default function TasksPage() {
  const router = useRouter();
  const { theme, themeType } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksWithSubtasks, setTasksWithSubtasks] = useState<TaskWithSubtasks[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deadlineSort, setDeadlineSort] = useState<string>('none');
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
      setFocusCount(prev => prev + 1);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.priorityHigh;
      case 'medium': return theme.priorityMedium;
      case 'low': return theme.priorityLow;
      default: return 'transparent';
    }
  };

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
        priorityColor={getPriorityColor(item.priority || '')}
      />
    );
  };

  const CATEGORY_ORDER = ['cat_personal', 'cat_work', 'cat_projects', 'cat_habit', 'cat_others'];

  const filterChips = [
    { id: 'all', label: 'All' },
    ...categories
      .filter((cat) => cat.id !== 'cat_completed')
      .sort((a, b) => {
        const idxA = CATEGORY_ORDER.indexOf(a.id);
        const idxB = CATEGORY_ORDER.indexOf(b.id);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      })
      .map((cat) => ({ id: cat.id, label: cat.name })),
    ...categories
      .filter((cat) => cat.id === 'cat_completed')
      .map((cat) => ({ id: cat.id, label: cat.name })),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingHorizontal: horizontalPadding,
          backgroundColor: themeType === 'cinnamoroll' ? theme.headerBg : 'transparent',
          paddingVertical: themeType === 'cinnamoroll' ? 16 : 0,
          paddingTop: themeType === 'cinnamoroll' ? 20 : 16,
        }
      ]}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: themeType === 'cinnamoroll' ? theme.white : theme.primary }]}>
              {themeType === 'cinnamoroll' ? (
                <Text style={{ fontSize: 20 }}>☁️</Text>
              ) : (
                <Text style={[styles.logoText, { color: theme.white }]}>M</Text>
              )}
            </View>
            <Text style={[styles.headerTitle, { color: themeType === 'cinnamoroll' ? theme.white : theme.textPrimary }]}>Tasks</Text>
          </View>
          <Pressable
            style={[
              styles.addButton,
              {
                backgroundColor: theme.cardBg,
                borderColor: themeType === 'cinnamoroll' ? 'transparent' : theme.border,
                borderWidth: themeType === 'cinnamoroll' ? 0 : 1,
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: themeType === 'cinnamoroll' ? 1 : 0,
                shadowRadius: 4,
                elevation: themeType === 'cinnamoroll' ? 4 : 0,
              }
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={theme.primary} />
          </Pressable>
        </View>
        <Text style={[styles.headerSubtitle, { color: themeType === 'cinnamoroll' ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
          {completedCount} of {totalCount} completed
        </Text>

        {/* Progress Bar for Cinnamoroll */}
        {themeType === 'cinnamoroll' && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarTrack, { backgroundColor: theme.progressBarTrack }]} />
            <View style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.progressBarFill,
                width: `${progress * 100}%`
              }
            ]} />
          </View>
        )}
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
                  borderColor: themeType === 'cinnamoroll' ? theme.border : theme.border,
                  borderWidth: themeType === 'cinnamoroll' ? 1.5 : 1,
                  borderRadius: themeType === 'cinnamoroll' ? 50 : 24,
                },
                active && {
                  backgroundColor: themeType === 'cinnamoroll' ? theme.white : theme.primary,
                  borderColor: themeType === 'cinnamoroll' ? theme.border : 'transparent',
                  borderWidth: themeType === 'cinnamoroll' ? 1.5 : 0
                }
              ]}
              onPress={() => setFilter(chip.id)}
            >
              <Text style={[
                styles.categoryPillText,
                { color: theme.textSecondary },
                active && { color: themeType === 'cinnamoroll' ? '#000000' : theme.white }
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
              borderRadius: themeType === 'cinnamoroll' ? 50 : 12,
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
        {themeType === 'cinnamoroll' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Text style={{ position: 'absolute', top: 50, right: 30, fontSize: 40, opacity: 0.2 }}>☁️</Text>
            <Text style={{ position: 'absolute', top: 200, left: -20, fontSize: 60, opacity: 0.1 }}>☁️</Text>
            <Text style={{ position: 'absolute', bottom: 100, right: -10, fontSize: 50, opacity: 0.1 }}>☁️</Text>
            <Text style={{ position: 'absolute', top: 120, left: 150, fontSize: 20, opacity: 0.3 }}>✨</Text>
            <Text style={{ position: 'absolute', bottom: 250, left: 40, fontSize: 15, opacity: 0.3 }}>✨</Text>
          </View>
        )}
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
