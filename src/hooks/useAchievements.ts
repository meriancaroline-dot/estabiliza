import { useCallback, useEffect, useState } from 'react';
import { useStorage } from './useStorage';
import { Achievement } from '@/types/models';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// -------------------------------------------------------------
// Hook principal — Gerencia conquistas do usuário
// -------------------------------------------------------------
export function useAchievements() {
  const {
    value: achievements,
    setValue: setAchievements,
    save: saveAchievements,
    load: loadAchievements,
  } = useStorage<Achievement[]>({
    key: 'achievements',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar conquistas do armazenamento
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      await loadAchievements();
      setLoading(false);
    })();
  }, [loadAchievements]);

  // -----------------------------------------------------------
  // Adicionar nova conquista
  // -----------------------------------------------------------
  const addAchievement = useCallback(
    async (data: Omit<Achievement, 'id' | 'date' | 'unlocked'>) => {
      try {
        const newAchievement: Achievement = {
          ...data,
          id: uuidv4(),
          date: new Date().toISOString(),
          unlocked: true,
        };

        const updated = [...achievements, newAchievement];
        setAchievements(updated);
        await saveAchievements(updated);

        console.log('🏆 Conquista adicionada:', newAchievement.title);
      } catch (e) {
        console.error('Erro ao adicionar conquista:', e);
        Alert.alert('Erro', 'Não foi possível adicionar a conquista.');
      }
    },
    [achievements, setAchievements, saveAchievements],
  );

  // -----------------------------------------------------------
  // Atualizar conquista existente
  // -----------------------------------------------------------
  const updateAchievement = useCallback(
    async (id: string, updates: Partial<Achievement>) => {
      try {
        const updatedList = achievements.map((a) =>
          a.id === id ? { ...a, ...updates } : a,
        );
        setAchievements(updatedList);
        await saveAchievements(updatedList);

        console.log('✏️ Conquista atualizada:', id);
      } catch (e) {
        console.error('Erro ao atualizar conquista:', e);
        Alert.alert('Erro', 'Não foi possível atualizar a conquista.');
      }
    },
    [achievements, setAchievements, saveAchievements],
  );

  // -----------------------------------------------------------
  // Remover conquista
  // -----------------------------------------------------------
  const deleteAchievement = useCallback(
    async (id: string) => {
      try {
        const filtered = achievements.filter((a) => a.id !== id);
        setAchievements(filtered);
        await saveAchievements(filtered);

        console.log('🗑️ Conquista removida:', id);
      } catch (e) {
        console.error('Erro ao remover conquista:', e);
        Alert.alert('Erro', 'Não foi possível remover a conquista.');
      }
    },
    [achievements, setAchievements, saveAchievements],
  );

  // -----------------------------------------------------------
  // Desbloquear uma conquista (quando o usuário atinge o requisito)
  // -----------------------------------------------------------
  const unlockAchievement = useCallback(
    async (id: string) => {
      try {
        const updatedList = achievements.map((a) =>
          a.id === id ? { ...a, unlocked: true, date: new Date().toISOString() } : a,
        );
        setAchievements(updatedList);
        await saveAchievements(updatedList);

        console.log('🎉 Conquista desbloqueada:', id);
      } catch (e) {
        console.error('Erro ao desbloquear conquista:', e);
        Alert.alert('Erro', 'Não foi possível desbloquear a conquista.');
      }
    },
    [achievements, setAchievements, saveAchievements],
  );

  // -----------------------------------------------------------
  // Resetar conquistas (para debug ou reinício)
  // -----------------------------------------------------------
  const resetAchievements = useCallback(async () => {
    try {
      setAchievements([]);
      await saveAchievements([]);
      console.log('🧹 Todas as conquistas foram resetadas.');
    } catch (e) {
      console.error('Erro ao resetar conquistas:', e);
      Alert.alert('Erro', 'Não foi possível limpar as conquistas.');
    }
  }, [setAchievements, saveAchievements]);

  // -----------------------------------------------------------
  // Contar conquistas desbloqueadas e totais
  // -----------------------------------------------------------
  const getUnlockedCount = useCallback(() => {
    return achievements.filter((a) => a.unlocked).length;
  }, [achievements]);

  const getTotalCount = useCallback(() => {
    return achievements.length;
  }, [achievements]);

  const getUnlockedPercentage = useCallback(() => {
    const total = achievements.length;
    if (total === 0) return 0;
    return Math.round((getUnlockedCount() / total) * 100);
  }, [achievements, getUnlockedCount]);

  // -----------------------------------------------------------
  // Retorno
  // -----------------------------------------------------------
  return {
    achievements,
    loading,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    unlockAchievement,
    resetAchievements,
    getUnlockedCount,
    getTotalCount,
    getUnlockedPercentage,
  };
}
