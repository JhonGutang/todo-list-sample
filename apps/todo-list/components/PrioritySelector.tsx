import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();

    const handleSelect = (priority: Priority) => {
        onSelect(priority);
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                <View style={styles.dropdownContainer}>
                    <View style={[styles.dropdown, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    dropdownContainer: {
        width: '100%',
        justifyContent: 'flex-end',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        paddingHorizontal: 32,
        paddingTop: 32,
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
        color: '#000',
        fontWeight: '400',
    },
    checkmark: {
        fontSize: 18,
        color: '#4A90E2',
        fontWeight: 'bold',
    },
});
