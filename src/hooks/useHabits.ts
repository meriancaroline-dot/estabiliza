// src/hooks/useHabits.ts
// -------------------------------------------------------------
// Hook de hábitos com seed inicial + streak diário confiável
// -------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import { useStorage } from './useStorage';
import { Habit } from '@/types/models';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// -------------------------------------------------------------
// Hábitos padrão (seed) — carregados se não houver nada salvo
// Tipagem igual ao addHabit: Omit<Habit, 'id' | 'streak' | 'lastCompleted'>
// -------------------------------------------------------------
const SEED_HABITS: Array<Omit<Habit, 'id' | 'streak' | 'lastCompleted'>> = [
  {
    title: 'Dormir 6h ou mais por dia',
    description: 'Sono restaurador para estabilidade emocional.',
    frequency: 'daily',
  },
  {
    title: 'Exposição de 30 minutos ao sol',
    description: 'Luz natural regula o ciclo circadiano e melhora o humor.',
    frequency: 'daily',
  },
  {
    title: 'Tomar medicação',
    description: 'Seguir o tratamento conforme orientação profissional.',
    frequency: 'daily',
  },
  {
    title: 'Beber ao menos 2L de água',
    description: 'Hidratação adequada melhora concentração e energia.',
    frequency: 'daily',
  },
  {
    title: 'Fazer 3 refeições',
    description: 'Alimentação regular mantém equilíbrio de energia e humor.',
    frequency: 'daily',
  },
  {
    title: 'Reduzir o tempo de tela',
    description: 'Evitar estímulos excessivos e melhorar a qualidade do sono.',
    frequency: 'daily',
  },
  {
    title: 'Atividade física',
    description: 'Mover o corpo regularmente ajuda o humor.',
    frequency: 'daily',
  },
];

// Util para “zerar” hora e comparar dias
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
const MS_DAY = 1000 * 60 * 60 * 24;

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useHabits() {
  const {
    value: habits,
    setValue: setHabits,
    save: saveHabits,
    load: loadHabits,
  } = useStorage<Habit[]>({
    key: 'habits',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar hábitos + seed inicial
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      await loadHabits();
      setLoading(false);
    })();
  }, [loadHabits]);

  // Se não houver hábitos salvos, semeia os padrões uma única vez
  useEffect(() => {
    (async () => {
      if (!loading && habits.length === 0) {
        const seeded: Habit[] = SEED_HABITS.map((h) => ({
          ...h,
          id: uuidv4(),
          streak: 0,
          lastCompleted: undefined,
        }));
        setHabits(seeded);
        await saveHabits(seeded);
        // console.log('🌱 Hábitos padrão criados.');
      }
    })();
  }, [loading, habits.length, setHabits, saveHabits]);

  // -----------------------------------------------------------
  // Criar hábito
  // -----------------------------------------------------------
  const addHabit = useCallback(
    async (data: Omit<Habit, 'id' | 'streak' | 'lastCompleted'>) => {
      try {
        const newHabit: Habit = {
          ...data,
          id: uuidv4(),
          streak: 0,
          lastCompleted: undefined,
        };

        const updated = [...habits, newHabit];
        setHabits(updated);
        await saveHabits(updated);
        // console.log('✅ Hábito criado:', newHabit.title);
      } catch (e) {
        console.error('Erro ao adicionar hábito:', e);
        Alert.alert('Erro', 'Não foi possível criar o hábito.');
      }
    },
    [habits, setHabits, saveHabits],
  );

  // -----------------------------------------------------------
  // Atualizar hábito
  // -----------------------------------------------------------
  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>) => {
      try {
        const updatedList = habits.map((h) =>
          h.id === id ? { ...h, ...updates } : h,
        );
        setHabits(updatedList);
        await saveHabits(updatedList);
        // console.log('✏️ Hábito atualizado:', id);
      } catch (e) {
        console.error('Erro ao atualizar hábito:', e);
        Alert.alert('Erro', 'Não foi possível atualizar o hábito.');
      }
    },
    [habits, setHabits, saveHabits],
  );

  // -----------------------------------------------------------
  // Excluir hábito
  // -----------------------------------------------------------
  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        const filtered = habits.filter((h) => h.id !== id);
        setHabits(filtered);
        await saveHabits(filtered);
        // console.log('🗑️ Hábito removido:', id);
      } catch (e) {
        console.error('Erro ao remover hábito:', e);
        Alert.alert('Erro', 'Não foi possível remover o hábito.');
      }
    },
    [habits, setHabits, saveHabits],
  );

  // -----------------------------------------------------------
  // Concluir hábito — cálculo de streak à prova de fuso/horário
  // -----------------------------------------------------------
  const completeHabit = useCallback(
    async (id: string) => {
      try {
        const today = startOfDay(new Date());

        const updatedList = habits.map((h) => {
          if (h.id !== id) return h;

          const prevStreak = h.streak ?? 0;

          if (h.lastCompleted) {
            const last = startOfDay(new Date(h.lastCompleted));
            const diffDays = Math.floor((today.getTime() - last.getTime()) / MS_DAY);

            let nextStreak = prevStreak;
            if (diffDays === 0) {
              // Já marcou hoje: mantém streak, só atualiza timestamp
              nextStreak = prevStreak > 0 ? prevStreak : 1;
            } else if (diffDays === 1) {
              nextStreak = prevStreak + 1;
            } else {
              // Perdeu dias no meio: reinicia
              nextStreak = 1;
            }

            return {
              ...h,
              lastCompleted: today.toISOString(),
              streak: nextStreak,
            };
          }

          // Primeiro check do hábito
          return {
            ...h,
            lastCompleted: today.toISOString(),
            streak: 1,
          };
        });

        setHabits(updatedList);
        await saveHabits(updatedList);
        // console.log('🔥 Hábito concluído:', id);
      } catch (e) {
        console.error('Erro ao completar hábito:', e);
        Alert.alert('Erro', 'Não foi possível completar o hábito.');
      }
    },
    [habits, setHabits, saveHabits],
  );

  // -----------------------------------------------------------
  // Resetar streak
  // -----------------------------------------------------------
  const resetStreak = useCallback(
    async (id: string) => {
      const updated = habits.map((h) =>
        h.id === id ? { ...h, streak: 0, lastCompleted: undefined } : h,
      );
      setHabits(updated);
      await saveHabits(updated);
    },
    [habits, setHabits, saveHabits],
  );

  // -----------------------------------------------------------
  // Limpar tudo
  // -----------------------------------------------------------
  const clearHabits = useCallback(async () => {
    setHabits([]);
    await saveHabits([]);
  }, [setHabits, saveHabits]);

  return {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    resetStreak,
    clearHabits,
  };
}
