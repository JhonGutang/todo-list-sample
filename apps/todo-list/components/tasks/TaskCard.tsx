import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskWithSubtasks, Category } from '@todolist/shared-types';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Chip from '../Chip';
import useDateFormatter from '../../hooks/useDateFormatter';
import { useTheme } from '../../contexts/ThemeContext';

interface TaskCardProps {
    item: TaskWithSubtasks;
    index: number;
    categories: Category[];
    onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
    priorityColor: string;
}

const TaskCard = ({ item, index, categories, onToggleComplete, priorityColor }: TaskCardProps) => {
    const router = useRouter();
    const { theme, isDark, themeType } = useTheme();
    const { formatRange } = useDateFormatter();

    const dateLabel = formatRange(item.startDate ?? undefined, item.endDate ?? undefined);
    const category = categories.find((c) => c.id === item.category_id);
    const categoryColor = themeType === 'cinnamoroll'
        ? (category?.id === 'cat_habit' ? theme.priorityLow :
            category?.id === 'cat_work' ? theme.priorityMedium :
                category?.id === 'cat_personal' ? theme.priorityHigh :
                    category?.color || theme.textSecondary)
        : category?.color || theme.textSecondary;
    const categoryName = category?.name || 'Uncategorized';

    const handleToggleComplete = async (e: any) => {
        e.stopPropagation();
        await onToggleComplete(item.id, !item.completed);
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(400)}
            style={styles.cardContainer}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderRadius: theme.cardRadius,
                        borderWidth: theme.cardBorderWidth,
                        shadowColor: theme.shadowColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 12,
                        elevation: 4,
                    },
                    item.completed && styles.cardCompleted,
                    pressed && styles.cardPressed
                ]}
                onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
            >
                {/* Priority Indicator Dot */}
                {priorityColor !== 'transparent' && (
                    <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
                )}

                <View style={styles.cardContent}>
                    {/* Checkbox */}
                    <Pressable
                        style={styles.checkboxContainer}
                        onPress={handleToggleComplete}
                    >
                        <View style={[
                            styles.checkbox,
                            {
                                borderColor: themeType === 'cinnamoroll' ? '#B0C4DE' : theme.border,
                                backgroundColor: theme.cardBg,
                                borderRadius: themeType === 'cinnamoroll' ? 10 : 12, // More cloud-like or just rounded
                            },
                            item.completed && {
                                borderColor: theme.primary,
                                backgroundColor: isDark ? theme.primary : (themeType === 'cinnamoroll' ? theme.primary : '#EFF6FF')
                            }
                        ]}>
                            {item.completed && <Ionicons name={themeType === 'cinnamoroll' ? "star" : "checkmark"} size={16} color={isDark || themeType === 'cinnamoroll' ? theme.white : theme.primary} />}
                        </View>
                    </Pressable>

                    {/* Task Content */}
                    <View style={styles.taskContent}>
                        <Text style={[
                            styles.title,
                            { color: theme.textPrimary },
                            item.completed && { color: theme.textSecondary, textDecorationLine: 'line-through' }
                        ]}>
                            {item.name}
                        </Text>
                        <View style={styles.metaRow}>
                            <Chip label={categoryName} color={categoryColor} variant="label" size="small" />
                            {dateLabel && <Text style={[styles.date, { color: theme.textSecondary }]}>{dateLabel}</Text>}
                        </View>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
    },
    card: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    cardCompleted: {
        opacity: 0.6,
    },
    cardPressed: {
        opacity: 0.7,
    },
    priorityIndicator: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        paddingTop: 2,
        marginRight: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskContent: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
});


export default TaskCard;
