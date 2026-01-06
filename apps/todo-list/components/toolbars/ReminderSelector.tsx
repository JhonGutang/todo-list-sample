import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderPreset } from '@todolist/shared-types';
import ModalBase from '../ModalBase';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
    visible: boolean;
    onClose: () => void;
    selectedPreset: ReminderPreset | null;
    onSelect: (preset: ReminderPreset | null) => void;
};

const REMINDER_OPTIONS: { value: ReminderPreset; label: string; icon: string }[] = [
    { value: '5min', label: '5 minutes before', icon: 'time-outline' },
    { value: '1min', label: '1 minute before', icon: 'time-outline' },
    { value: '30sec', label: '30 seconds before', icon: 'time-outline' },
];

export default function ReminderSelector({ visible, onClose, selectedPreset, onSelect }: Props) {
    const { theme, isDark } = useTheme();

    const handleSelect = (preset: ReminderPreset) => {
        if (selectedPreset === preset) {
            // Deselect if clicking the same preset
            onSelect(null);
        } else {
            onSelect(preset);
        }
        onClose();
    };

    const optionBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F5F5F5';
    const clearButtonBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6';

    return (
        <ModalBase visible={visible} onClose={onClose}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Reminder</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Get notified before task starts</Text>

                {REMINDER_OPTIONS.map((option) => {
                    const isSelected = selectedPreset === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.option,
                                { backgroundColor: isSelected ? theme.primary : optionBg }
                            ]}
                            onPress={() => handleSelect(option.value)}
                        >
                            <View style={styles.optionContent}>
                                <Ionicons
                                    name={option.icon as any}
                                    size={24}
                                    color={isSelected ? '#fff' : theme.textSecondary}
                                />
                                <Text style={[
                                    styles.optionText,
                                    { color: isSelected ? '#fff' : theme.textPrimary }
                                ]}>
                                    {option.label}
                                </Text>
                            </View>
                            {isSelected && (
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {selectedPreset && (
                    <TouchableOpacity
                        style={[styles.clearButton, { backgroundColor: clearButtonBg }]}
                        onPress={() => {
                            onSelect(null);
                            onClose();
                        }}
                    >
                        <Text style={[styles.clearButtonText, { color: theme.priorityHigh }]}>Clear Reminder</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ModalBase>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    clearButton: {
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
