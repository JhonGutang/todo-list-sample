import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsPage() {
    const { theme, themeType, setTheme, isDark } = useTheme();

    const ThemeOption = ({ type, icon, label, isEmoji = false }: { type: 'light' | 'dark' | 'cinnamoroll', icon: any, label: string, isEmoji?: boolean }) => {
        const isActive = themeType === type;
        return (
            <TouchableOpacity
                style={[
                    styles.themeOption,
                    {
                        backgroundColor: isActive ? theme.primary : theme.cardBg,
                        borderColor: theme.border,
                        borderRadius: themeType === 'cinnamoroll' ? 15 : 16,
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
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
                <View style={styles.themeContainer}>
                    <ThemeOption type="light" icon="sunny-outline" label="Light Mode" />
                    <ThemeOption type="dark" icon="moon-outline" label="Dark Mode" />
                    <ThemeOption type="cinnamoroll" icon="☁️" label="Cinnamoroll" isEmoji />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
                <View style={[
                    styles.aboutCard,
                    {
                        backgroundColor: theme.cardBg,
                        borderColor: themeType === 'cinnamoroll' ? 'transparent' : theme.border,
                        borderRadius: themeType === 'cinnamoroll' ? 15 : 16,
                        borderWidth: themeType === 'cinnamoroll' ? 0 : 1,
                    }
                ]}>
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutText, { color: theme.textPrimary }]}>Version</Text>
                        <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>1.0.0</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border, opacity: themeType === 'cinnamoroll' ? 0.3 : 1 }]} />
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
    }
});
