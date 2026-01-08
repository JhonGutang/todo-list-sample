import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Priority } from '@todolist/shared-types';
import ModalBase from '../ModalBase';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
    selectedPriority: Priority;
    onSelect: (priority: Priority) => void;
    visible: boolean;
    onClose: () => void;
};

export default function PrioritySelector({ selectedPriority, onSelect, visible, onClose }: Props) {
    const { theme } = useTheme();

    const priorities: { value: Priority; label: string; color: string }[] = [
        { value: 'low', label: 'Low', color: theme.priorityLow },
        { value: 'medium', label: 'Medium', color: theme.priorityMedium },
        { value: 'high', label: 'High', color: theme.priorityHigh },
    ];

    const handleSelect = (priority: Priority) => {
        onSelect(priority);
        onClose();
    };

    return (
        <ModalBase visible={visible} onClose={onClose} maxHeight="22%">
            <View style={[styles.content, { paddingBottom: 20 }]}>
                {priorities.map((p) => (
                    <TouchableOpacity
                        key={p.value}
                        style={[styles.item, selectedPriority === p.value && styles.itemSelected]}
                        onPress={() => handleSelect(p.value)}
                    >
                        <View style={[styles.colorDot, { backgroundColor: p.color }]} />
                        <Text style={[styles.itemText, { color: theme.textPrimary }]}>{p.label}</Text>
                        {selectedPriority === p.value && <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>}
                    </TouchableOpacity>
                ))}
            </View>
        </ModalBase>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 32,
        paddingTop: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 0,
        borderBottomWidth: 0,
    },
    itemSelected: {
        backgroundColor: 'transparent',
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
    },
    checkmark: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
