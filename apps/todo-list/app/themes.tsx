import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Themes } from "@/constants/Colors";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

type ThemeType = 'light' | 'dark' | 'lantern-night';

interface ThemeCardProps {
    type: ThemeType;
    label: string;
    emoji?: string;
    isActive: boolean;
    onPress: () => void;
}

export default function ThemesScreen() {
    const { theme, themeType, setTheme } = useTheme();

    const themes: Array<{ type: ThemeType; label: string; emoji?: string }> = [
        { type: 'light', label: 'Light Mode' },
        { type: 'dark', label: 'Dark Mode' },
        { type: 'lantern-night', label: 'Lantern Night', emoji: '🏮' },
    ];

    const ThemeCard: React.FC<ThemeCardProps> = ({ type, label, emoji, isActive, onPress }) => {
        const themeColors = Themes[type];
        const hasBackgroundImage = 'backgroundImage' in themeColors && themeColors.backgroundImage;

        return (
            <TouchableOpacity
                style={[
                    styles.themeCard,
                    {
                        width: CARD_WIDTH,
                        borderColor: isActive ? theme.primary : theme.border,
                        borderWidth: isActive ? 2 : 1,
                    }
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {/* Theme Preview */}
                <View style={[
                    styles.themePreview,
                    { backgroundColor: themeColors.background }
                ]}>
                    {hasBackgroundImage && 'backgroundImage' in themeColors && (
                        <>
                            <Image
                                source={themeColors.backgroundImage}
                                style={styles.backgroundImage}
                                resizeMode="cover"
                            />
                            {/* Overlay for better visibility */}
                            <View style={[
                                styles.backgroundOverlay,
                                { 
                                    backgroundColor: 'rgba(0, 0, 0, ' + 
                                        (('backgroundOverlayOpacity' in themeColors ? themeColors.backgroundOverlayOpacity : 0.3) || 0.3) + 
                                        ')' 
                                }
                            ]} />
                        </>
                    )}
                    
                    {/* Preview Content */}
                    <View style={styles.previewContent}>
                        {emoji && (
                            <Text style={styles.themeEmoji}>{emoji}</Text>
                        )}
                        {!emoji && (
                            <Ionicons
                                name={type === 'light' ? 'sunny' : 'moon'}
                                size={32}
                                color={themeColors.primary}
                            />
                        )}
                    </View>

                    {/* Active Badge */}
                    {isActive && (
                        <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                            <Ionicons name="checkmark" size={16} color={theme.white} />
                        </View>
                    )}
                </View>

                {/* Theme Label */}
                <View style={[styles.labelContainer, { backgroundColor: theme.cardBg }]}>
                    <Text style={[styles.themeLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                        {label}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: "transparent" }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Themes</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Themes Grid */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.grid}>
                    {themes.map((themeItem) => (
                        <ThemeCard
                            key={themeItem.type}
                            type={themeItem.type}
                            label={themeItem.label}
                            emoji={themeItem.emoji}
                            isActive={themeType === themeItem.type}
                            onPress={() => setTheme(themeItem.type)}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    themeCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 0,
    },
    themePreview: {
        width: '100%',
        height: CARD_WIDTH,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    backgroundOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    previewContent: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    themeEmoji: {
        fontSize: 48,
    },
    activeBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    labelContainer: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    themeLabel: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
