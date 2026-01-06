import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    DimensionValue,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: DimensionValue;
    useKeyboardAvoidingView?: boolean;
};

export default function ModalBase({
    visible,
    onClose,
    children,
    maxHeight = '85%',
    useKeyboardAvoidingView = false,
}: Props) {
    const [isMounted, setIsMounted] = useState(visible);
    const anim = useRef(new Animated.Value(0)).current;
    const { theme } = useTheme();

    useEffect(() => {
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

    if (!isMounted) return null;

    const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

    const InnerContent = (
        <View style={styles.absoluteFill} pointerEvents="box-none">
            <TouchableOpacity
                style={styles.absoluteFill}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                        maxHeight,
                        backgroundColor: theme.cardBg,
                        borderTopLeftRadius: theme.cardRadius,
                        borderTopRightRadius: theme.cardRadius,
                    }
                ]}
            >
                <SafeAreaView edges={['bottom']}>
                    {children}
                </SafeAreaView>
            </Animated.View>
        </View>
    );

    return (
        <Modal visible={isMounted} transparent animationType="none">
            {useKeyboardAvoidingView ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.absoluteFill}
                >
                    {InnerContent}
                </KeyboardAvoidingView>
            ) : (
                InnerContent
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
});
