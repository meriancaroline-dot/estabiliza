// src/hooks/useStats.ts
import { useEffect, useMemo, useState } from 'react';
import { useHabits } from './useHabits';
import { useReminders } from './useReminders';
import { useAchievements } from './useAchievements';
import { useTasks } from './useTasks';
import { useMood } from './useMood';
import { AppStats } from '@/types/models';

// -------------------------------------------------------------
// Hook principal — calcula estatísticas globais do app
// -------------------------------------------------------------
export function useStats() {
  const { habits } = useHabits();
  const { reminders } = useReminders();
  const { achievements } = useAchievements();
  const { tasks } = useTasks();
  const { moods } = useMood();

  const [stats, setStats] = useState<AppStats>({
    totalReminders: 0,
    completedReminders: 0,
    totalHabits: 0,
    activeHabits: 0,
    totalTasks: 0,
    completedTasks: 0,
    moodAverage: 0,
    streakLongest: 0,
    generatedAt: new Date().toISOString(),
  });

  // -----------------------------------------------------------
  // Atualiza estatísticas quando dados mudam (sem loop infinito)
  // -----------------------------------------------------------
  useEffect(() => {
    const totalReminders = reminders.length;
    const completedReminders = reminders.filter(r => r.isCompleted).length;

    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.streak > 0).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    const moodAverage =
      moods.length > 0
        ? Number(
            (
              moods.reduce((sum, m) => sum + (m.rating ?? 0), 0) / moods.length
            ).toFixed(2)
          )
        : 0;

    const streakLongest =
      habits.length > 0
        ? Math.max(...habits.map(h => h.streak ?? 0))
        : 0;

    setStats(prev => ({
      ...prev,
      totalReminders,
      completedReminders,
      totalHabits,
      activeHabits,
      totalTasks,
      completedTasks,
      moodAverage,
      streakLongest,
      // mantém a data anterior pra não gerar loop
      generatedAt: prev.generatedAt,
    }));
  }, [habits, reminders, achievements, tasks, moods]);

  const completionRates = useMemo(() => {
    const reminderRate =
      stats.totalReminders > 0
        ? (stats.completedReminders / stats.totalReminders) * 100
        : 0;

    const taskRate =
      stats.totalTasks > 0
        ? (stats.completedTasks / stats.totalTasks) * 100
        : 0;

    const habitConsistency =
      stats.totalHabits > 0
        ? (stats.activeHabits / stats.totalHabits) * 100
        : 0;

    return {
      reminderRate: Math.round(reminderRate),
      taskRate: Math.round(taskRate),
      habitConsistency: Math.round(habitConsistency),
    };
  }, [stats]);

  const summary = useMemo(() => {
    return {
      performance: `${completionRates.taskRate}% das tarefas concluídas`,
      consistency: `${completionRates.habitConsistency}% de consistência em hábitos`,
      mood:
        stats.moodAverage && stats.moodAverage > 0
          ? `Média de humor: ${stats.moodAverage.toFixed(1)}/5`
          : 'Sem dados de humor ainda',
    };
  }, [completionRates, stats]);

  return { stats, completionRates, summary };
}
