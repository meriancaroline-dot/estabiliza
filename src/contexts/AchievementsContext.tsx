import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// -----------------------------
// Tipos (alinha com Fase 2)
// -----------------------------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;        // 0 a 100
  unlockedAt?: string;     // ISO quando desbloqueou
  userId: string;
}

interface AchievementsContextData {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  addAchievement: (data: Omit<Achievement, 'id' | 'unlockedAt'>) => Promise<Achievement>;
  updateAchievement: (id: string, data: Partial<Omit<Achievement, 'id'>>) => Promise<Achievement>;
  deleteAchievement: (id: string) => Promise<void>;

  // Progresso
  setProgress: (id: string, progress: number) => Promise<Achievement>;
  incrementProgress: (id: string, delta: number) => Promise<Achievement>;
  getProgressFor: (id: string) => number;

  // Desbloqueio
  unlockAchievement: (id: string, dateISO?: string) => Promise<Achievement>;
  lockAchievement: (id: string) => Promise<Achievement>;

  // Consultas
  getUnlocked: () => Achievement[];
  getLocked: () => Achievement[];
  getRecentlyUnlocked: (days: number) => Achievement[];

  refreshFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@estabiliza:achievements';

const AchievementsContext = createContext<AchievementsContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const AchievementsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // -----------------------------
  // Helpers
  // -----------------------------
  const clamp = (n: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, n));

  const persist = useCallback(async (list: Achievement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar conquistas:', e);
      setError('Falha ao salvar conquistas.');
    }
  }, []);

  const sortList = useCallback((list: Achievement[]) => {
    // 1) desbloqueadas por mais recentes; 2) depois as bloqueadas por título
    const unlocked = list
      .filter((a) => Boolean(a.unlockedAt))
      .sort((a, b) => dayjs(b.unlockedAt!).valueOf() - dayjs(a.unlockedAt!).valueOf());
    const locked = list
      .filter((a) => !a.unlockedAt)
      .sort((a, b) => a.title.localeCompare(b.title));
    return [...unlocked, ...locked];
  }, []);

  const loadFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Achievement[] = raw ? JSON.parse(raw) : [];
      setAchievements(sortList(parsed));
    } catch (e) {
      console.error('Erro ao carregar conquistas:', e);
      setError('Falha ao carregar conquistas.');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [sortList]);

  useEffect(() => {
    dayjs.locale('pt-br');
    loadFromStorage();
  }, [loadFromStorage]);

  // -----------------------------
  // CRUD
  // -----------------------------
  const addAchievement = useCallback(
    async (data: Omit<Achievement, 'id' | 'unlockedAt'>): Promise<Achievement> => {
      try {
        if (!data.title?.trim()) throw new Error('Título é obrigatório.');
        if (!data.description?.trim()) throw new Error('Descrição é obrigatória.');
        if (!data.icon?.trim()) throw new Error('Ícone é obrigatório.');
        if (!data.userId?.trim()) throw new Error('userId é obrigatório.');

        const newItem: Achievement = {
          ...data,
          id: `ach_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
          progress: clamp(data.progress, 0, 100),
          unlockedAt: data.progress >= 100 ? new Date().toISOString() : undefined,
        };

        const next = sortList([...achievements, newItem]);
        setAchievements(next);
        await persist(next);
        return newItem;
      } catch (e) {
        console.error('Erro ao adicionar conquista:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao adicionar conquista.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [achievements, persist, sortList],
  );

  const updateAchievement = useCallback(
    async (id: string, data: Partial<Omit<Achievement, 'id'>>): Promise<Achievement> => {
      try {
        const idx = achievements.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error('Conquista não encontrada.');
        const original = achievements[idx]!;

        const nextProgress =
          data.progress !== undefined ? clamp(data.progress, 0, 100) : original.progress;

        const updated: Achievement = {
          ...original,
          ...data,
          progress: nextProgress,
          // se bater 100% e não estava desbloqueada, marca unlockedAt agora
          unlockedAt:
            data.unlockedAt !== undefined
              ? data.unlockedAt
              : nextProgress >= 100
              ? original.unlockedAt ?? new Date().toISOString()
              : original.unlockedAt,
        };

        const list = achievements.map((a) => (a.id === id ? updated : a));
        const sorted = sortList(list);
        setAchievements(sorted);
        await persist(sorted);
        return updated;
      } catch (e) {
        console.error('Erro ao atualizar conquista:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao atualizar conquista.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [achievements, persist, sortList],
  );

  const deleteAchievement = useCallback(
    async (id: string): Promise<void> => {
      try {
        const exists = achievements.some((a) => a.id === id);
        if (!exists) throw new Error('Conquista não encontrada.');
        const filtered = achievements.filter((a) => a.id !== id);
        setAchievements(filtered);
        await persist(filtered);
      } catch (e) {
        console.error('Erro ao deletar conquista:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao deletar conquista.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [achievements, persist],
  );

  // -----------------------------
  // Progresso
  // -----------------------------
  const setProgress = useCallback(
    async (id: string, progress: number): Promise<Achievement> => {
      const clamped = clamp(progress, 0, 100);
      return updateAchievement(id, { progress: clamped });
    },
    [updateAchievement],
  );

  const incrementProgress = useCallback(
    async (id: string, delta: number): Promise<Achievement> => {
      const item = achievements.find((a) => a.id === id);
      if (!item) throw new Error('Conquista não encontrada.');
      const next = clamp(item.progress + delta, 0, 100);
      return updateAchievement(id, { progress: next });
    },
    [achievements, updateAchievement],
  );

  const getProgressFor = useCallback(
    (id: string): number => achievements.find((a) => a.id === id)?.progress ?? 0,
    [achievements],
  );

  // -----------------------------
  // Desbloqueio
  // -----------------------------
  const unlockAchievement = useCallback(
    async (id: string, dateISO?: string): Promise<Achievement> => {
      const item = achievements.find((a) => a.id === id);
      if (!item) throw new Error('Conquista não encontrada.');
      // ao desbloquear, garante progress >= 100
      return updateAchievement(id, {
        unlockedAt: dateISO ?? new Date().toISOString(),
        progress: Math.max(item.progress, 100),
      });
    },
    [achievements, updateAchievement],
  );

  const lockAchievement = useCallback(
    async (id: string): Promise<Achievement> => {
      const item = achievements.find((a) => a.id === id);
      if (!item) throw new Error('Conquista não encontrada.');
      // ao "travar" de novo, mantém o progresso atual (pode ser < 100 se você quiser rebaixar antes)
      return updateAchievement(id, { unlockedAt: undefined });
    },
    [achievements, updateAchievement],
  );

  // -----------------------------
  // Consultas
  // -----------------------------
  const getUnlocked = useCallback(
    () => achievements.filter((a) => Boolean(a.unlockedAt)),
    [achievements],
  );

  const getLocked = useCallback(
    () => achievements.filter((a) => !a.unlockedAt),
    [achievements],
  );

  const getRecentlyUnlocked = useCallback(
    (days: number) => {
      const since = dayjs().subtract(days, 'day');
      return achievements.filter(
        (a) => a.unlockedAt && dayjs(a.unlockedAt).isAfter(since),
      );
    },
    [achievements],
  );

  const refreshFromStorage = useCallback(async () => {
    await loadFromStorage();
  }, [loadFromStorage]);

  // -----------------------------
  // Valor exportado
  // -----------------------------
  const value = useMemo<AchievementsContextData>(
    () => ({
      achievements,
      loading,
      error,
      isInitialized,
      addAchievement,
      updateAchievement,
      deleteAchievement,
      setProgress,
      incrementProgress,
      getProgressFor,
      unlockAchievement,
      lockAchievement,
      getUnlocked,
      getLocked,
      getRecentlyUnlocked,
      refreshFromStorage,
    }),
    [
      achievements,
      loading,
      error,
      isInitialized,
      addAchievement,
      updateAchievement,
      deleteAchievement,
      setProgress,
      incrementProgress,
      getProgressFor,
      unlockAchievement,
      lockAchievement,
      getUnlocked,
      getLocked,
      getRecentlyUnlocked,
      refreshFromStorage,
    ],
  );

  return <AchievementsContext.Provider value={value}>{children}</AchievementsContext.Provider>;
};

// -----------------------------
// Hook
// -----------------------------
export function useAchievements(): AchievementsContextData {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements deve ser usado dentro de AchievementsProvider');
  return ctx;
}
