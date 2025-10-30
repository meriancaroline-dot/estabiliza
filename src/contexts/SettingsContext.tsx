import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@/hooks/useUser';
import { useAutoBackup } from '@/hooks/useAutoBackup';
import { AppSettings, ThemeMode } from '@/types/models';

const STORAGE_KEY = '@estabiliza:settings';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
interface SettingsContextData {
  settings: AppSettings;
  updateSettings: (data: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loading: boolean;
}

// -------------------------------------------------------------
// Contexto
// -------------------------------------------------------------
const SettingsContext = createContext<SettingsContextData | undefined>(undefined);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme, setThemeMode } = useTheme();
  const { user, patchUser } = useUser();
  const { backupEnabled, toggleAutoBackup } = useAutoBackup();

  const [settings, setSettings] = useState<AppSettings>({
    theme: theme.mode,
    notificationsEnabled: true,
    dailyReminderTime: '08:00',
    backupEnabled: backupEnabled,
    syncEnabled: true,
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar do AsyncStorage
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.warn('⚠️ Falha ao carregar configurações:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -----------------------------------------------------------
  // Salvar no AsyncStorage
  // -----------------------------------------------------------
  const persistSettings = useCallback(async (data: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
    }
  }, []);

  // -----------------------------------------------------------
  // Atualizar configurações
  // -----------------------------------------------------------
  const updateSettings = useCallback(
    async (data: Partial<AppSettings>) => {
      const updated = { ...settings, ...data };
      setSettings(updated);
      await persistSettings(updated);

      // Atualiza preferências do usuário
      if (user) {
        await patchUser({
          preferences: {
            ...user.preferences,
            themeMode: updated.theme ?? user.preferences.themeMode,
            notificationsEnabled:
              updated.notificationsEnabled ?? user.preferences.notificationsEnabled,
          },
        });
      }

      // Sincroniza com hooks
      if (data.theme) await setThemeMode(data.theme);
      if (data.backupEnabled !== undefined) await toggleAutoBackup();
    },
    [settings, persistSettings, user, patchUser, setThemeMode, toggleAutoBackup],
  );

  // -----------------------------------------------------------
  // Resetar configurações
  // -----------------------------------------------------------
  const resetSettings = useCallback(async () => {
    const defaults: AppSettings = {
      theme: 'system',
      notificationsEnabled: true,
      dailyReminderTime: '08:00',
      backupEnabled: false,
      syncEnabled: true,
    };
    setSettings(defaults);
    await persistSettings(defaults);
  }, [persistSettings]);

  // -----------------------------------------------------------
  // Alternar tema
  // -----------------------------------------------------------
  const toggleThemeMode = useCallback(async () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: next });
  }, [settings, updateSettings]);

  const handleSetTheme = useCallback(
    async (mode: ThemeMode) => {
      await updateSettings({ theme: mode });
    },
    [updateSettings],
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      toggleThemeMode,
      setThemeMode: handleSetTheme,
      loading,
    }),
    [settings, loading, updateSettings, resetSettings, toggleThemeMode, handleSetTheme],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// -------------------------------------------------------------
// Hook
// -------------------------------------------------------------
export function useSettings(): SettingsContextData {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  return ctx;
}
