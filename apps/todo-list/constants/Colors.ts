// Momentum Design System Themes
export type ThemeColors = {
    white: string;
    background: string;
    backgroundImage?: any; // React Native ImageSourcePropType
    backgroundOverlayOpacity?: number; // For readability over background images (default: 0.3)
    primary: string;
    primaryLight: string;
    primaryAccent: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    priorityHigh: string;
    priorityMedium: string;
    priorityLow: string;
    success: string;
    cardBg: string;
    cardBgCompleted: string;
    glassBg: string;
    // Theme-specific UI properties
    cardRadius: number;
    cardBorderWidth: number;
    shadowColor: string;
    headerBg: string;
    progressBarFill: string;
    progressBarTrack: string;
    tabBarBg: string; // Tab bar background color
};

export const Themes = {
    light: {
        white: '#FFFFFF',
        background: '#FFFFFF',
        primary: '#1E3A8A',
        primaryLight: '#2563EB',
        primaryAccent: '#2563EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        border: '#E5E7EB',
        priorityHigh: '#EF4444',
        priorityMedium: '#F59E0B',
        priorityLow: '#10B981',
        success: '#10B981',
        cardBg: '#FFFFFF',
        cardBgCompleted: '#F3F4F6',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        cardRadius: 16,
        cardBorderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        headerBg: '#1E3A8A',
        progressBarFill: '#10B981',
        progressBarTrack: 'rgba(255, 255, 255, 0.2)',
        tabBarBg: 'rgba(255, 255, 255, 0.85)',
    },
    dark: {
        white: '#FFFFFF',
        background: '#0F172A',
        primary: '#3B82F6',
        primaryLight: '#60A5FA',
        primaryAccent: '#3B82F6',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        textTertiary: '#64748B',
        border: '#1E293B',
        priorityHigh: '#F87171',
        priorityMedium: '#FBBF24',
        priorityLow: '#34D399',
        success: '#34D399',
        cardBg: '#1E293B',
        cardBgCompleted: '#0F172A',
        glassBg: 'rgba(15, 23, 42, 0.8)',
        cardRadius: 16,
        cardBorderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        headerBg: '#1E293B',
        progressBarFill: '#34D399',
        progressBarTrack: 'rgba(255, 255, 255, 0.1)',
        tabBarBg: 'rgba(15, 23, 42, 0.9)',
    },
    'lantern-night': {
        white: '#FFFFFF',
        background: '#1A1B2E', // Deep Navy - fallback color
        backgroundImage: require('../assets/themes-bg/lantern-theme.jpg'),
        backgroundOverlayOpacity: 0.5, // Darker overlay for better readability
        primary: '#FFD54F', // Gold/Amber
        primaryLight: '#FFB74D', // Soft Orange
        primaryAccent: '#FFD54F',
        textPrimary: '#FFFFFF',
        textSecondary: '#B0B3C6',
        textTertiary: '#64748B',
        border: 'rgba(255, 255, 255, 0.1)',
        priorityHigh: '#BA68C8', // Personal (Light Purple)
        priorityMedium: '#64B5F6', // Work (Light Blue)
        priorityLow: '#81C784', // Habit (Soft Green)
        success: '#81C784',
        cardBg: 'rgba(28, 28, 46, 0.75)', // Glassmorphism
        cardBgCompleted: 'rgba(28, 28, 46, 0.5)',
        glassBg: 'rgba(28, 28, 46, 0.8)',
        cardRadius: 16,
        cardBorderWidth: 1,
        shadowColor: '#FFAB00', // Glow effect
        headerBg: 'rgba(28, 28, 46, 0.75)',
        progressBarFill: '#FFD54F',
        progressBarTrack: 'rgba(255, 255, 255, 0.1)',
        tabBarBg: 'rgba(0, 0, 0, 0.3)',
    }
};

// Legacy support - default to light theme
export const Colors = Themes.light;

export default Themes;

