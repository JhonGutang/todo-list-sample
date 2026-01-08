import React, { useState, useEffect, useRef } from 'react';

import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Task, Subtask, Category, Priority } from '@todolist/shared-types';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import useDateFormatter from '../../hooks/useDateFormatter';
import Chip from '../../components/Chip';
import CategorySelector from '../../components/toolbars/CategorySelector';
import PrioritySelector from '../../components/toolbars/PrioritySelector';
import TimeInput, { TimeInputRef } from '../../components/toolbars/TimeInput';
import { getTaskById, updateTask, deleteTask } from '../../services/tasks';
import { getSubtasksForTask, addSubtask, updateSubtask, toggleSubtask, deleteSubtask } from '../../services/subtasks';
import { initDb, getAllCategories } from '../../services';
import { useTheme } from '../../contexts/ThemeContext';
import { useTasks } from '../../contexts/TasksContext';
import PersonalNotesSection from '../../components/tasks/PersonalNotesSection';


export default function TaskDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id } = params as { id?: string };
  const { theme } = useTheme();
  const { formatEndDate } = useDateFormatter();
  const { updateTaskSubtasks } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingTaskName, setIsEditingTaskName] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const timeInputRef = useRef<TimeInputRef>(null);
  const newSubtaskInputRef = useRef<TextInput>(null);
  const taskNameInputRef = useRef<TextInput>(null);

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
        // Update context with latest subtasks
        updateTaskSubtasks(id, loadedSubtasks);
      }
      // Load categories for display
      const loadedCategories = await getAllCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!id || !task) return;
    try {
      await deleteTask(id);
      router.back();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskNameEdit = () => {
    if (!task) return;
    setEditedTaskName(task.name);
    setIsEditingTaskName(true);
    // Focus the input after state update
    setTimeout(() => taskNameInputRef.current?.focus(), 100);
  };

  const handleTaskNameSave = async () => {
    if (!id || !task || !editedTaskName.trim()) {
      setIsEditingTaskName(false);
      return;
    }

    const newName = editedTaskName.trim();
    if (newName === task.name) {
      setIsEditingTaskName(false);
      return;
    }

    // Optimistic update
    const previousName = task.name;
    setTask({ ...task, name: newName });
    setIsEditingTaskName(false);

    // Update database in background
    try {
      await updateTask(id, { name: newName });
    } catch (error) {
      console.error('Failed to update task name:', error);
      // Revert on error
      setTask({ ...task, name: previousName });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!id) return;
    try {
      // Optimistic update - update local state and context
      const updatedSubtasks = subtasks.filter((st) => st.id !== subtaskId);
      setSubtasks(updatedSubtasks);
      updateTaskSubtasks(id, updatedSubtasks);
      // Delete from database
      await deleteSubtask(subtaskId);
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      // Reload on error
      await loadTask();
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    if (!id || !task) return;
    try {
      await updateTask(id, { category_id: categoryId });
      setTask({ ...task, category_id: categoryId });
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handlePrioritySelect = async (priority: Priority) => {
    if (!id || !task) return;
    try {
      await updateTask(id, { priority });
      setTask({ ...task, priority });
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleDateSelect = async (date: Date) => {
    if (!id || !task) return;
    setShowDatePicker(false);
    try {
      // Format as YYYY-MM-DD for date-only storage
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      await updateTask(id, { endDate: isoDate });
      setTask({ ...task, endDate: isoDate });
    } catch (error) {
      console.error('Failed to update deadline:', error);
    }
  };

  const getDateForPicker = (): Date => {
    if (!task?.endDate) return new Date();
    // Handle both YYYY-MM-DD and full ISO string formats
    const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(task.endDate);
    if (ymdMatch) {
      const [y, m, d] = task.endDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const date = new Date(task.endDate);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const handleTimeSelect = async (iso?: string) => {
    if (!id || !task) return;
    try {
      await updateTask(id, { startTime: iso || null });
      setTask({ ...task, startTime: iso || null });
    } catch (error) {
      console.error('Failed to update start time:', error);
    }
  };

  const handleClearDate = async () => {
    if (!id || !task) return;
    try {
      await updateTask(id, { endDate: null });
      setTask({ ...task, endDate: null });
    } catch (error) {
      console.error('Failed to clear deadline:', error);
    }
  };

  const handleClearTime = async () => {
    if (!id || !task) return;
    try {
      await updateTask(id, { startTime: null });
      setTask({ ...task, startTime: null });
    } catch (error) {
      console.error('Failed to clear start time:', error);
    }
  };

  const handleAddSubtask = async () => {
    if (!id || !newSubtaskTitle.trim()) return;

    const title = newSubtaskTitle.trim();

    // Optimistic update for adding
    const tempId = 'temp_' + Date.now();
    const newSubtask: Subtask = {
      id: tempId,
      task_id: id,
      title,
      completed: false,
      order: subtasks.length,
    };

    const updatedSubtasks = [...subtasks, newSubtask];
    setSubtasks(updatedSubtasks);
    updateTaskSubtasks(id, updatedSubtasks);

    // Reset input state
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);

    // Add to database in background
    try {
      const created = await addSubtask(id, { title });
      // Replace temp subtask with real one
      const finalSubtasks = updatedSubtasks.map((st) => (st.id === tempId ? created : st));
      setSubtasks(finalSubtasks);
      updateTaskSubtasks(id, finalSubtasks);
    } catch (error) {
      console.error('Failed to add subtask:', error);
      // Remove temp subtask on error
      const revertedSubtasks = subtasks.filter((st) => st.id !== tempId);
      setSubtasks(revertedSubtasks);
      updateTaskSubtasks(id, revertedSubtasks);
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === 'high') return theme.priorityHigh;
    if (priority === 'medium') return theme.priorityMedium;
    if (priority === 'low') return theme.priorityLow;
    return theme.textSecondary;
  };

  const getCategory = () => {
    if (!task?.category_id) return null;
    return categories.find((c) => c.id === task.category_id) || null;
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = subtasks.length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back to Tasks</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={{ color: theme.textPrimary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back to Tasks</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={{ color: theme.textPrimary }}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = getCategory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={["bottom"]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 }}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>Back to Tasks</Text>
        </Pressable>
        <Pressable onPress={handleDeleteTask} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={24} color={theme.priorityHigh} />
        </Pressable>
      </View>


      <ScrollView contentContainerStyle={styles.content}>
        {/* Task Title with Checkbox */}
        <View style={styles.titleSection}>
          <Pressable
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? theme.primary : theme.border,
                backgroundColor: task.completed ? theme.primary : 'transparent',
              }
            ]}
            onPress={async () => {
              if (!id || !task) return;
              try {
                await updateTask(id, { completed: !task.completed });
                setTask({ ...task, completed: !task.completed });
              } catch (error) {
                console.error('Failed to toggle task completion:', error);
              }
            }}
          >
            {task.completed && <Ionicons name="checkmark" size={16} color={theme.white} />}
          </Pressable>
          {isEditingTaskName ? (
            <TextInput
              ref={taskNameInputRef}
              value={editedTaskName}
              onChangeText={setEditedTaskName}
              style={[styles.titleInput, { color: theme.textPrimary }]}
              onSubmitEditing={handleTaskNameSave}
              onBlur={handleTaskNameSave}
              returnKeyType="done"
              autoFocus
            />
          ) : (
            <Pressable onPress={handleTaskNameEdit} style={styles.titlePressable}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{task.name}</Text>
            </Pressable>
          )}
        </View>

        {/* Description */}
        {task.description ? (
          <Text style={[styles.desc, { color: theme.textSecondary }]}>{task.description}</Text>
        ) : null}

        {/* Detail Cards Grid (2x2) */}
        <View style={styles.detailGrid}>
          {/* Priority Card */}
          <Pressable
            style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => setShowPrioritySelector(true)}
          >
            <Ionicons name="flag" size={20} color={getPriorityColor(task.priority)} />
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Priority</Text>
            <View style={styles.detailValueRow}>
              <Text style={[styles.detailValue, { color: getPriorityColor(task.priority) }]}>
                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </View>
          </Pressable>

          {/* Category Card */}
          <Pressable
            style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => setShowCategorySelector(true)}
          >
            <Ionicons name="pricetag" size={20} color={category?.color || theme.textSecondary} />
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Category</Text>
            <View style={styles.detailValueRow}>
              {category ? (
                <Chip label={category.name} color={category.color || theme.textSecondary} variant="label" size="small" />
              ) : (
                <Text style={[styles.detailValue, { color: theme.textSecondary }]}>None</Text>
              )}
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} style={{ marginLeft: 8 }} />
            </View>
          </Pressable>

          {/* Deadline Card */}
          <Pressable
            style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
            onLongPress={task.endDate ? handleClearDate : undefined}
          >
            <Ionicons name="calendar" size={20} color={theme.textSecondary} />
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Deadline</Text>
            <View style={styles.detailValueRow}>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {task.endDate ? formatEndDate(task.endDate) : 'No deadline'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </View>
          </Pressable>

          {/* Time Start Card */}
          <Pressable
            style={[styles.detailCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
            onPress={() => timeInputRef.current?.openPicker()}
            onLongPress={task.startTime ? handleClearTime : undefined}
          >
            <Ionicons name="time" size={20} color={theme.textSecondary} />
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Time Start</Text>
            <View style={styles.detailValueRow}>
              <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                {task.startTime ? formatTime(task.startTime) : 'No time'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Subtasks Section */}
        <View style={[styles.subtasksCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.subtasksHeader}>
            <View style={styles.subtasksHeaderLeft}>
              <Ionicons name="checkbox" size={20} color={theme.textPrimary} />
              <Text style={[styles.subtasksTitle, { color: theme.textPrimary }]}>
                Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setIsAddingSubtask(true);
                setNewSubtaskTitle('');
                // Focus the input after state update
                setTimeout(() => newSubtaskInputRef.current?.focus(), 100);
              }}
              style={[styles.addSubtaskIconButton, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="add" size={20} color={theme.white} />
            </Pressable>
          </View>

          {subtasks.length === 0 && !isAddingSubtask ? (
            <Text style={[styles.noSubtasksText, { color: theme.textSecondary }]}>No subtasks yet</Text>
          ) : (
            <View style={styles.subtasksList}>
              {subtasks.map((s) => (
                <View key={s.id} style={styles.subtaskRow}>
                  <Pressable
                    style={[
                      styles.subtaskCheckbox,
                      { borderColor: s.completed ? theme.primary : theme.border },
                      s.completed && { backgroundColor: theme.primary }
                    ]}
                    onPress={async () => {
                      if (!id) return;
                      // Optimistic update - update UI immediately (both local and context)
                      const updatedSubtasks = subtasks.map((st) =>
                        st.id === s.id ? { ...st, completed: !st.completed } : st
                      );
                      setSubtasks(updatedSubtasks);
                      updateTaskSubtasks(id, updatedSubtasks);

                      // Then update database in background
                      try {
                        await toggleSubtask(s.id);
                      } catch (error) {
                        console.error('Failed to toggle subtask:', error);
                        // Revert on error
                        const revertedSubtasks = subtasks.map((st) =>
                          st.id === s.id ? { ...st, completed: !st.completed } : st
                        );
                        setSubtasks(revertedSubtasks);
                        updateTaskSubtasks(id, revertedSubtasks);
                      }
                    }}
                  >
                    {s.completed && <Ionicons name="checkmark" size={14} color={theme.white} />}
                  </Pressable>
                  <Text style={[
                    styles.subtaskTitle,
                    { color: theme.textPrimary },
                    s.completed && styles.subtaskTitleCompleted
                  ]}>
                    {s.title}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteSubtask(s.id)}
                    style={styles.deleteSubtaskButton}
                  >
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ))}

              {/* Inline Add Subtask Input */}
              {isAddingSubtask && (
                <View style={styles.subtaskRow}>
                  <Pressable
                    style={[styles.subtaskCheckbox, { borderColor: theme.border }]}
                    onPress={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskTitle('');
                    }}
                  >
                    <View style={[styles.radioButton, { borderColor: theme.textSecondary }]} />
                  </Pressable>
                  <TextInput
                    ref={newSubtaskInputRef}
                    value={newSubtaskTitle}
                    onChangeText={setNewSubtaskTitle}
                    style={[styles.subtaskInput, { color: theme.textPrimary }]}
                    placeholder="New subtask"
                    placeholderTextColor={theme.textTertiary}
                    onSubmitEditing={handleAddSubtask}
                    onBlur={() => {
                      if (!newSubtaskTitle.trim()) {
                        setIsAddingSubtask(false);
                      }
                    }}
                    returnKeyType="done"
                  />
                  {newSubtaskTitle.trim() ? (
                    <Pressable
                      onPress={handleAddSubtask}
                      style={styles.deleteSubtaskButton}
                    >
                      <Ionicons name="checkmark" size={18} color={theme.primary} />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => {
                        setIsAddingSubtask(false);
                        setNewSubtaskTitle('');
                      }}
                      style={styles.deleteSubtaskButton}
                    >
                      <Ionicons name="close" size={18} color={theme.textSecondary} />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Personal Notes Section */}
        {id && <PersonalNotesSection taskId={id} />}
      </ScrollView>

      {/* Category Selector Modal */}
      <CategorySelector
        categories={categories}
        selectedCategoryId={task.category_id}
        onSelect={handleCategorySelect}
        visible={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
      />

      {/* Priority Selector Modal */}
      <PrioritySelector
        selectedPriority={(task.priority || 'medium') as Priority}
        onSelect={handlePrioritySelect}
        visible={showPrioritySelector}
        onClose={() => setShowPrioritySelector(false)}
      />

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={getDateForPicker()}
        onConfirm={handleDateSelect}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Time Input (hidden, opened via ref) */}
      {task && (
        <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
          <TimeInput
            ref={timeInputRef}
            value={task.startTime || new Date().toISOString()}
            onChange={handleTimeSelect}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  backText: {
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  titlePressable: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    padding: 0,
    margin: 0,
  },
  desc: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtasksCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  subtasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subtasksHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtasksTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addSubtaskIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSubtasksText: {
    fontSize: 14,
    marginBottom: 12,
  },
  subtasksList: {
    marginBottom: 12,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteSubtaskButton: {
    padding: 4,
  },
  radioButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  subtaskInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  notesInput: {
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
