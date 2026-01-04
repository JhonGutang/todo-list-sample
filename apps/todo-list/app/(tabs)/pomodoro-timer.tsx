import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CircularTimer from '@/components/pomodoro/CircularTimer';
import { useNavigation } from '@react-navigation/native';
import { useTimer } from '@/contexts/TimerContext';

type TimerMode = 'focus' | 'task';

export default function PomodoroTimerPage() {
    const [mode, setMode] = useState<TimerMode>('focus');
    const { isTimerRunning, setTimerRunning } = useTimer();
    const navigation = useNavigation();
    const isTimerRunningRef = React.useRef(isTimerRunning);

    // Keep ref in sync with state
    useEffect(() => {
        isTimerRunningRef.current = isTimerRunning;
    }, [isTimerRunning]);

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

    return (
        <View style={styles.container}>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        mode === 'focus' && styles.tabActive,
                        isTimerRunning && mode !== 'focus' && styles.tabDisabled
                    ]}
                    onPress={() => handleModeSwitch('focus')}
                    accessibilityLabel="Focus Timer"
                    disabled={isTimerRunning && mode !== 'focus'}
                >
                    <FontAwesome
                        name="clock-o"
                        size={18}
                        color={mode === 'focus' ? '#fff' : isTimerRunning ? '#ccc' : '#666'}
                        style={styles.tabIcon}
                    />
                    <Text style={[
                        styles.tabText,
                        mode === 'focus' && styles.tabTextActive,
                        isTimerRunning && mode !== 'focus' && styles.tabTextDisabled
                    ]}>
                        Focus Timer
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        mode === 'task' && styles.tabActive,
                        isTimerRunning && mode !== 'task' && styles.tabDisabled
                    ]}
                    onPress={() => handleModeSwitch('task')}
                    accessibilityLabel="Task Timer"
                    disabled={isTimerRunning && mode !== 'task'}
                >
                    <FontAwesome
                        name="tasks"
                        size={18}
                        color={mode === 'task' ? '#fff' : isTimerRunning ? '#ccc' : '#666'}
                        style={styles.tabIcon}
                    />
                    <Text style={[
                        styles.tabText,
                        mode === 'task' && styles.tabTextActive,
                        isTimerRunning && mode !== 'task' && styles.tabTextDisabled
                    ]}>
                        Task Timer
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Timer Component */}
            <CircularTimer
                mode={mode}
                onTimerComplete={handleTimerComplete}
                onRunningStateChange={handleRunningStateChange}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fafafa',
        alignItems: 'center',
    },

    // Tab Styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
        marginTop: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 140,
        justifyContent: 'center',
    },
    tabActive: {
        backgroundColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
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
        color: '#666',
    },
    tabTextActive: {
        color: '#fff',
    },
    tabTextDisabled: {
        color: '#ccc',
    },
});

