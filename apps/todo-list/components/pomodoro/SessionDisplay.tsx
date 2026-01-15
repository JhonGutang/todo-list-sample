import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PomodoroSessionWithTask } from '@todolist/shared-types';
import { useTheme } from '@/contexts/ThemeContext';

interface SessionDisplayProps {
    session: PomodoroSessionWithTask;
    onCancel: () => void;
}

export default function SessionDisplay({ session, onCancel }: SessionDisplayProps) {
    const { task, subtasks, current_iteration, total_iterations, current_subtask_index, timer_type } = session;
    const { theme, themeType } = useTheme();

    // Get current subtask if applicable
    const currentSubtask =
        current_subtask_index !== null && current_subtask_index < subtasks.length
            ? subtasks[current_subtask_index]
            : null;

    // Determine timer type label and color
    const isWork = timer_type === 'work';
    const timerTypeLabel = isWork ? 'Work Session' : timer_type === 'shortBreak' ? 'Short Break' : 'Long Break';
    const progressColor = isWork ? theme.primary : theme.success;

    // Calculate progress percentage
    const progressPercent = ((current_iteration - 1) / total_iterations) * 100;

    return (
        <View style={styles.container}>
            <View style={[
                styles.card,
                {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    borderWidth: theme.cardBorderWidth,
                    shadowColor: theme.shadowColor
                }
            ]}>
                {/* Header Row: Task Title + Subtask Count + Cancel Icon */}
                <View style={styles.headerRow}>
                    <Text style={[styles.taskName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {task.name}
                    </Text>
                    <View style={styles.headerRight}>
                        {subtasks.length > 0 && (
                            <View style={[styles.subtaskCounter, { backgroundColor: theme.background }]}>
                                <FontAwesome name="check-square-o" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                                <Text style={[styles.subtaskCounterText, { color: theme.textSecondary }]}>
                                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: theme.priorityHigh + '15' }]}
                            onPress={onCancel}
                        >
                            <FontAwesome name="times" size={18} color={theme.priorityHigh} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Subtasks Section */}
                {subtasks.length > 0 && (
                    <>
                        <Text style={[styles.subtasksHeader, { color: theme.textSecondary }]}>Subtasks</Text>
                        <ScrollView 
                            style={styles.subtasksScrollView}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.subtasksScrollContent}
                        >
                            {subtasks.map((subtask, index) => {
                                const isActive = current_subtask_index === index;
                                const isCompleted = subtask.completed;

                                return (
                                    <View
                                        key={subtask.id}
                                        style={[
                                            styles.subtaskItem,
                                            {
                                                backgroundColor: isActive ? theme.primary + '15' : 'transparent',
                                                borderColor: isActive ? theme.primary : theme.border,
                                                borderWidth: 1,
                                            }
                                        ]}
                                    >
                                        <View style={styles.subtaskContent}>
                                            <FontAwesome
                                                name={isCompleted ? "check-circle" : "circle-o"}
                                                size={16}
                                                color={isCompleted ? theme.success : theme.textTertiary}
                                                style={styles.subtaskIcon}
                                            />
                                            <Text
                                                style={[
                                                    styles.subtaskText,
                                                    {
                                                        color: isCompleted ? theme.textTertiary : theme.textPrimary,
                                                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                                                    }
                                                ]}
                                                numberOfLines={2}
                                            >
                                                {subtask.title}
                                            </Text>
                                        </View>
                                        {isActive && (
                                            <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                                <Text style={[styles.activeBadgeText, { color: theme.white }]}>Active</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 20,
    },
    card: {
        borderRadius: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 10,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    progressCounter: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    progressCounterText: {
        fontSize: 14,
        fontWeight: '700',
    },
    subtaskCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    subtaskCounterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cancelButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Task Info
    taskName: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },

    // Subtasks Section
    subtasksHeader: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    subtasksScrollView: {
        maxHeight: 200,
        flexGrow: 0,
    },
    subtasksScrollContent: {
        gap: 8,
    },
    subtaskItem: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    subtaskContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    subtaskIcon: {
        marginRight: 10,
    },
    subtaskText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    activeBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginLeft: 8,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
