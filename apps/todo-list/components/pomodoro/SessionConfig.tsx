import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Task } from '@todolist/shared-types';
import { useTheme } from '@/contexts/ThemeContext';

interface SessionConfigProps {
    selectedTask: Task;
    subtaskCount: number;
    duration: number;
    iterations: number;
    breakType: 'short' | 'long';
    onDurationChange: (duration: number) => void;
    onIterationsChange: (iterations: number) => void;
    onBreakTypeChange: (breakType: 'short' | 'long') => void;
    onChangeTask: () => void;
    onStartSession: () => void;
    animationOpacity: Animated.Value;
    animationTranslateY: Animated.Value;
}

const DURATION_OPTIONS = [
    { value: 25, label: '25', sublabel: 'min' },
    { value: 15, label: '15', sublabel: 'min' },
    { value: 5, label: '5', sublabel: 'min' },
];

const ITERATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function SessionConfig({
    selectedTask,
    subtaskCount,
    duration,
    iterations,
    breakType,
    onDurationChange,
    onIterationsChange,
    onBreakTypeChange,
    onChangeTask,
    onStartSession,
    animationOpacity,
    animationTranslateY,
}: SessionConfigProps) {
    const { theme, themeType } = useTheme();

    return (
        <View style={styles.container}>
            {/* Step 1: Selected Task */}
            <View style={styles.stepSection}>
                <Text style={[styles.stepLabel, { color: theme.textSecondary }]}>Task Selected</Text>
                <View style={[
                    styles.selectedTaskBox,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.success,
                        borderRadius: 12,
                        borderWidth: 2
                    }
                ]}>
                    <View style={styles.selectedTaskInfo}>
                        <Text style={[styles.selectedTaskName, { color: theme.textPrimary }]}>{selectedTask.name}</Text>
                        {subtaskCount > 0 && (
                            <View style={[styles.subtaskBadge, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                                <FontAwesome name="list" size={10} color={theme.primary} />
                                <Text style={[styles.subtaskBadgeText, { color: theme.primary }]}>{subtaskCount} subtask{subtaskCount > 1 ? 's' : ''}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.changeButton, { backgroundColor: theme.background, borderRadius: 8 }]}
                        onPress={onChangeTask}
                    >
                        <FontAwesome name="pencil" size={14} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Step 2: Configure Session */}
            <Animated.View
                style={[
                    styles.stepSection,
                    {
                        opacity: animationOpacity,
                        transform: [{ translateY: animationTranslateY }],
                    },
                ]}
            >
                <Text style={[styles.stepLabel, { color: theme.textSecondary }]}>Configure Session</Text>

                {/* Duration Selection */}
                <View style={styles.configSection}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>Work Duration</Text>
                    <View style={styles.durationRow}>
                        {DURATION_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.durationButton,
                                    {
                                        backgroundColor: theme.cardBg,
                                        borderColor: theme.border,
                                        borderRadius: 12,
                                    },
                                    duration === option.value && {
                                        backgroundColor: theme.primary,
                                        borderColor: theme.primary,
                                    },
                                ]}
                                onPress={() => onDurationChange(option.value)}
                            >
                                <Text style={[
                                    styles.durationValue,
                                    { color: theme.textPrimary },
                                    duration === option.value && { color: theme.white },
                                ]}>
                                    {option.label}
                                </Text>
                                <Text style={[
                                    styles.durationUnit,
                                    { color: theme.textTertiary },
                                    duration === option.value && { color: 'rgba(255,255,255,0.8)' },
                                ]}>
                                    {option.sublabel}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Iterations Selection */}
                <View style={styles.configSection}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>Number of Pomodoros</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.iterationsRow}>
                            {ITERATION_OPTIONS.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.iterationButton,
                                        {
                                            backgroundColor: theme.cardBg,
                                            borderColor: theme.border,
                                            borderRadius: 10,
                                        },
                                        iterations === num && {
                                            backgroundColor: theme.primary,
                                            borderColor: theme.primary,
                                        },
                                    ]}
                                    onPress={() => onIterationsChange(num)}
                                >
                                    <Text style={[
                                        styles.iterationText,
                                        { color: theme.textPrimary },
                                        iterations === num && { color: theme.white },
                                    ]}>
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Break Type Selection */}
                <View style={styles.configSection}>
                    <Text style={[styles.configLabel, { color: theme.textSecondary }]}>Break Duration</Text>
                    <View style={styles.breakRow}>
                        <TouchableOpacity
                            style={[
                                styles.breakButton,
                                {
                                    backgroundColor: theme.cardBg,
                                    borderColor: theme.border,
                                    borderRadius: 12,
                                },
                                breakType === 'short' && {
                                    backgroundColor: theme.primary,
                                    borderColor: theme.primary,
                                },
                            ]}
                            onPress={() => onBreakTypeChange('short')}
                        >
                            <FontAwesome
                                name="coffee"
                                size={16}
                                color={breakType === 'short' ? theme.white : theme.textSecondary}
                            />
                            <Text style={[
                                styles.breakText,
                                { color: theme.textPrimary },
                                breakType === 'short' && { color: theme.white },
                            ]}>
                                Short
                            </Text>
                            <Text style={[
                                styles.breakDuration,
                                { color: theme.textTertiary },
                                breakType === 'short' && { color: 'rgba(255,255,255,0.8)' },
                            ]}>
                                2 min
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.breakButton,
                                {
                                    backgroundColor: theme.cardBg,
                                    borderColor: theme.border,
                                    borderRadius: 12,
                                },
                                breakType === 'long' && {
                                    backgroundColor: theme.primary,
                                    borderColor: theme.primary,
                                },
                            ]}
                            onPress={() => onBreakTypeChange('long')}
                        >
                            <FontAwesome
                                name="bed"
                                size={16}
                                color={breakType === 'long' ? theme.white : theme.textSecondary}
                            />
                            <Text style={[
                                styles.breakText,
                                { color: theme.textPrimary },
                                breakType === 'long' && { color: theme.white },
                            ]}>
                                Long
                            </Text>
                            <Text style={[
                                styles.breakDuration,
                                { color: theme.textTertiary },
                                breakType === 'long' && { color: 'rgba(255,255,255,0.8)' },
                            ]}>
                                5 min
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Summary */}
                <View style={[styles.summaryCard, { backgroundColor: theme.background, borderRadius: 12 }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Focus Time</Text>
                        <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{duration * iterations} min</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Break Time</Text>
                        <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{(breakType === 'short' ? 2 : 5) * iterations} min</Text>
                    </View>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        {
                            backgroundColor: theme.primary,
                            borderRadius: 14,
                            shadowColor: theme.primary
                        }
                    ]}
                    onPress={onStartSession}
                    activeOpacity={0.85}
                >
                    <FontAwesome name="play-circle" size={22} color={theme.white} />
                    <Text style={[styles.startButtonText, { color: theme.white }]}>Start Session</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stepSection: {
        marginBottom: 16,
    },
    stepLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },

    // Selected Task Box
    selectedTaskBox: {
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedTaskInfo: {
        flex: 1,
    },
    selectedTaskName: {
        fontSize: 15,
        fontWeight: '700',
    },
    subtaskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 6,
        alignSelf: 'flex-start',
        gap: 4,
    },
    subtaskBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    changeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Config Sections
    configSection: {
        marginBottom: 12,
    },
    configLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },

    // Duration
    durationRow: {
        flexDirection: 'row',
        gap: 10,
    },
    durationButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 2,
    },
    durationValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    durationUnit: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },

    // Iterations
    iterationsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    iterationButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    iterationText: {
        fontSize: 15,
        fontWeight: '700',
    },

    // Break Type
    breakRow: {
        flexDirection: 'row',
        gap: 10,
    },
    breakButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 2,
        gap: 4,
    },
    breakText: {
        fontSize: 13,
        fontWeight: '600',
    },
    breakDuration: {
        fontSize: 11,
        fontWeight: '500',
    },

    // Summary
    summaryCard: {
        padding: 14,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    summaryLabel: {
        fontSize: 13,
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Start Button
    startButton: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
