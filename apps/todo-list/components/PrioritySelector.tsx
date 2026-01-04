import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Priority } from '@todolist/shared-types';

type Props = {
    selectedPriority: Priority;
    onSelect: (priority: Priority) => void;
    visible: boolean;
    onClose: () => void;
};

const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: '#2ecc71' },
    { value: 'medium', label: 'Medium', color: '#f39c12' },
    { value: 'high', label: 'High', color: '#e74c3c' },
];

export default function PrioritySelector({ selectedPriority, onSelect, visible, onClose }: Props) {
    const handleSelect = (priority: Priority) => {
        onSelect(priority);
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                <View style={styles.dropdownContainer}>
                    <View style={styles.dropdown}>
                        {priorities.map((p) => (
                            <TouchableOpacity
                                key={p.value}
                                style={[styles.item, selectedPriority === p.value && styles.itemSelected]}
                                onPress={() => handleSelect(p.value)}
                            >
                                <View style={[styles.colorDot, { backgroundColor: p.color }]} />
                                <Text style={styles.itemText}>{p.label}</Text>
                                {selectedPriority === p.value && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    dropdownContainer: {
        width: '100%',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemSelected: {
        backgroundColor: '#f8f9fa',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    itemText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    checkmark: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: 'bold',
    },
});
