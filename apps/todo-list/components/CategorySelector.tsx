import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Category } from '@todolist/shared-types';
import CreateCategoryModal from './CreateCategoryModal';

type Props = {
    categories: Category[];
    selectedCategoryId?: string | null;
    onSelect: (categoryId: string) => void;
    onCategoryCreated: (category: Category) => void | Promise<void>;
    visible: boolean;
    onClose: () => void;
};

export default function CategorySelector({
    categories,
    selectedCategoryId,
    onSelect,
    onCategoryCreated,
    visible,
    onClose,
}: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleSelectCategory = (categoryId: string) => {
        onSelect(categoryId);
        onClose();
    };

    const handleCreateCategory = async (category: Category) => {
        await onCategoryCreated(category);
        setShowCreateModal(false);
        onClose(); // Close the category selector after creating a category
    };

    if (!visible) return null;

    // Filter out the "Completed" category from the selector
    const selectableCategories = categories.filter(cat => cat.id !== 'cat_completed');

    return (
        <>
            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.dropdown}>
                            <ScrollView style={styles.scrollView}>
                                {selectableCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.item, selectedCategoryId === cat.id && styles.itemSelected]}
                                        onPress={() => handleSelectCategory(cat.id)}
                                    >
                                        <View style={[styles.colorDot, { backgroundColor: cat.color || '#999' }]} />
                                        <Text style={styles.itemText}>{cat.name}</Text>
                                        {selectedCategoryId === cat.id && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                ))}

                                <View style={styles.divider} />

                                <TouchableOpacity
                                    style={styles.createItem}
                                    onPress={() => {
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <Text style={styles.createText}>+ Create New Category</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <CreateCategoryModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateCategory}
            />
        </>
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
        maxHeight: 400,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    scrollView: {
        maxHeight: 400,
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
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 4,
    },
    createItem: {
        padding: 14,
    },
    createText: {
        fontSize: 15,
        color: '#007bff',
        fontWeight: '600',
    },
});
