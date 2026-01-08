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
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useWindowDimensions } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: DimensionValue; // number | percentage
    useKeyboardAvoidingView?: boolean;
};



/**
 * Resolve maxHeight ONCE into a fixed height
 */
function resolveHeight(maxHeight: DimensionValue | undefined, windowHeight: number): number {
    if (!maxHeight) return windowHeight * 0.85;

    if (typeof maxHeight === 'number') {
        return maxHeight;
    }

    if (typeof maxHeight === 'string' && maxHeight.endsWith('%')) {
        const percent = parseFloat(maxHeight) / 100;
        return windowHeight * percent;
    }

    return windowHeight * 0.85;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

export default function ModalBase({
    visible,
    onClose,
    children,
    maxHeight = '85%',
    useKeyboardAvoidingView = false,
}: Props) {
    const { height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const anim = useRef(new Animated.Value(0)).current;
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(visible);

    // 🔒 Fixed height resolved only when opening
    const [sheetHeight, setSheetHeight] = useState<number>(() =>
        resolveHeight(maxHeight, windowHeight)
    );

    useEffect(() => {
        if (visible) {
            setSheetHeight(resolveHeight(maxHeight, windowHeight));
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
    }, [visible, maxHeight, anim, windowHeight]);

    if (!isMounted) return null;

    const backdropOpacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
    });

    // ✅ CONSTANT outputRange using Screen Height → no stutter even if window shrinks
    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [SCREEN_HEIGHT, 0],
    });

    const InnerContent = (
        <View style={styles.absoluteFill} pointerEvents="box-none">
            {/* Backdrop */}
            <TouchableOpacity
                style={styles.absoluteFill}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[styles.backdrop, { opacity: backdropOpacity }]}
                />
            </TouchableOpacity>

            {/* Bottom Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        height: sheetHeight, // 🔒 FIXED HEIGHT
                        transform: [{ translateY }],
                        backgroundColor: theme.modalBg || theme.cardBg,
                        borderTopLeftRadius: theme.cardRadius,
                        borderTopRightRadius: theme.cardRadius,
                        paddingBottom: insets.bottom,
                    },
                ]}
            >
                {children}
            </Animated.View>
        </View>
    );

    return (
        <Modal
            visible={isMounted}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            {useKeyboardAvoidingView ? (
                <KeyboardAvoidingView
                    style={styles.absoluteFill}
                    // 🚨 CRITICAL: prevents shrink + avoids stutter
                    behavior={Platform.OS === 'ios' ? 'position' : undefined}
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
    safeArea: {
        flex: 1,
    },
});
