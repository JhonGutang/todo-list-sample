import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, LayoutAnimation, Animated } from 'react-native';
import { Task, PomodoroConfig } from '@todolist/shared-types';
import { getAllTasks } from '@/services/tasks';
import { getSubtasksForTask } from '@/services/subtasks';
import TaskList from './TaskList';
import SessionConfig from './SessionConfig';

interface TaskSelectorProps {
    onStartSession: (taskId: string, config: PomodoroConfig) => void;
    refreshKey?: string | number;
}

export default function TaskSelector({ onStartSession, refreshKey }: TaskSelectorProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [subtaskCount, setSubtaskCount] = useState(0);
    const [duration, setDuration] = useState(25);
    const [iterations, setIterations] = useState(3);
    const [breakType, setBreakType] = useState<'short' | 'long'>('short');

    // Animation values
    const settingsOpacity = useRef(new Animated.Value(0)).current;
    const settingsTranslateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        if (selectedTask) {
            loadSubtaskCount(selectedTask.id);
            // Animate settings panel in
            Animated.parallel([
                Animated.timing(settingsOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(settingsTranslateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset animation values
            settingsOpacity.setValue(0);
            settingsTranslateY.setValue(30);
        }
    }, [selectedTask]);

    const loadTasks = async () => {
        try {
            const allTasks = await getAllTasks();
            const incompleteTasks = allTasks.filter(t => !t.completed);
            setTasks(incompleteTasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    const loadSubtaskCount = async (taskId: string) => {
        try {
            const subtasks = await getSubtasksForTask(taskId);
            setSubtaskCount(subtasks.length);
        } catch (error) {
            console.error('Failed to load subtasks:', error);
        }
    };

    const handleTaskSelect = (task: Task) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedTask(task);
    };

    const handleChangeTask = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedTask(null);
    };

    const handleStartSession = () => {
        if (!selectedTask) return;
        const config: PomodoroConfig = {
            workDurationMinutes: duration,
            breakType,
            totalIterations: iterations,
        };
        onStartSession(selectedTask.id, config);
    };

    // PHASE 1: Task Selection
    if (!selectedTask) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Select a Task</Text>
                <Text style={styles.subtitle}>Choose a task to start your Pomodoro session</Text>
                <TaskList
                    tasks={tasks}
                    onSelectTask={handleTaskSelect}
                    selectedTaskId={undefined}
                    refreshKey={refreshKey}
                />
            </View>
        );
    }

    // PHASE 2: Session Configuration
    return (
        <View style={[styles.container, styles.settingsContent]}>
            <SessionConfig
                selectedTask={selectedTask}
                subtaskCount={subtaskCount}
                duration={duration}
                iterations={iterations}
                breakType={breakType}
                onDurationChange={setDuration}
                onIterationsChange={setIterations}
                onBreakTypeChange={setBreakType}
                onChangeTask={handleChangeTask}
                onStartSession={handleStartSession}
                animationOpacity={settingsOpacity}
                animationTranslateY={settingsTranslateY}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '90%',
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    settingsContent: {
        paddingTop: 16,
    },
});
