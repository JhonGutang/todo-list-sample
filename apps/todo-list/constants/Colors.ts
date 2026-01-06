// Momentum Design System Themes
export type ThemeColors = {
    white: string;
    background: string;
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
    },
    cinnamoroll: {
        white: '#FFFFFF',
        background: '#E0F4FF',
        primary: '#89CFF0',
        primaryLight: '#B0E2FF',
        primaryAccent: '#89CFF0',
        textPrimary: '#4A5D75',
        textSecondary: '#8FA3B8',
        textTertiary: '#B0C4DE',
        border: '#EEDC9A',
        priorityHigh: '#DDA0DD',
        priorityMedium: '#ADD8E6',
        priorityLow: '#98FB98',
        success: '#98FB98',
        cardBg: '#FFFFFF',
        cardBgCompleted: '#F0F8FF',
        glassBg: 'rgba(255, 255, 255, 0.8)',
        cardRadius: 20,
        cardBorderWidth: 1.5,
        shadowColor: 'rgba(137, 207, 240, 0.25)',
        headerBg: '#89CFF0',
        progressBarFill: '#FDFD96',
        progressBarTrack: 'rgba(255, 255, 255, 0.3)',
    }
};

// Legacy support - default to light theme
export const Colors = Themes.light;

export default Themes;

