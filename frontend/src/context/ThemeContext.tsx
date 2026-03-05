import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
    logoUrl: string | null;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Helper to adjust hex color lightness for generating shades
const adjustColor = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.trunc(R * (100 + percent) / 100);
    G = Math.trunc(G * (100 + percent) / 100);
    B = Math.trunc(B * (100 + percent) / 100);

    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
    const [isDark, setIsDark] = useState(false);
    const [primaryColor, setPrimaryColor] = useState<string>('#4f46e5'); // Default Indigo-600
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // Fetch Global Settings for Branding
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Public endpoint or handle unauth gracefully here since this wraps App
                const response = await api.get('/admin/settings');
                if (response.data?.success) {
                    const settings = response.data.data;
                    if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
                    if (settings.logoUrl) setLogoUrl(settings.logoUrl);
                }
            } catch (error) {
                console.warn('Failed to fetch branding settings, using defaults.', error);
            }
        };
        fetchSettings();
    }, []);

    // Inject CSS Variables for the selected Primary Color
    useEffect(() => {
        const root = document.documentElement;

        // Tailwind shade approximations relative to the base (600) color
        root.style.setProperty('--color-brand-50', adjustColor(primaryColor, 80));
        root.style.setProperty('--color-brand-100', adjustColor(primaryColor, 60));
        root.style.setProperty('--color-brand-200', adjustColor(primaryColor, 40));
        root.style.setProperty('--color-brand-300', adjustColor(primaryColor, 20));
        root.style.setProperty('--color-brand-400', adjustColor(primaryColor, 10));
        root.style.setProperty('--color-brand-500', adjustColor(primaryColor, 5));
        root.style.setProperty('--color-brand-600', primaryColor); // Base
        root.style.setProperty('--color-brand-700', adjustColor(primaryColor, -15));
        root.style.setProperty('--color-brand-800', adjustColor(primaryColor, -30));
        root.style.setProperty('--color-brand-900', adjustColor(primaryColor, -45));
    }, [primaryColor]);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            setIsDark(systemTheme === 'dark');
        } else {
            root.classList.add(theme);
            setIsDark(theme === 'dark');
        }

        if (theme !== 'system') {
            localStorage.setItem('theme', theme);
        } else {
            localStorage.removeItem('theme');
        }

    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            const newTheme = e.matches ? 'dark' : 'light';
            root.classList.add(newTheme);
            setIsDark(newTheme === 'dark');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark, logoUrl }}>
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
