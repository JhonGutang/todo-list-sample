import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Alert, Vibration } from 'react-native';
import {
    getActiveSession,
    getSessionWithTask,
    createSession,
    updateSessionTimer,
    completeWorkSession,
    completeBreakSession,
    deleteSession,
} from '../services/pomodoro';
import { incrementPomodoroCompleted } from '../services/tasks';
import { PomodoroConfig, PomodoroSessionWithTask } from '@todolist/shared-types';

interface PomodoroContextType {
    session: PomodoroSessionWithTask | null;
    isLoading: boolean;
    startSession: (taskId: string, config: PomodoroConfig) => Promise<void>;
    pauseTimer: () => Promise<void>;
    resumeTimer: () => void;
    completeCurrentTimer: () => Promise<void>;
    cancelSession: () => Promise<void>;
    reloadSession: () => Promise<void>;
    remainingSeconds: number;
    isRunning: boolean;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<PomodoroSessionWithTask | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    // Load active session from database on mount
    const loadSession = useCallback(async () => {
        try {
            const activeSession = await getSessionWithTask();
            setSession(activeSession);
            if (activeSession) {
                setRemainingSeconds(activeSession.remaining_seconds);
                setIsRunning(!activeSession.is_paused);
            }
        } catch (error) {
            console.error('Failed to load Pomodoro session:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // Timer countdown logic (runs in memory)
    useEffect(() => {
        if (isRunning && remainingSeconds > 0) {
            intervalRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        // Timer completed
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        setIsRunning(false);
                        // Trigger completion handler
                        setTimeout(() => completeCurrentTimer(), 100);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000) as any;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, remainingSeconds]);

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' && session && isRunning) {
                // Save current state to database when app goes to background
                await updateSessionTimer(remainingSeconds, false);
            } else if (nextAppState === 'active' && session) {
                // Reload session when app comes to foreground
                await loadSession();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [session, isRunning, remainingSeconds, loadSession]);

    const startSession = useCallback(async (taskId: string, config: PomodoroConfig) => {
        try {
            const newSession = await createSession(taskId, config);
            const sessionWithTask = await getSessionWithTask();
            setSession(sessionWithTask);
            setRemainingSeconds(newSession.remaining_seconds);
            setIsRunning(true);
        } catch (error) {
            console.error('Failed to start Pomodoro session:', error);
            Alert.alert('Error', 'Failed to start Pomodoro session');
        }
    }, []);

    const pauseTimer = useCallback(async () => {
        if (!session) return;
        setIsRunning(false);
        // Save current state to database
        await updateSessionTimer(remainingSeconds, true);
        // Reload to sync
        await loadSession();
    }, [session, remainingSeconds, loadSession]);

    const resumeTimer = useCallback(() => {
        if (!session) return;
        setIsRunning(true);
    }, [session]);

    const completeCurrentTimer = useCallback(async () => {
        if (!session) return;

        try {
            if (session.timer_type === 'work') {
                // Work session completed
                Vibration.vibrate([500, 200, 500]);

                await completeWorkSession();

                Alert.alert(
                    'Work Session Complete!',
                    `Great job! Take a ${session.break_type === 'short' ? '2-minute' : '5-minute'} break.`,
                    [{
                        text: 'Start Break', onPress: async () => {
                            await loadSession();
                            setIsRunning(true);
                        }
                    }]
                );
            } else {
                // Break session completed
                Vibration.vibrate([500]);

                const shouldEndSession = await completeBreakSession();

                if (shouldEndSession) {
                    // All iterations complete - mark task as done
                    await incrementPomodoroCompleted(session.task_id, session.total_iterations);
                    await deleteSession();

                    Alert.alert(
                        'Session Complete!',
                        `Congratulations! You completed ${session.total_iterations} Pomodoro${session.total_iterations > 1 ? 's' : ''} on "${session.task.name}".`,
                        [{
                            text: 'Done', onPress: () => {
                                setSession(null);
                                setRemainingSeconds(0);
                                setIsRunning(false);
                            }
                        }]
                    );
                } else {
                    // More iterations to go
                    Alert.alert(
                        'Break Complete!',
                        'Time to get back to work!',
                        [{
                            text: 'Start Work', onPress: async () => {
                                await loadSession();
                                setIsRunning(true);
                            }
                        }]
                    );
                }
            }
        } catch (error) {
            console.error('Failed to complete timer:', error);
            Alert.alert('Error', 'Failed to complete timer');
        }
    }, [session, loadSession]);

    const cancelSession = useCallback(async () => {
        if (!session) return;

        Alert.alert(
            'Cancel Session?',
            'Are you sure you want to cancel this Pomodoro session? Your progress will not be saved.',
            [
                { text: 'Keep Going', style: 'cancel' },
                {
                    text: 'Cancel Session',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSession();
                            setSession(null);
                            setRemainingSeconds(0);
                            setIsRunning(false);
                        } catch (error) {
                            console.error('Failed to cancel session:', error);
                        }
                    },
                },
            ]
        );
    }, [session]);

    return (
        <PomodoroContext.Provider
            value={{
                session,
                isLoading,
                startSession,
                pauseTimer,
                resumeTimer,
                completeCurrentTimer,
                cancelSession,
                reloadSession: loadSession,
                remainingSeconds,
                isRunning,
            }}
        >
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (context === undefined) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
}
