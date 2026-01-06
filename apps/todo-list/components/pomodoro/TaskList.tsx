import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Task } from '@todolist/shared-types';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskListProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
    selectedTaskId?: string;
}

interface AnimatedTaskItemProps {
    task: Task;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    isSelected: boolean;
    onPress: () => void;
    refreshKey?: string | number;
}

function AnimatedTaskItem({ task, index, isFirst, isLast, isSelected, onPress, refreshKey }: AnimatedTaskItemProps) {
    const { theme, themeType } = useTheme();
    const slideTx = useSharedValue(0);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: slideTx.value },
                { scale: scale.value },
            ],
        };
    });

    const handlePressIn = () => {
        slideTx.value = withSpring(8, { damping: 10, stiffness: 100 });
        scale.value = withSpring(0.98, { damping: 10, stiffness: 100 });
    };

    const handlePressOut = () => {
        slideTx.value = withSpring(0, { damping: 10, stiffness: 100 });
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            activeOpacity={1}
        >
            <Animated.View
                entering={FadeInDown.delay(index * 50).duration(400)}
                key={`${task.id}-${refreshKey}`}
                style={[
                    styles.taskItem,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderWidth: theme.cardBorderWidth,
                        borderRadius: theme.cardRadius,
                    },
                    isFirst && styles.taskItemFirst,
                    isLast && styles.taskItemLast,
                    isSelected && [
                        styles.taskItemSelected,
                        {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                            shadowColor: theme.shadowColor,
                        }
                    ],
                    animatedStyle
                ]}
            >
                <View style={styles.taskItemContent}>
                    <View style={styles.taskItemInfo}>
                        <Text
                            style={[
                                styles.taskItemName,
                                { color: theme.textPrimary },
                                isSelected && { color: themeType === 'cinnamoroll' ? theme.textPrimary : theme.white }
                            ]}
                            numberOfLines={1}
                        >
                            {task.name}
                        </Text>
                        {task.description && (
                            <Text
                                style={[
                                    styles.taskItemDescription,
                                    { color: theme.textSecondary },
                                    isSelected && { color: themeType === 'cinnamoroll' ? theme.textSecondary : 'rgba(255,255,255,0.7)' }
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

export default function TaskList({ tasks, onSelectTask, selectedTaskId, refreshKey }: TaskListProps & { refreshKey?: string | number }) {
    const { theme } = useTheme();

    if (tasks.length === 0) {
        return (
            <View style={styles.emptyState}>
                <FontAwesome name="inbox" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks available</Text>
                <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>Create a task first to get started</Text>
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
                    key={`${item.id}-${refreshKey}`}
                    task={item}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === tasks.length - 1}
                    isSelected={item.id === selectedTaskId}
                    onPress={() => onSelectTask(item)}
                    refreshKey={refreshKey}
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
        paddingVertical: 18,
        paddingHorizontal: 20,
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
    },
    taskItemDescription: {
        fontSize: 13,
        marginTop: 4,
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
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
    },
});
