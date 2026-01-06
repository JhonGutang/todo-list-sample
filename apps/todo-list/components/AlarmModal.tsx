import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '@todolist/shared-types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
    visible: boolean;
    task: Task | null;
    onDismiss: () => void;
};

export default function AlarmModal({ visible, task, onDismiss }: Props) {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const vibrationInterval = useRef<any>(null);

    useEffect(() => {
        if (visible) {
            // Animate modal in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Start continuous vibration pattern
            startVibration();
        } else {
            // Animate modal out
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Stop vibration
            stopVibration();
        }

        return () => {
            stopVibration();
        };
    }, [visible]);

    const startVibration = () => {
        // Initial strong vibration
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Continue vibrating every 2 seconds
        vibrationInterval.current = setInterval(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 2000);
    };

    const stopVibration = () => {
        if (vibrationInterval.current) {
            clearInterval(vibrationInterval.current);
            vibrationInterval.current = null;
        }
    };

    const handleStartTask = () => {
        if (task) {
            stopVibration();
            onDismiss();
            router.push({ pathname: '/task/[id]', params: { id: task.id } });
        }
    };

    const handleDismiss = () => {
        stopVibration();
        onDismiss();
    };

    if (!visible || !task) return null;

    return (
        <Animated.View
            style={[
                styles.overlay,
                {
                    opacity: fadeAnim,
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.modal,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        shadowColor: theme.shadowColor,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Alarm Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="alarm" size={64} color={theme.primary} />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: theme.primary }]}>🚨 TASK ALARM</Text>

                {/* Task Name */}
                <Text style={[styles.taskName, { color: theme.textPrimary }]}>{task.name}</Text>

                {/* Time Info */}
                {task.startTime && (
                    <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                        Starts at {new Date(task.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </Text>
                )}

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.startButton, { backgroundColor: theme.primary }]}
                        onPress={handleStartTask}
                    >
                        <Ionicons name="play-circle" size={24} color="#fff" />
                        <Text style={styles.startButtonText}>Start Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.dismissButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6' }]}
                        onPress={handleDismiss}
                    >
                        <Text style={[styles.dismissButtonText, { color: theme.textSecondary }]}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FF3B30',
        marginBottom: 16,
        letterSpacing: 1,
    },
    taskName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    startButton: {
        backgroundColor: '#007AFF',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    dismissButton: {
        backgroundColor: '#F3F4F6',
    },
    dismissButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
