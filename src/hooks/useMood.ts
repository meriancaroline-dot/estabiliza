// src/hooks/useMood.ts
import { useCallback, useEffect, useState } from 'react';
import { useStorage } from './useStorage';
import { Alert } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// -------------------------------------------------------------
// Tipo do humor
// -------------------------------------------------------------
export type MoodEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  period: 'morning' | 'afternoon' | 'night';
  mood: string; // Ex: "Feliz"
  emoji: string; // Ex: "🙂"
  rating: number; // 1–5
};

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useMood() {
  const {
    value: moods,
    setValue: setMoods,
    save: saveMoods,
    load: loadMoods,
  } = useStorage<MoodEntry[]>({
    key: 'moods',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar registros salvos (roda só uma vez)
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        await loadMoods();
      } catch (e) {
        console.error('Erro ao carregar moods:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // <- nada de dependências aqui

  // -----------------------------------------------------------
  // Adiciona ou atualiza o humor de um período do dia
  // -----------------------------------------------------------
  const addMood = useCallback(
    async (
      period: MoodEntry['period'],
      mood: string,
      emoji: string,
      rating: number
    ) => {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const existing = moods.find(
          (m) => m.date === today && m.period === period
        );

        const newEntry: MoodEntry = {
          id: existing ? existing.id : uuidv4(),
          date: today,
          period,
          mood,
          emoji,
          rating,
        };

        const updated = existing
          ? moods.map((m) => (m.id === existing.id ? newEntry : m))
          : [...moods, newEntry];

        // Evita salvar duplicado desnecessariamente
        if (JSON.stringify(moods) !== JSON.stringify(updated)) {
          setMoods(updated);
          await saveMoods(updated);
          console.log(`🧠 Humor salvo (${period}): ${mood}`);
        }
      } catch (e) {
        console.error('Erro ao adicionar humor:', e);
        Alert.alert('Erro', 'Não foi possível registrar o humor.');
      }
    },
    [moods, setMoods, saveMoods]
  );

  // -----------------------------------------------------------
  // Excluir humor específico
  // -----------------------------------------------------------
  const deleteMood = useCallback(
    async (id: string) => {
      try {
        const filtered = moods.filter((m) => m.id !== id);
        setMoods(filtered);
        await saveMoods(filtered);
        console.log('🗑️ Humor removido:', id);
      } catch (e) {
        console.error('Erro ao remover humor:', e);
        Alert.alert('Erro', 'Não foi possível remover o registro.');
      }
    },
    [moods, setMoods, saveMoods]
  );

  // -----------------------------------------------------------
  // Limpar todos os registros
  // -----------------------------------------------------------
  const clearMoods = useCallback(async () => {
    try {
      setMoods([]);
      await saveMoods([]);
      console.log('🧹 Registros de humor limpos.');
    } catch (e) {
      console.error('Erro ao limpar moods:', e);
    }
  }, [setMoods, saveMoods]);

  // -----------------------------------------------------------
  // Retorna os registros dos últimos 7 dias (pra gráficos)
  // -----------------------------------------------------------
  const getLast7Days = useCallback(() => {
    const now = new Date();
    return moods.filter((m) => {
      const diff =
        (now.getTime() - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
  }, [moods]);

  // -----------------------------------------------------------
  // Calcula média diária (pra dashboard)
  // -----------------------------------------------------------
  const getDailyAverage = useCallback(() => {
    const grouped: Record<string, { total: number; count: number }> = {};
    for (const mood of moods) {
      if (!grouped[mood.date]) grouped[mood.date] = { total: 0, count: 0 };
      grouped[mood.date].total += mood.rating;
      grouped[mood.date].count += 1;
    }
    return Object.entries(grouped).map(([date, { total, count }]) => ({
      date,
      avg: parseFloat((total / count).toFixed(2)),
    }));
  }, [moods]);

  return {
    moods,
    loading,
    addMood,
    deleteMood,
    clearMoods,
    getLast7Days,
    getDailyAverage,
  };
}
