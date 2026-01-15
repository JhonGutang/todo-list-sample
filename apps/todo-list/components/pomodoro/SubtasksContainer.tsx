import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/contexts/ThemeContext';

interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    order: number | null;
}

interface SubtasksContainerProps {
    subtasks: Subtask[];
    activeSubtaskIndex: number | null;
}

export default function SubtasksContainer({ subtasks, activeSubtaskIndex }: SubtasksContainerProps) {
    const { theme } = useTheme();

    if (subtasks.length === 0) {
        return null;
    }

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                borderWidth: theme.cardBorderWidth,
            }
        ]}>
            <Text style={[styles.header, { color: theme.textSecondary }]}>Subtasks</Text>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
            >
                {subtasks.map((subtask, index) => {
                    const isActive = activeSubtaskIndex === index;
                    const isCompleted = subtask.completed;

                    return (
                        <View
                            key={subtask.id}
                            style={[
                                styles.subtaskItem,
                                {
                                    backgroundColor: isActive ? theme.primary + '15' : 'transparent',
                                    borderColor: isActive ? theme.primary : theme.border,
                                    borderWidth: 1,
                                }
                            ]}
                        >
                            <View style={styles.subtaskContent}>
                                <FontAwesome
                                    name={isCompleted ? "check-circle" : "circle-o"}
                                    size={16}
                                    color={isCompleted ? theme.success : theme.textTertiary}
                                    style={styles.icon}
                                />
                                <Text
                                    style={[
                                        styles.subtaskText,
                                        {
                                            color: isCompleted ? theme.textTertiary : theme.textPrimary,
                                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                                        }
                                    ]}
                                    numberOfLines={2}
                                >
                                    {subtask.title}
                                </Text>
                            </View>
                            {isActive && (
                                <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                    <Text style={[styles.activeBadgeText, { color: theme.white }]}>Active</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        maxHeight: 200,
    },
    header: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        gap: 8,
    },
    subtaskItem: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    subtaskContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 10,
    },
    subtaskText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    activeBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginLeft: 8,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
