import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Task, Category, ReminderPreset } from '@todolist/shared-types';
import { Ionicons } from '@expo/vector-icons';
import DateInput from '../toolbars/DateInput';
import TimeInput from '../toolbars/TimeInput';
import CategorySelector from '../toolbars/CategorySelector';
import PrioritySelector from '../toolbars/PrioritySelector';
import ReminderSelector from '../toolbars/ReminderSelector';
import { getAllCategories } from '../../services';
import ModalBase from '../ModalBase';
import { useTheme } from '../../contexts/ThemeContext';
import { getPriorityColor } from '../../utils/theme';
import { isValidTaskName } from '../../utils/validation/task';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (task: Task, subtasks: string[]) => void;
};

export default function TaskModal({ visible, onClose, onCreate }: Props) {
  const { theme, isDark } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categoryId, setCategoryId] = useState<string>('cat_personal');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [reminderPreset, setReminderPreset] = useState<ReminderPreset | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showReminderSelector, setShowReminderSelector] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const dateInputRef = React.useRef<any>(null);
  const timeInputRef = React.useRef<any>(null);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible, loadCategories]);

  const reset = () => {
    setName('');
    setDescription('');
    setEndDate('');
    setStartTime('');
    setReminderPreset(null);
    setPriority('medium');
    setCategoryId('cat_personal');
    setSubtasks([]);
    setShowSubtasks(false);
  };

  const handleCreate = () => {
    if (!isValidTaskName(name)) return;
    const now = new Date().toISOString();
    const task: Task = {
      id: String(Date.now()),
      name: name.trim(),
      description: description.trim() || null,
      priority,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      reminderPreset: reminderPreset,
      category_id: categoryId,
      createdAt: now,
      updatedAt: now,
      completed: false,
    };

    const validSubtasks = subtasks.filter((s) => s.trim().length > 0);

    onCreate(task, validSubtasks);
    reset();
    onClose();
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const updateSubtask = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const toggleSubtasksSection = () => {
    if (showSubtasks) {
      setShowSubtasks(false);
      setSubtasks([]);
    } else {
      setShowSubtasks(true);
      setSubtasks(['']);
    }
  };

  const removeSubtask = (index: number) => {
    const updated = subtasks.filter((_, i) => i !== index);
    if (updated.length === 0) {
      setShowSubtasks(false);
      setSubtasks([]);
    } else {
      setSubtasks(updated);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const inputBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F5F5F5';
  const secondaryChipBg = isDark ? 'rgba(255, 255, 255, 0.1)' : '#F5F5F5';
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6';
  const createDisabledBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#E5E7EB';

  return (
    <ModalBase visible={visible} onClose={onClose} useKeyboardAvoidingView maxHeight="90%">
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Create Task</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.inputTitle, { backgroundColor: inputBg, color: theme.textPrimary }]}
          placeholder="Task title"
          autoFocus={Platform.OS !== 'web'}
          placeholderTextColor={theme.textTertiary}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.inputDescription, { backgroundColor: inputBg, color: theme.textPrimary }]}
          placeholder="Description (optional)"
          multiline
          numberOfLines={4}
          placeholderTextColor={theme.textTertiary}
        />

        {showSubtasks && (
          <View style={styles.subtasksSection}>
            <View style={styles.subtasksHeader}>
              <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Subtasks</Text>
              <TouchableOpacity onPress={addSubtask}>
                <Text style={[styles.addSubtaskText, { color: theme.primary }]}>+ Add subtask</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.subtasksList}
              contentContainerStyle={styles.subtasksListContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {subtasks.map((subtask, index) => (
                <View key={index} style={styles.subtaskRow}>
                  <TouchableOpacity onPress={() => removeSubtask(index)}>
                    <View style={[styles.radioButton, { borderColor: theme.textSecondary }]} />
                  </TouchableOpacity>
                  <TextInput
                    value={subtask}
                    onChangeText={(val) => updateSubtask(index, val)}
                    style={[styles.subtaskText, { color: theme.textPrimary }]}
                    placeholder={`Subtask ${index + 1}`}
                    placeholderTextColor={theme.textTertiary}
                  />
                  <TouchableOpacity onPress={() => removeSubtask(index)} style={styles.removeButtonContainer}>
                    <Text style={[styles.removeButton, { color: theme.priorityHigh }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Toolbar with chips */}
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolbarChip, { backgroundColor: selectedCategory?.color || theme.primary }]}
            onPress={() => setShowCategorySelector(true)}
          >
            <Ionicons name="briefcase" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarChip,
              subtasks.some((s) => s.trim().length > 0)
                ? { backgroundColor: theme.primary }
                : { backgroundColor: secondaryChipBg },
            ]}
            onPress={toggleSubtasksSection}
          >
            <Ionicons
              name="list"
              size={16}
              color={subtasks.some((s) => s.trim().length > 0) ? '#fff' : theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarChip, { backgroundColor: getPriorityColor(priority, theme) }]}
            onPress={() => setShowPrioritySelector(true)}
          >
            <Ionicons name="flag" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarChip,
              { backgroundColor: inputBg, borderWidth: 1, borderColor: theme.border }
            ]}
            onPress={() => dateInputRef.current?.openPicker()}
          >
            <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarChip,
              startTime
                ? { backgroundColor: theme.primary }
                : { backgroundColor: inputBg, borderWidth: 1, borderColor: theme.border },
            ]}
            onPress={() => timeInputRef.current?.openPicker()}
          >
            <Ionicons name="time-outline" size={16} color={startTime ? '#fff' : theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarChip,
              reminderPreset
                ? { backgroundColor: theme.primary }
                : { backgroundColor: secondaryChipBg },
            ]}
            onPress={() => setShowReminderSelector(true)}
          >
            <Ionicons
              name="notifications-outline"
              size={16}
              color={reminderPreset ? '#fff' : theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: buttonBg }]}
            onPress={() => {
              reset();
              onClose();
            }}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isValidTaskName(name)
                ? { backgroundColor: theme.primary }
                : { backgroundColor: createDisabledBg }
            ]}
            onPress={handleCreate}
            disabled={!isValidTaskName(name)}
          >
            <Text style={styles.createText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hidden DateInput for deadline */}
      <View style={{ height: 0, overflow: 'hidden' }}>
        <DateInput ref={dateInputRef} value={endDate} onChange={(iso: string | undefined) => setEndDate(iso ?? '')} />
      </View>

      <CategorySelector
        categories={categories}
        selectedCategoryId={categoryId}
        onSelect={setCategoryId}
        visible={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
      />

      <PrioritySelector
        selectedPriority={priority}
        onSelect={setPriority}
        visible={showPrioritySelector}
        onClose={() => setShowPrioritySelector(false)}
      />

      <ReminderSelector
        visible={showReminderSelector}
        onClose={() => setShowReminderSelector(false)}
        selectedPreset={reminderPreset}
        onSelect={setReminderPreset}
      />

      {/* Hidden TimeInput for start time */}
      <View style={{ height: 0, overflow: 'hidden' }}>
        <TimeInput ref={timeInputRef} value={startTime} onChange={(iso: string | undefined) => setStartTime(iso ?? '')} />
      </View>
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 32,
    paddingBottom: 16, // SafeAreaView in ModalBase adds the rest
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  inputTitle: {
    fontSize: 15,
    fontWeight: '400',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 0,
  },
  inputDescription: {
    fontSize: 15,
    fontWeight: '400',
    minHeight: 100,
    textAlignVertical: 'top',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  toolbarChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 16,
  },
  createText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  subtasksSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtasksList: {
    maxHeight: 135,
  },
  subtasksListContent: {
    paddingRight: 4,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  subtaskText: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  removeButtonContainer: {
    padding: 4,
  },
  removeButton: {
    fontSize: 18,
    fontWeight: '600',
  },
  addSubtaskText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
