import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Task, PomodoroConfig } from '@todolist/shared-types';

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
    return (
        <View style={styles.container}>
            {/* Step 1: Selected Task */}
            <View style={styles.stepSection}>
                <Text style={styles.stepLabel}>Task Selected</Text>
                <View style={styles.selectedTaskBox}>
                    <View style={styles.selectedTaskInfo}>
                        <Text style={styles.selectedTaskName}>{selectedTask.name}</Text>
                        {subtaskCount > 0 && (
                            <View style={styles.subtaskBadge}>
                                <FontAwesome name="list" size={10} color="#6366f1" />
                                <Text style={styles.subtaskBadgeText}>{subtaskCount} subtask{subtaskCount > 1 ? 's' : ''}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity style={styles.changeButton} onPress={onChangeTask}>
                        <FontAwesome name="pencil" size={14} color="#6b7280" />
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
                <Text style={styles.stepLabel}>Configure Session</Text>

                {/* Duration Selection */}
                <View style={styles.configSection}>
                    <Text style={styles.configLabel}>Work Duration</Text>
                    <View style={styles.durationRow}>
                        {DURATION_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.durationButton,
                                    duration === option.value && styles.durationButtonActive,
                                ]}
                                onPress={() => onDurationChange(option.value)}
                            >
                                <Text style={[
                                    styles.durationValue,
                                    duration === option.value && styles.durationValueActive,
                                ]}>
                                    {option.label}
                                </Text>
                                <Text style={[
                                    styles.durationUnit,
                                    duration === option.value && styles.durationUnitActive,
                                ]}>
                                    {option.sublabel}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Iterations Selection */}
                <View style={styles.configSection}>
                    <Text style={styles.configLabel}>Number of Pomodoros</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.iterationsRow}>
                            {ITERATION_OPTIONS.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.iterationButton,
                                        iterations === num && styles.iterationButtonActive,
                                    ]}
                                    onPress={() => onIterationsChange(num)}
                                >
                                    <Text style={[
                                        styles.iterationText,
                                        iterations === num && styles.iterationTextActive,
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
                    <Text style={styles.configLabel}>Break Duration</Text>
                    <View style={styles.breakRow}>
                        <TouchableOpacity
                            style={[
                                styles.breakButton,
                                breakType === 'short' && styles.breakButtonActive,
                            ]}
                            onPress={() => onBreakTypeChange('short')}
                        >
                            <FontAwesome
                                name="coffee"
                                size={16}
                                color={breakType === 'short' ? '#fff' : '#6b7280'}
                            />
                            <Text style={[
                                styles.breakText,
                                breakType === 'short' && styles.breakTextActive,
                            ]}>
                                Short
                            </Text>
                            <Text style={[
                                styles.breakDuration,
                                breakType === 'short' && styles.breakDurationActive,
                            ]}>
                                2 min
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.breakButton,
                                breakType === 'long' && styles.breakButtonActive,
                            ]}
                            onPress={() => onBreakTypeChange('long')}
                        >
                            <FontAwesome
                                name="bed"
                                size={16}
                                color={breakType === 'long' ? '#fff' : '#6b7280'}
                            />
                            <Text style={[
                                styles.breakText,
                                breakType === 'long' && styles.breakTextActive,
                            ]}>
                                Long
                            </Text>
                            <Text style={[
                                styles.breakDuration,
                                breakType === 'long' && styles.breakDurationActive,
                            ]}>
                                5 min
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Focus Time</Text>
                        <Text style={styles.summaryValue}>{duration * iterations} min</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Break Time</Text>
                        <Text style={styles.summaryValue}>{(breakType === 'short' ? 2 : 5) * iterations} min</Text>
                    </View>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={onStartSession}
                    activeOpacity={0.85}
                >
                    <FontAwesome name="play-circle" size={22} color="#fff" />
                    <Text style={styles.startButtonText}>Start Session</Text>
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
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },

    // Selected Task Box
    selectedTaskBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#10b981',
    },
    selectedTaskInfo: {
        flex: 1,
    },
    selectedTaskName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1f2937',
    },
    subtaskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ede9fe',
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
        color: '#6366f1',
    },
    changeButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
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
        color: '#6b7280',
        marginBottom: 8,
    },

    // Duration
    durationRow: {
        flexDirection: 'row',
        gap: 10,
    },
    durationButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    durationButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    durationValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
    },
    durationValueActive: {
        color: '#fff',
    },
    durationUnit: {
        fontSize: 11,
        fontWeight: '500',
        color: '#9ca3af',
        marginTop: 2,
    },
    durationUnitActive: {
        color: 'rgba(255,255,255,0.8)',
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
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    iterationButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    iterationText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
    },
    iterationTextActive: {
        color: '#fff',
    },

    // Break Type
    breakRow: {
        flexDirection: 'row',
        gap: 10,
    },
    breakButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        gap: 4,
    },
    breakButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    breakText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    breakTextActive: {
        color: '#fff',
    },
    breakDuration: {
        fontSize: 11,
        fontWeight: '500',
        color: '#9ca3af',
    },
    breakDurationActive: {
        color: 'rgba(255,255,255,0.8)',
    },

    // Summary
    summaryCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
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
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },

    // Start Button
    startButton: {
        backgroundColor: '#6366f1',
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
