import { useColorScheme } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { lightTheme, darkTheme, Theme } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
type ThemeMode = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// -------------------------------------------------------------
// Constantes
// -------------------------------------------------------------
const STORAGE_KEY = 'app_theme_mode';

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useTheme(): UseThemeReturn {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>('system');

  // -----------------------------------------------------------
  // Carrega a preferência salva
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setMode(stored);
        }
      } catch (e) {
        console.warn('⚠️ Falha ao carregar tema salvo:', e);
      }
    })();
  }, []);

  // -----------------------------------------------------------
  // Define o tema atual
  // -----------------------------------------------------------
  const currentTheme = useMemo<Theme>(() => {
    const resolvedMode = mode === 'system' ? systemScheme ?? 'light' : mode;
    return resolvedMode === 'dark' ? darkTheme : lightTheme;
  }, [mode, systemScheme]);

  const isDark = currentTheme.mode === 'dark';

  // -----------------------------------------------------------
  // Salvar tema no storage
  // -----------------------------------------------------------
  const setThemeMode = useCallback(async (newMode: ThemeMode) => {
    try {
      setMode(newMode);
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      console.log(`🎨 Tema atualizado para: ${newMode}`);
    } catch (e) {
      console.error('Erro ao salvar tema:', e);
    }
  }, []);

  // -----------------------------------------------------------
  // Alternar entre claro e escuro
  // -----------------------------------------------------------
  const toggleTheme = useCallback(async () => {
    const resolvedMode = mode === 'system' ? systemScheme ?? 'light' : mode;
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [mode, systemScheme, setThemeMode]);

  return {
    theme: currentTheme,
    mode,
    isDark,
    setThemeMode,
    toggleTheme,
  };
}
