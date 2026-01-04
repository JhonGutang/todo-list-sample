import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Task } from '@todolist/shared-types';

interface TaskListProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
    selectedTaskId?: string;
}

interface AnimatedTaskItemProps {
    task: Task;
    isFirst: boolean;
    isLast: boolean;
    isSelected: boolean;
    onPress: () => void;
}

function AnimatedTaskItem({ task, isFirst, isLast, isSelected, onPress }: AnimatedTaskItemProps) {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 8,
                useNativeDriver: true,
                speed: 50,
                bounciness: 8,
            }),
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
                speed: 50,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                speed: 50,
                bounciness: 8,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
            }),
        ]).start();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.taskItem,
                    isFirst && styles.taskItemFirst,
                    isLast && styles.taskItemLast,
                    isSelected && styles.taskItemSelected,
                    {
                        transform: [
                            { translateX: slideAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                <View style={styles.taskItemContent}>
                    <View style={styles.taskItemInfo}>
                        <Text
                            style={[
                                styles.taskItemName,
                                isSelected && styles.taskItemNameSelected
                            ]}
                            numberOfLines={1}
                        >
                            {task.name}
                        </Text>
                        {task.description && (
                            <Text
                                style={[
                                    styles.taskItemDescription,
                                    isSelected && styles.taskItemDescriptionSelected
                                ]}
                                numberOfLines={1}
                            >
                                {task.description}
                            </Text>
                        )}
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function TaskList({ tasks, onSelectTask, selectedTaskId }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <View style={styles.emptyState}>
                <FontAwesome name="inbox" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No tasks available</Text>
                <Text style={styles.emptySubtext}>Create a task first to get started</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.taskListScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.taskListContent}
        >
            {tasks.map((item, index) => (
                <AnimatedTaskItem
                    key={item.id}
                    task={item}
                    isFirst={index === 0}
                    isLast={index === tasks.length - 1}
                    isSelected={item.id === selectedTaskId}
                    onPress={() => onSelectTask(item)}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    taskListScroll: {
        flex: 1,
    },
    taskListContent: {
        paddingBottom: 40,
        gap: 12,
    },
    taskItem: {
        backgroundColor: '#fff',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    taskItemFirst: {
        // No special styling needed with gap
    },
    taskItemLast: {
        // No special styling needed with gap
    },
    taskItemSelected: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    taskItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskItemInfo: {
        flex: 1,
    },
    taskItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    taskItemNameSelected: {
        color: '#ffffff',
    },
    taskItemDescription: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 4,
    },
    taskItemDescriptionSelected: {
        color: '#e0e7ff',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#9ca3af',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#d1d5db',
        marginTop: 4,
    },
});
