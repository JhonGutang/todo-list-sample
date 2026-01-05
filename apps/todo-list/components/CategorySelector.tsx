import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();

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
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                            >
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
        minHeight: 300,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
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
    divider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: 8,
    },
    createItem: {
        paddingTop: 16,
    },
    createText: {
        fontSize: 16,
        color: '#4A90E2',
        fontWeight: '600',
    },
});
