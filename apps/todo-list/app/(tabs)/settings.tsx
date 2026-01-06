import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { resetDatabase } from "@/services";

export default function SettingsPage() {
    const { theme, themeType, setTheme, isDark } = useTheme();
    const [isResetting, setIsResetting] = useState(false);

    const handleResetDatabase = () => {
        Alert.alert(
            "Reset Database",
            "This will clear all tasks, subtasks, tags, and settings. Default categories will be restored. This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        setIsResetting(true);
                        try {
                            await resetDatabase(false);
                            Alert.alert("Success", "Database has been reset successfully.");
                        } catch (error) {
                            console.error("Failed to reset database:", error);
                            Alert.alert("Error", "Failed to reset database. Please try again.");
                        } finally {
                            setIsResetting(false);
                        }
                    }
                }
            ]
        );
    };

    const ThemeOption = ({ type, icon, label, isEmoji = false }: { type: 'light' | 'dark' | 'lantern-night', icon: any, label: string, isEmoji?: boolean }) => {
        const isActive = themeType === type;
        return (
            <TouchableOpacity
                style={[
                    styles.themeOption,
                    {
                        backgroundColor: isActive ? theme.primary : theme.cardBg,
                        borderColor: theme.border,
                        borderRadius: 16,
                    },
                    isActive && styles.themeOptionActive
                ]}
                onPress={() => setTheme(type)}
                activeOpacity={0.7}
            >
                {isEmoji ? (
                    <Text style={{ fontSize: 24, width: 24, textAlign: 'center' }}>{icon}</Text>
                ) : (
                    <Ionicons
                        name={icon}
                        size={24}
                        color={isActive ? theme.white : theme.textSecondary}
                    />
                )}
                <Text style={[
                    styles.themeLabel,
                    { color: isActive ? theme.white : theme.textPrimary }
                ]}>
                    {label}
                </Text>
                {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.white} style={styles.checkIcon} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
                    <View style={styles.themeContainer}>
                        <ThemeOption type="light" icon="sunny-outline" label="Light Mode" />
                        <ThemeOption type="dark" icon="moon-outline" label="Dark Mode" />
                        <ThemeOption type="lantern-night" icon="🌙" label="Lantern Night" isEmoji />
                    </View>
                </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DEVELOPER</Text>
                <TouchableOpacity
                    style={[
                        styles.resetButton,
                        {
                            backgroundColor: theme.cardBg,
                            borderColor: theme.border,
                            borderRadius: 16,
                        }
                    ]}
                    onPress={handleResetDatabase}
                    disabled={isResetting}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={20}
                        color={theme.priorityHigh}
                    />
                    <Text style={[styles.resetButtonText, { color: theme.priorityHigh }]}>
                        {isResetting ? 'Resetting...' : 'Reset Database'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
                <View style={[
                    styles.aboutCard,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderRadius: 16,
                        borderWidth: 1,
                    }
                ]}>
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutText, { color: theme.textPrimary }]}>Version</Text>
                        <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>1.0.0</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border, opacity: 1 }]} />
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutText, { color: theme.textPrimary }]}>Developed with</Text>
                        <Text style={[styles.aboutValue, { color: theme.primary }]}>JBG Dev</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    themeContainer: {
        gap: 12,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        position: 'relative',
    },
    themeOptionActive: {
        borderWidth: 0,
    },
    themeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    checkIcon: {
        position: 'absolute',
        right: 16,
    },
    aboutCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    aboutText: {
        fontSize: 16,
        fontWeight: '500',
    },
    aboutValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
