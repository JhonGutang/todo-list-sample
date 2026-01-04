import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Category } from '@todolist/shared-types';

type Props = {
    visible: boolean;
    onClose: () => void;
    onCreate: (category: Category) => void;
};

export default function CreateCategoryModal({ visible, onClose, onCreate }: Props) {
    const [name, setName] = useState('');
    const [isMounted, setIsMounted] = useState(visible);
    const anim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            setIsMounted(true);
            Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(anim, {
                toValue: 0,
                duration: 220,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(() => {
                setIsMounted(false);
            });
        }
    }, [visible, anim]);

    const reset = () => {
        setName('');
    };

    const handleCreate = () => {
        if (!name.trim()) return;
        const now = new Date().toISOString();
        const category: Partial<Category> = {
            name: name.trim(),
            color: '#10b981', // Default green color
            isDefault: false,
            createdAt: now,
        };

        onCreate(category as Category);
        reset();
        onClose();
    };

    if (!isMounted) return null;

    const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

    return (
        <Modal visible={isMounted} transparent animationType="none">
            <View style={styles.absoluteFill} pointerEvents="box-none">
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

                <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]} pointerEvents="box-none">
                    <View style={styles.content}>
                        <Text style={styles.title}>Create Category</Text>

                        <Text style={styles.label}>Category Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder="e.g., Fitness, Shopping"
                            autoFocus
                        />

                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancel]}
                                onPress={() => {
                                    reset();
                                    onClose();
                                }}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.create]} onPress={handleCreate}>
                                <Text style={styles.createText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    absoluteFill: { ...StyleSheet.absoluteFillObject },
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    content: { padding: 20 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    label: { fontSize: 13, marginBottom: 6, color: '#555' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 16 },
    actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    actionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
    cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ddd' },
    create: { backgroundColor: '#007bff' },
    cancelText: { color: '#333', fontWeight: '600' },
    createText: { color: '#fff', fontWeight: '700' },
});
