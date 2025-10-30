import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export type ThemeMode = 'light' | 'dark' | 'system';

type Palette = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  border: string;
  muted?: string;
  neutral: Record<number, string>;
};

export type Theme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  borderRadius: { sm: number; md: number; lg: number; xl: number };
};

// -------------------------------------------------------------
// Paletas
// -------------------------------------------------------------
const lightColors: Palette = {
  primary: '#6C5CE7',
  secondary: '#00BCD4',
  success: '#2ecc71',
  warning: '#f1c40f',
  danger: '#e74c3c',
  text: '#1f2937',
  textSecondary: '#6b7280',
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e5e7eb',
  muted: '#a1a1aa',
  neutral: { 500: '#9ca3af' },
};

const darkColors: Palette = {
  primary: '#8B7BFF',
  secondary: '#00D1E6',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#ff6b6b',
  text: '#e5e7eb',
  textSecondary: '#9ca3af',
  background: '#0b1220',
  surface: '#111827',
  border: '#1f2937',
  muted: '#6b7280',
  neutral: { 500: '#6b7280' },
};

// -------------------------------------------------------------
// Contexto
// -------------------------------------------------------------
type Ctx = {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  setThemeMode: (m: ThemeMode) => Promise<void>;
};

const ThemeCtx = createContext<Ctx | null>(null);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('app_theme_mode');
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setMode(saved);
        }
      } catch (err) {
        console.error('Erro ao carregar tema salvo:', err);
      }
    })();
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') return sys === 'dark';
    return mode === 'dark';
  }, [mode, sys]);

  const theme: Theme = useMemo(
    () => ({
      mode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
      borderRadius: { sm: 6, md: 10, lg: 14, xl: 22 },
    }),
    [isDark, mode]
  );

  const setThemeMode = async (m: ThemeMode) => {
    try {
      setMode(m);
      await AsyncStorage.setItem('app_theme_mode', m);
    } catch (err) {
      console.error('Erro ao salvar tema:', err);
    }
  };

  const value: Ctx = { theme, isDark, mode, setThemeMode };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

// -------------------------------------------------------------
// Hook
// -------------------------------------------------------------
export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
