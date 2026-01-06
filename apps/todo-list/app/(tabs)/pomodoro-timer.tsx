import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CircularTimer from '@/components/pomodoro/CircularTimer';
import TaskSelector from '@/components/pomodoro/TaskSelector';
import SessionDisplay from '@/components/pomodoro/SessionDisplay';
import { useNavigation } from '@react-navigation/native';
import { useTimer } from '@/contexts/TimerContext';
import { usePomodoro } from '@/contexts/PomodoroContext';
import { PomodoroConfig } from '@todolist/shared-types';
import { useTheme } from '@/contexts/ThemeContext';

type TimerMode = 'focus' | 'task';

export default function PomodoroTimerPage() {
    const [mode, setMode] = useState<TimerMode>('focus');
    const { isTimerRunning, setTimerRunning } = useTimer();
    const { session, startSession, cancelSession, isLoading } = usePomodoro();
    const { theme, themeType } = useTheme();
    const navigation = useNavigation();
    const isTimerRunningRef = React.useRef(isTimerRunning);
    const [focusCount, setFocusCount] = useState(0);

    // Keep ref in sync with state
    useEffect(() => {
        isTimerRunningRef.current = isTimerRunning;
    }, [isTimerRunning]);

    useFocusEffect(
        useCallback(() => {
            setFocusCount(prev => prev + 1);
        }, [])
    );

    // Prevent navigation when timer is running
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Use ref to get the latest value
            if (!isTimerRunningRef.current) {
                // If timer is not running, allow navigation
                return;
            }

            // Prevent navigation and show alert
            e.preventDefault();

            Alert.alert(
                'Timer Running',
                'Please pause or complete your timer before leaving this screen.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Stop Timer',
                        style: 'destructive',
                        onPress: () => {
                            // Reset state and allow navigation
                            setTimerRunning(false);
                            isTimerRunningRef.current = false;
                            // Dispatch the navigation action
                            navigation.dispatch(e.data.action);
                        },
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, setTimerRunning]);

    const handleTimerComplete = () => {
        console.log(`${mode} timer completed`);
    };

    const handleRunningStateChange = useCallback((running: boolean) => {
        setTimerRunning(running);
    }, [setTimerRunning]);

    const handleModeSwitch = (newMode: TimerMode) => {
        if (isTimerRunning) {
            Alert.alert(
                'Timer Running',
                'Please pause the timer before switching modes.',
                [{ text: 'OK' }]
            );
            return;
        }
        setMode(newMode);
    };

    const handleStartSession = async (taskId: string, config: PomodoroConfig) => {
        try {
            await startSession(taskId, config);
        } catch (error) {
            console.error('Failed to start session:', error);
            Alert.alert('Error', 'Failed to start Pomodoro session');
        }
    };

    const handleCancelSession = async () => {
        // Reset timer running state first to allow navigation after cancel
        setTimerRunning(false);
        isTimerRunningRef.current = false;
        await cancelSession();
    };

    // Show task mode if there's an active session
    const hasActiveSession = session !== null;
    const effectiveMode = hasActiveSession ? 'task' : mode;

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                {/* Tab Navigation */}
            <View style={[
                styles.tabContainer,
                {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    borderWidth: theme.cardBorderWidth,
                    borderRadius: 16
                }
            ]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        { borderRadius: 12 },
                        effectiveMode === 'focus' && { backgroundColor: theme.primary },
                        (isTimerRunning || hasActiveSession) && effectiveMode !== 'focus' && styles.tabDisabled
                    ]}
                    onPress={() => handleModeSwitch('focus')}
                    accessibilityLabel="Focus Timer"
                    disabled={(isTimerRunning || hasActiveSession) && effectiveMode !== 'focus'}
                >
                    <FontAwesome
                        name="clock-o"
                        size={18}
                        color={effectiveMode === 'focus' ? theme.white : (isTimerRunning || hasActiveSession) ? theme.border : theme.textSecondary}
                        style={styles.tabIcon}
                    />
                    <Text style={[
                        styles.tabText,
                        { color: theme.textSecondary },
                        effectiveMode === 'focus' && { color: theme.white, fontWeight: '700' },
                        (isTimerRunning || hasActiveSession) && effectiveMode !== 'focus' && { color: theme.border }
                    ]}>
                        Focus Timer
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        { borderRadius: 12 },
                        effectiveMode === 'task' && { backgroundColor: theme.primary },
                        (isTimerRunning || hasActiveSession) && effectiveMode !== 'task' && styles.tabDisabled
                    ]}
                    onPress={() => handleModeSwitch('task')}
                    accessibilityLabel="Task Timer"
                    disabled={(isTimerRunning || hasActiveSession) && effectiveMode !== 'task'}
                >
                    <FontAwesome
                        name="tasks"
                        size={18}
                        color={effectiveMode === 'task' ? theme.white : (isTimerRunning || hasActiveSession) ? theme.border : theme.textSecondary}
                        style={styles.tabIcon}
                    />
                    <Text style={[
                        styles.tabText,
                        { color: theme.textSecondary },
                        effectiveMode === 'task' && { color: theme.white, fontWeight: '700' },
                        (isTimerRunning || hasActiveSession) && effectiveMode !== 'task' && { color: theme.border }
                    ]}>
                        Task Timer
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {effectiveMode === 'focus' ? (
                <View style={styles.focusContent}>
                    <CircularTimer
                        mode="focus"
                        onTimerComplete={handleTimerComplete}
                        onRunningStateChange={handleRunningStateChange}
                    />
                </View>
            ) : (
                <>
                    {hasActiveSession ? (
                        <View style={styles.activeSessionContent}>
                            {/* Timer at Top */}
                            <View style={styles.timerSection}>
                                <CircularTimer
                                    mode="task"
                                    onTimerComplete={handleTimerComplete}
                                    onRunningStateChange={handleRunningStateChange}
                                />
                            </View>
                            {/* Session Info at Bottom */}
                            <SessionDisplay
                                session={session}
                                onCancel={handleCancelSession}
                            />
                        </View>
                    ) : (
                        <TaskSelector onStartSession={handleStartSession} refreshKey={`${mode}-${focusCount}`} />
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
    },
    focusContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeSessionContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    timerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tab Styles
    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        marginBottom: 16,
        marginHorizontal: 16,
        alignSelf: 'center',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 140,
        justifyContent: 'center',
    },
    tabDisabled: {
        opacity: 0.4,
    },
    tabIcon: {
        marginRight: 8,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
    },
});



