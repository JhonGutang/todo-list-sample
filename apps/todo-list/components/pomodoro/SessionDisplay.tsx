import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: theme.cardBorderWidth }]}>
                {/* Header Row: Timer Type Badge + Progress Counter + Cancel Icon */}
                <View style={styles.headerRow}>
                    <View style={[styles.badge, { backgroundColor: progressColor }]}>
                        <Text style={[styles.badgeText, { color: themeType === 'cinnamoroll' ? theme.textPrimary : theme.white }]}>{timerTypeLabel}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={[styles.progressCounter, { backgroundColor: theme.background }]}>
                            <Text style={[styles.progressCounterText, { color: theme.textPrimary }]}>{current_iteration}/{total_iterations}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: themeType === 'cinnamoroll' ? 'rgba(255, 107, 107, 0.1)' : '#fef2f2' }]}
                            onPress={onCancel}
                        >
                            <FontAwesome name="times" size={18} color={theme.priorityHigh} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Task Name */}
                <Text style={[styles.taskName, { color: theme.textPrimary }]}>{task.name}</Text>

                {/* Current Subtask */}
                {currentSubtask && isWork && (
                    <View style={[styles.subtaskRow, { backgroundColor: theme.background }]}>
                        <FontAwesome name="arrow-right" size={12} color={theme.primary} />
                        <Text style={[styles.subtaskText, { color: theme.textPrimary }]} numberOfLines={1}>{currentSubtask.title}</Text>
                    </View>
                )}

                {/* Subtask Progress (if applicable) */}
                {subtasks.length > 0 && (
                    <Text style={[styles.subtaskProgress, { color: theme.textSecondary }]}>
                        Subtasks: {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                    </Text>
                )}

                {/* Progress Bar as Bottom Border */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
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
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    progressCounterText: {
        fontSize: 14,
        fontWeight: '700',
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
        marginBottom: 8,
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    subtaskText: {
        fontSize: 14,
        flex: 1,
    },
    subtaskProgress: {
        fontSize: 12,
        marginBottom: 16,
    },

    // Progress Bar
    progressBarContainer: {
        marginHorizontal: -16,
    },
    progressBarBg: {
        height: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 0,
    },
});
