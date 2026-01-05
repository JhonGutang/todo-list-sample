import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Task, Category } from '@todolist/shared-types';
import { Ionicons } from '@expo/vector-icons';
import DateInput from '../DateInput';
import CategorySelector from '../CategorySelector';
import PrioritySelector from '../PrioritySelector';
import { getAllCategories, createCategory } from '../../services';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (task: Task, subtasks: string[]) => void;
};

export default function TaskModal({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categoryId, setCategoryId] = useState<string>('cat_personal');
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const [isMounted, setIsMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;
  const dateInputRef = useRef<any>(null);

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
      setIsMounted(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
      });
    }
  }, [visible, anim, loadCategories]);

  const reset = () => {
    setName('');
    setDescription('');
    setEndDate('');
    setPriority('medium');
    setCategoryId('cat_personal');
    setSubtasks([]);
    setShowSubtasks(false);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const task: Task = {
      id: String(Date.now()),
      name: name.trim(),
      description: description.trim() || null,
      priority,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      category_id: categoryId,
      createdAt: now,
      updatedAt: now,
      completed: false,
    };

    // Filter out empty subtasks
    const validSubtasks = subtasks.filter((s) => s.trim().length > 0);

    onCreate(task, validSubtasks);
    reset();
    onClose();
  };

  const handleCategoryCreated = async (category: Category) => {
    try {
      const created = await createCategory(category);
      await loadCategories();
      setCategoryId(created.id);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
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
      // Hide subtasks section
      setShowSubtasks(false);
      setSubtasks([]);
    } else {
      // Show subtasks section with 1 default subtask
      setShowSubtasks(true);
      setSubtasks(['']);
    }
  };

  const removeSubtask = (index: number) => {
    const updated = subtasks.filter((_, i) => i !== index);
    // If no subtasks left, hide the section
    if (updated.length === 0) {
      setShowSubtasks(false);
      setSubtasks([]);
    } else {
      setSubtasks(updated);
    }
  };

  if (!isMounted) return null;

  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const visibleSubtasks = subtasks.slice(0, 3);
  const hiddenSubtasks = subtasks.slice(3);

  return (
    <Modal visible={isMounted} transparent animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.absoluteFill}
      >
        <View style={styles.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <View style={styles.content}>
              <Text style={styles.title}>Create Task</Text>

              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.inputTitle}
                placeholder="Task title"
                autoFocus
                placeholderTextColor="#999"
              />

              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.inputDescription}
                placeholder="Description (optional)"
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />

              {showSubtasks && (
                <View style={styles.subtasksSection}>
                  <View style={styles.subtasksHeader}>
                    <Text style={styles.sectionLabel}>Subtasks</Text>
                    <TouchableOpacity onPress={addSubtask}>
                      <Text style={styles.addSubtaskText}>+ Add subtask</Text>
                    </TouchableOpacity>
                  </View>
                  {subtasks.map((subtask, index) => (
                    <View key={index} style={styles.subtaskRow}>
                      <TouchableOpacity onPress={() => removeSubtask(index)}>
                        <View style={styles.radioButton} />
                      </TouchableOpacity>
                      <TextInput
                        value={subtask}
                        onChangeText={(val) => updateSubtask(index, val)}
                        style={styles.subtaskText}
                        placeholder={`Subtask ${index + 1}`}
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity onPress={() => removeSubtask(index)} style={styles.removeButtonContainer}>
                        <Text style={styles.removeButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Toolbar with chips */}
              <View style={styles.toolbar}>
                <TouchableOpacity
                  style={[styles.toolbarChip, { backgroundColor: selectedCategory?.color || '#8B5CF6' }]}
                  onPress={() => setShowCategorySelector(true)}
                >
                  <Ionicons name="briefcase" size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toolbarChip,
                    subtasks.some((s) => s.trim().length > 0)
                      ? styles.toolbarChipHighlighted
                      : styles.toolbarChipSecondary,
                  ]}
                  onPress={toggleSubtasksSection}
                >
                  <Ionicons
                    name="list"
                    size={16}
                    color={subtasks.some((s) => s.trim().length > 0) ? '#fff' : '#666'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toolbarChip, { backgroundColor: getPriorityColor(priority) }]}
                  onPress={() => setShowPrioritySelector(true)}
                >
                  <Ionicons name="flag" size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toolbarChip, styles.toolbarChipDate]}
                  onPress={() => dateInputRef.current?.openPicker()}
                >
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancel]}
                  onPress={() => {
                    reset();
                    onClose();
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.create]}
                  onPress={handleCreate}
                  disabled={!name.trim()}
                >
                  <Text style={styles.createText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Hidden DateInput for deadline */}
            <View style={{ height: 0, overflow: 'hidden' }}>
              <DateInput ref={dateInputRef} value={endDate} onChange={(iso) => setEndDate(iso ?? '')} />
            </View>
          </Animated.View>
        </View>

        <CategorySelector
          categories={categories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
          onCategoryCreated={handleCategoryCreated}
          visible={showCategorySelector}
          onClose={() => setShowCategorySelector(false)}
        />

        <PrioritySelector
          selectedPriority={priority}
          onSelect={setPriority}
          visible={showPrioritySelector}
          onClose={() => setShowPrioritySelector(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'low':
      return '#2ecc71';
    case 'medium':
      return '#f39c12';
    case 'high':
      return '#e74c3c';
  }
}

const styles = StyleSheet.create({
  absoluteFill: { ...StyleSheet.absoluteFillObject },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  content: {
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
  },
  inputTitle: {
    fontSize: 15,
    fontWeight: '400',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#000',
    borderWidth: 0,
  },
  inputDescription: {
    fontSize: 15,
    fontWeight: '400',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    color: '#000',
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
  toolbarChipSecondary: {
    backgroundColor: '#E8E8E8',
  },
  toolbarChipHighlighted: {
    backgroundColor: '#007bff',
  },
  toolbarChipDate: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toolbarChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  toolbarChipTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toolbarChipTextDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
  cancel: {
    backgroundColor: '#4A90E2',
  },
  create: {
    backgroundColor: '#9CA3AF',
  },
  cancelText: {
    color: '#fff',
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
    color: '#000',
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
    borderColor: '#666',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  subtaskText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  removeButtonContainer: {
    padding: 4,
  },
  removeButton: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: '600',
  },
  addSubtaskText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
});
