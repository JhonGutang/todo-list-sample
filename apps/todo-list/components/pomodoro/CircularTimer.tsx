import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Circle } from 'react-native-svg';
import { usePomodoro } from '@/contexts/PomodoroContext';

interface CircularTimerProps {
    mode: 'focus' | 'task';
    onTimerComplete?: () => void;
    onRunningStateChange?: (isRunning: boolean) => void;
}

export default function CircularTimer({ mode, onTimerComplete, onRunningStateChange }: CircularTimerProps) {
    const DEFAULT_MIN = 25;
    const [totalSeconds, setTotalSeconds] = useState(DEFAULT_MIN * 60);
    const [remaining, setRemaining] = useState(DEFAULT_MIN * 60);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Pomodoro session state (for task mode)
    const { session, remainingSeconds: sessionRemaining, isRunning: sessionIsRunning, pauseTimer, resumeTimer } = usePomodoro();

    // Use session state if in task mode and session exists
    const isTaskMode = mode === 'task' && session !== null;
    const displayRemaining = isTaskMode ? sessionRemaining : remaining;
    const displayIsRunning = isTaskMode ? sessionIsRunning : isRunning;
    const displayTotal = isTaskMode ? (session?.timer_type === 'work' ? session.work_duration_minutes * 60 : (session?.break_type === 'short' ? 120 : 300)) : totalSeconds;

    useEffect(() => {
        setRemaining(totalSeconds);
    }, [totalSeconds]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current as any);
        };
    }, []);

    // Focus mode timer logic (standalone)
    useEffect(() => {
        if (!isTaskMode && isRunning) {
            intervalRef.current = setInterval(() => {
                setRemaining((r) => {
                    if (r <= 1) {
                        // finished
                        if (intervalRef.current) clearInterval(intervalRef.current as any);
                        setIsRunning(false);
                        onRunningStateChange?.(false);
                        // vibrate and alert
                        Vibration.vibrate([500, 200, 500]);
                        Alert.alert(
                            'Timer finished',
                            'Focus session complete!'
                        );
                        onTimerComplete?.();
                        return 0;
                    }
                    return r - 1;
                });
            }, 1000) as any;
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current as any);
            intervalRef.current = null;
        };
    }, [isRunning, isTaskMode, onTimerComplete]);

    // Notify parent of running state changes
    useEffect(() => {
        onRunningStateChange?.(displayIsRunning);
    }, [displayIsRunning, onRunningStateChange]);

    // Animate progress
    useEffect(() => {
        const progress = displayTotal > 0 ? (displayTotal - displayRemaining) / displayTotal : 0;
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [displayRemaining, displayTotal]);

    const startPause = async () => {
        if (isTaskMode) {
            // Task mode - use Pomodoro context
            if (sessionIsRunning) {
                await pauseTimer();
            } else {
                resumeTimer();
            }
        } else {
            // Focus mode - local state
            if (isRunning) {
                setIsRunning(false);
                onRunningStateChange?.(false);
            } else {
                // can't start if no time
                if (remaining <= 0) setRemaining(totalSeconds);
                setIsRunning(true);
                onRunningStateChange?.(true);
            }
        }
    };

    const reset = () => {
        if (isTaskMode) {
            Alert.alert('Cannot Reset', 'You cannot reset a Pomodoro session. Please cancel the session instead.');
            return;
        }
        if (intervalRef.current) clearInterval(intervalRef.current as any);
        setIsRunning(false);
        onRunningStateChange?.(false);
        setRemaining(totalSeconds);
    };

    const setPreset = (m: number) => {
        if (isRunning) {
            Alert.alert('Timer Running', 'Please pause the timer before changing the duration.');
            return;
        }
        if (isTaskMode) {
            Alert.alert('Session Active', 'Cannot change duration during a Pomodoro session.');
            return;
        }
        const secs = m * 60;
        setTotalSeconds(secs);
        setRemaining(secs);
        setIsRunning(false);
    };

    const minutes = Math.floor(displayRemaining / 60);
    const seconds = displayRemaining % 60;

    // Circle progress calculation
    const circleSize = 280;
    const strokeWidth = 12;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = displayTotal > 0 ? (displayTotal - displayRemaining) / displayTotal : 0;
    const strokeDashoffset = circumference * (1 - progress);

    // Get progress text for task mode
    const getProgressText = () => {
        if (!isTaskMode || !session) return null;
        return `${session.current_iteration}/${session.total_iterations}`;
    };

    return (
        <View style={styles.container}>
            {/* Mode Description */}
            <Text style={styles.modeDescription}>
                {mode === 'focus'
                    ? 'Focus on your work without distractions'
                    : isTaskMode
                        ? `${session?.timer_type === 'work' ? 'Work Session' : session?.break_type === 'short' ? 'Short Break' : 'Long Break'}`
                        : 'Select a task to start tracking'}
            </Text>

            {/* Circular Timer */}
            <View style={styles.circularTimerContainer}>
                <Svg width={circleSize} height={circleSize} style={styles.circularTimer}>
                    {/* Background Circle */}
                    <Circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        stroke="#f0f0f0"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <Circle
                        cx={circleSize / 2}
                        cy={circleSize / 2}
                        r={radius}
                        stroke="#6366f1"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${circleSize / 2}, ${circleSize / 2}`}
                    />
                </Svg>

                {/* Timer Display */}
                <View style={styles.timerTextContainer}>
                    <Text style={styles.timerText}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </Text>
                    {getProgressText() && (
                        <Text style={styles.progressText}>{getProgressText()}</Text>
                    )}
                    <Text style={styles.timerLabel}>
                        {displayIsRunning ? 'In Progress' : 'Paused'}
                    </Text>
                </View>
            </View>

            {/* Preset Buttons - Only show in focus mode */}
            {!isTaskMode && (
                <View style={styles.presetsRow}>
                    <TouchableOpacity
                        style={[styles.preset, totalSeconds === 25 * 60 && styles.presetActive, isRunning && styles.presetDisabled]}
                        onPress={() => setPreset(25)}
                        accessibilityLabel="25 minutes"
                        disabled={isRunning}
                    >
                        <Text style={[styles.presetText, totalSeconds === 25 * 60 && styles.presetTextActive, isRunning && styles.presetTextDisabled]}>25</Text>
                        <Text style={[styles.presetLabel, totalSeconds === 25 * 60 && styles.presetLabelActive, isRunning && styles.presetTextDisabled]}>min</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.preset, totalSeconds === 15 * 60 && styles.presetActive, isRunning && styles.presetDisabled]}
                        onPress={() => setPreset(15)}
                        accessibilityLabel="15 minutes"
                        disabled={isRunning}
                    >
                        <Text style={[styles.presetText, totalSeconds === 15 * 60 && styles.presetTextActive, isRunning && styles.presetTextDisabled]}>15</Text>
                        <Text style={[styles.presetLabel, totalSeconds === 15 * 60 && styles.presetLabelActive, isRunning && styles.presetTextDisabled]}>min</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.preset, totalSeconds === 5 * 60 && styles.presetActive, isRunning && styles.presetDisabled]}
                        onPress={() => setPreset(5)}
                        accessibilityLabel="5 minutes"
                        disabled={isRunning}
                    >
                        <Text style={[styles.presetText, totalSeconds === 5 * 60 && styles.presetTextActive, isRunning && styles.presetTextDisabled]}>5</Text>
                        <Text style={[styles.presetLabel, totalSeconds === 5 * 60 && styles.presetLabelActive, isRunning && styles.presetTextDisabled]}>min</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Control Buttons */}
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[styles.iconButton, displayIsRunning && styles.pauseButton]}
                    onPress={startPause}
                    accessibilityLabel={displayIsRunning ? 'Pause' : 'Start'}
                >
                    <FontAwesome name={displayIsRunning ? "pause" : "play"} size={28} color="white" />
                </TouchableOpacity>
                {!isTaskMode && (
                    <TouchableOpacity
                        style={styles.iconButtonSecondary}
                        onPress={reset}
                        accessibilityLabel="Reset"
                    >
                        <FontAwesome name="rotate-right" size={24} color="#666" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Mode Description
    modeDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 32,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Circular Timer
    circularTimerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    circularTimer: {
        transform: [{ rotate: '-90deg' }],
    },
    timerTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 56,
        fontWeight: '700',
        color: '#1f2937',
        letterSpacing: 2,
    },
    progressText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6366f1',
        marginTop: 4,
    },
    timerLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Presets
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 12,
    },
    preset: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    presetActive: {
        backgroundColor: '#ede9fe',
        borderColor: '#6366f1',
    },
    presetDisabled: {
        opacity: 0.4,
        backgroundColor: '#f5f5f5',
    },
    presetTextDisabled: {
        color: '#9ca3af',
    },
    presetText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
    },
    presetTextActive: {
        color: '#6366f1',
    },
    presetLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 2,
        fontWeight: '500',
    },
    presetLabelActive: {
        color: '#6366f1',
    },

    // Controls
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    pauseButton: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
    },
    iconButtonSecondary: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
});
