import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '@todolist/shared-types';
import ModalBase from '../ModalBase';

type Props = {
    categories: Category[];
    selectedCategoryId?: string | null;
    onSelect: (categoryId: string) => void;
    visible: boolean;
    onClose: () => void;
};

export default function CategorySelector({
    categories,
    selectedCategoryId,
    onSelect,
    visible,
    onClose,
}: Props) {
    const handleSelectCategory = (categoryId: string) => {
        onSelect(categoryId);
        onClose();
    };

    const CATEGORY_ORDER = ['cat_personal', 'cat_work', 'cat_projects', 'cat_habit', 'cat_others'];

    const selectableCategories = categories
        .filter(cat => cat.id !== 'cat_completed')
        .sort((a, b) => {
            const idxA = CATEGORY_ORDER.indexOf(a.id);
            const idxB = CATEGORY_ORDER.indexOf(b.id);
            return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });

    return (
        <ModalBase visible={visible} onClose={onClose}>
            <View style={[styles.content, { paddingBottom: 20 }]}>
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
            </View>
        </ModalBase>
    );
}

const styles = StyleSheet.create({
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,1)', // Actual opacity is handled by Animated.View
    },
    dropdownContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        justifyContent: 'flex-end',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    content: {
        paddingHorizontal: 32,
        paddingTop: 15,
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
