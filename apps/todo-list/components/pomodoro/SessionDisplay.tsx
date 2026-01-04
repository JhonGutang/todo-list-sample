import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PomodoroSessionWithTask } from '@todolist/shared-types';

interface SessionDisplayProps {
    session: PomodoroSessionWithTask;
    onCancel: () => void;
}

export default function SessionDisplay({ session, onCancel }: SessionDisplayProps) {
    const { task, subtasks, current_iteration, total_iterations, current_subtask_index, timer_type } = session;

    // Get current subtask if applicable
    const currentSubtask =
        current_subtask_index !== null && current_subtask_index < subtasks.length
            ? subtasks[current_subtask_index]
            : null;

    // Determine timer type label and color
    const isWork = timer_type === 'work';
    const timerTypeLabel = isWork ? 'Work Session' : timer_type === 'shortBreak' ? 'Short Break' : 'Long Break';
    const progressColor = isWork ? '#6366f1' : '#10b981';

    // Calculate progress percentage
    const progressPercent = ((current_iteration - 1) / total_iterations) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header Row: Timer Type Badge + Progress Counter + Cancel Icon */}
                <View style={styles.headerRow}>
                    <View style={[styles.badge, { backgroundColor: progressColor }]}>
                        <Text style={styles.badgeText}>{timerTypeLabel}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.progressCounter}>
                            <Text style={styles.progressCounterText}>{current_iteration}/{total_iterations}</Text>
                        </View>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <FontAwesome name="times" size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Task Name */}
                <Text style={styles.taskName}>{task.name}</Text>

                {/* Current Subtask */}
                {currentSubtask && isWork && (
                    <View style={styles.subtaskRow}>
                        <FontAwesome name="arrow-right" size={12} color="#6366f1" />
                        <Text style={styles.subtaskText} numberOfLines={1}>{currentSubtask.title}</Text>
                    </View>
                )}

                {/* Subtask Progress (if applicable) */}
                {subtasks.length > 0 && (
                    <Text style={styles.subtaskProgress}>
                        Subtasks: {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                    </Text>
                )}

                {/* Progress Bar as Bottom Border */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${progressPercent}%`, backgroundColor: progressColor },
                            ]}
                        />
                    </View>
                </View>
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
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    badge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressCounter: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    progressCounterText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    cancelButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Task Info
    taskName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    subtaskText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    subtaskProgress: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 16,
    },

    // Progress Bar
    progressBarContainer: {
        marginHorizontal: -16,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#e5e7eb',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 0,
    },
});
