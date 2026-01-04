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
  const [subtasks, setSubtasks] = useState<string[]>(['']);

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
    setSubtasks(['']);
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

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
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
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
                style={[styles.inputDescription]}
                placeholder="Description (optional)"
                multiline
                placeholderTextColor="#999"
              />

              {showSubtasks && (
                <View style={styles.subtasksSection}>
                  <Text style={styles.sectionLabel}>Subtasks</Text>
                  <ScrollView style={styles.subtasksScroll} nestedScrollEnabled>
                    {subtasks.map((subtask, index) => (
                      <View key={index} style={styles.subtaskRow}>
                        <View style={styles.radioButton} />
                        <TextInput
                          value={subtask}
                          onChangeText={(val) => updateSubtask(index, val)}
                          style={styles.subtaskInput}
                          placeholder={`Subtask ${index + 1}`}
                          placeholderTextColor="#999"
                        />
                        {subtasks.length > 1 && (
                          <TouchableOpacity onPress={() => removeSubtask(index)}>
                            <Text style={styles.removeButton}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={addSubtask} style={styles.addSubtaskButton}>
                    <Text style={styles.addSubtaskText}>+ Add subtask</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Sticky Bottom Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={[styles.toolbarChip, { backgroundColor: selectedCategory?.color || '#e0e0e0' }]}
                onPress={() => setShowCategorySelector(true)}
              >
                <Text style={styles.toolbarChipText}>{selectedCategory?.name || 'Category'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarChip, { backgroundColor: showSubtasks ? '#007bff' : '#e0e0e0' }]}
                onPress={() => setShowSubtasks(!showSubtasks)}
              >
                <Text style={[styles.toolbarChipText, showSubtasks && styles.toolbarChipTextActive]}>
                  Subtasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarChip, { backgroundColor: getPriorityColor(priority) }]}
                onPress={() => setShowPrioritySelector(true)}
              >
                <Text style={styles.toolbarChipText}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarChip, { backgroundColor: endDate ? '#007bff' : '#e0e0e0' }]}
                onPress={() => dateInputRef.current?.openPicker()}
              >
                <Text style={[styles.toolbarChipText, endDate && styles.toolbarChipTextActive]}>
                  {endDate ? 'Set' : 'Deadline'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hidden DateInput for deadline */}
            <View style={{ height: 0, overflow: 'hidden' }}>
              <DateInput ref={dateInputRef} value={endDate} onChange={(iso) => setEndDate(iso ?? '')} />
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
              <TouchableOpacity style={[styles.actionButton, styles.create]} onPress={handleCreate}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  content: { padding: 20, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#111' },
  inputTitle: {
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
    paddingVertical: 8,
    marginBottom: 12,
    color: '#111',
  },
  inputDescription: {
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#111',
  },
  subtasksSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  subtasksScroll: {
    maxHeight: 200,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 8,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#111',
  },
  removeButton: {
    marginLeft: 8,
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  hiddenSubtasksText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 26,
  },
  addSubtaskButton: {
    marginTop: 8,
    marginLeft: 26,
  },
  addSubtaskText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 8,
  },
  toolbarChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  toolbarChipTextActive: {
    color: '#fff',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  actionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ddd' },
  create: { backgroundColor: '#007bff' },
  cancelText: { color: '#333', fontWeight: '600' },
  createText: { color: '#fff', fontWeight: '700' },
});
