import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// -----------------------------
// Tipos
// -----------------------------
export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailyReminderTime?: string; // ex: "08:00"
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
}

interface UserContextData {
  user: User | null;
  loading: boolean;
  error: string | null;

  login: (email: string, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
}

const STORAGE_KEY = '@estabiliza:user';
const UserContext = createContext<UserContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Função auxiliar para salvar no storage
  // -----------------------------
  const persistUser = useCallback(async (data: User | null) => {
    try {
      if (data) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Erro ao persistir usuário:', e);
    }
  }, []);

  // -----------------------------
  // Carrega do AsyncStorage
  // -----------------------------
  const refreshUser = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
      setError('Falha ao carregar dados do usuário.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // -----------------------------
  // Login simulado (pode virar backend depois)
  // -----------------------------
  const login = useCallback(
    async (email: string, name?: string): Promise<User> => {
      try {
        setLoading(true);
        if (!email || !email.includes('@')) throw new Error('E-mail inválido.');

        const existing = user;
        if (existing && existing.email === email) {
          return existing; // já logado
        }

        const newUser: User = {
          id: `usr_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
          name: (name ?? email.split('@')[0]) as string,

          email: email.toLowerCase(),
          avatar: undefined,
          preferences: {
            themeMode: 'system',
            notificationsEnabled: true,
          },
          createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        await persistUser(newUser);
        return newUser;
      } catch (e) {
        console.error('Erro no login:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao realizar login.';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [persistUser, user],
  );

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setUser(null);
      await persistUser(null);
    } catch (e) {
      console.error('Erro ao sair:', e);
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    } finally {
      setLoading(false);
    }
  }, [persistUser]);

  // -----------------------------
  // Atualiza dados do usuário
  // -----------------------------
  const updateUser = useCallback(
    async (data: Partial<User>) => {
      try {
        if (!user) throw new Error('Usuário não autenticado.');
        const updated: User = { ...user, ...data };
        setUser(updated);
        await persistUser(updated);
      } catch (e) {
        console.error('Erro ao atualizar usuário:', e);
        setError('Falha ao atualizar usuário.');
      }
    },
    [user, persistUser],
  );

  // -----------------------------
  // Atualiza preferências do usuário
  // -----------------------------
  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      try {
        if (!user) throw new Error('Usuário não autenticado.');
        const updated: User = {
          ...user,
          preferences: { ...user.preferences, ...prefs },
        };
        setUser(updated);
        await persistUser(updated);
      } catch (e) {
        console.error('Erro ao atualizar preferências:', e);
        setError('Falha ao atualizar preferências.');
      }
    },
    [user, persistUser],
  );

  // -----------------------------
  // Valores exportados
  // -----------------------------
  const value = useMemo<UserContextData>(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      updateUser,
      updatePreferences,
      isLoggedIn: !!user,
      refreshUser,
    }),
    [user, loading, error, login, logout, updateUser, updatePreferences, refreshUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// -----------------------------
// Hook
// -----------------------------
export function useUser(): UserContextData {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser deve ser usado dentro de UserProvider');
  return ctx;
}
