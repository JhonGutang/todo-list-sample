import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Themes, ThemeColors } from '../constants/Colors';
import { getSetting, setSetting } from '../services/settings';

type ThemeType = 'light' | 'dark' | 'cinnamoroll';

interface ThemeContextType {
    theme: ThemeColors;
    themeType: ThemeType;
    setTheme: (type: ThemeType) => Promise<void>;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>('light');

    useEffect(() => {
        // Load theme from settings
        const loadTheme = async () => {
            try {
                const storedTheme = await getSetting('theme');
                if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'cinnamoroll') {
                    setThemeType(storedTheme as ThemeType);
                } else if (systemColorScheme) {
                    setThemeType(systemColorScheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };

        loadTheme();
    }, [systemColorScheme]);

    const handleSetTheme = async (type: ThemeType) => {
        setThemeType(type);
        try {
            await setSetting('theme', type);
        } catch (error) {
            console.error('Failed to save theme setting:', error);
        }
    };

    const theme = Themes[themeType];
    const isDark = themeType === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, themeType, setTheme: handleSetTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
