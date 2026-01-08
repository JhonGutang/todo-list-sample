import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Themes, ThemeColors } from '../constants/Colors';
import { getSetting, setSetting } from '../services/settings';

type ThemeType = 'light' | 'dark' | 'lantern-night';

interface ThemeContextType {
    theme: ThemeColors;
    themeType: ThemeType;
    setTheme: (type: ThemeType) => Promise<void>;
    isDark: boolean;
    themeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>('light');
    const [themeLoaded, setThemeLoaded] = useState(false);

    useEffect(() => {
        // Load theme from settings
        const loadTheme = async () => {
            try {
                const storedTheme = await getSetting('theme');
                if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'lantern-night') {
                    setThemeType(storedTheme as ThemeType);
                } else if (systemColorScheme) {
                    setThemeType(systemColorScheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setThemeLoaded(true);
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
    const isDark = themeType === 'dark' || themeType === 'lantern-night';

    return (
        <ThemeContext.Provider value={{ theme, themeType, setTheme: handleSetTheme, isDark, themeLoaded }}>
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
