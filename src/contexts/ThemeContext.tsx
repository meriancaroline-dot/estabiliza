import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { darkTheme, lightTheme, Theme } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@estabiliza:theme';

// -----------------------------
// Tipos
// -----------------------------
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextData {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  toggleMode: () => Promise<void>;
}

// -----------------------------
// Criação do Contexto
// -----------------------------
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  // Listener do sistema (muda quando o usuário altera o modo no SO)
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  // Carrega preferências salvas
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setModeState(saved as ThemeMode);
      } catch (e) {
        console.error('Erro ao carregar tema:', e);
      }
    })();
  }, []);

  // Salva preferências ao mudar modo
  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch (e) {
      console.error('Erro ao salvar tema:', e);
    }
  };

  // Alterna entre claro/escuro mantendo "system" se for escolhido
  const toggleMode = async () => {
    const next: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'light' : 'system';
    await setMode(next);
  };

  // Determina se deve usar darkTheme
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && systemColorScheme === 'dark');

  // Seleciona o tema certo
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const value: ThemeContextData = {
    theme,
    mode,
    setMode,
    isDark,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// -----------------------------
// Hook
// -----------------------------
export function useTheme(): ThemeContextData {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return ctx;
}
