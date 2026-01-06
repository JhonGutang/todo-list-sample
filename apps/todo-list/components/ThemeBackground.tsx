import React from 'react';
import { View, ImageBackground, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
    overlayOpacity?: number; // For readability over images (overrides theme default if provided)
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({
    children,
    style,
    overlayOpacity,
}) => {
    const { theme } = useTheme();

    // Use provided overlayOpacity or theme's default, or 0.3 as fallback
    const effectiveOverlayOpacity = overlayOpacity ?? theme.backgroundOverlayOpacity ?? 0.3;

    if (theme.backgroundImage) {
        return (
            <ImageBackground
                source={theme.backgroundImage}
                style={[styles.container, style]}
                resizeMode="cover"
            >
                {/* Optional overlay for better text readability */}
                {effectiveOverlayOpacity > 0 && (
                    <View
                        style={[
                            styles.overlay,
                            { backgroundColor: theme.background, opacity: effectiveOverlayOpacity },
                        ]}
                    />
                )}
                {children}
            </ImageBackground>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});

