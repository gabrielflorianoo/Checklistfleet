import { ThemeContext } from '@/context/ThemeContext';
import { useContext } from 'react';

export interface UseThemeReturn {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    isDark: boolean;
}

export const useTheme = (): UseThemeReturn => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme deve ser usado dentro de ThemeProvider');
    }

    const { theme, toggleTheme, setTheme } = context;

    return {
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === 'dark',
    };
};
