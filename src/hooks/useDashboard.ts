import { useMemo } from 'react';
import { useStats } from './useStats';
import { AppStats } from '@/types/models';

// -------------------------------------------------------------
// Hook principal — gera dados formatados pro Dashboard
// -------------------------------------------------------------
export function useDashboard() {
  const { stats, completionRates, summary } = useStats();

  // -----------------------------------------------------------
  // Cards principais (exibição resumida)
  // -----------------------------------------------------------
  const cards = useMemo(() => {
    const list = [
      {
        id: 'tasks',
        title: 'Tarefas Concluídas',
        value: `${completionRates.taskRate}%`,
        subtitle: `${stats.completedTasks}/${stats.totalTasks}`,
        color: '#4CAF50',
        icon: 'check-circle',
      },
      {
        id: 'habits',
        title: 'Consistência de Hábitos',
        value: `${completionRates.habitConsistency}%`,
        subtitle: `${stats.activeHabits}/${stats.totalHabits}`,
        color: '#2196F3',
        icon: 'repeat',
      },
      {
        id: 'reminders',
        title: 'Lembretes Cumpridos',
        value: `${completionRates.reminderRate}%`,
        subtitle: `${stats.completedReminders}/${stats.totalReminders}`,
        color: '#FFC107',
        icon: 'bell',
      },
      {
        id: 'mood',
        title: 'Média de Humor',
        value:
          stats.moodAverage && stats.moodAverage > 0
            ? `${stats.moodAverage.toFixed(1)}/5`
            : '—',
        subtitle: 'Últimos registros',
        color: '#9C27B0',
        icon: 'smile',
      },
    ];

    return list.filter((c) => c.value !== '—' || c.subtitle !== '0/0');
  }, [completionRates, stats]);

  // -----------------------------------------------------------
  // Dados pra gráficos
  // -----------------------------------------------------------
  const chartData = useMemo(() => {
    return [
      {
        label: 'Tarefas',
        value: completionRates.taskRate,
        color: '#4CAF50',
      },
      {
        label: 'Hábitos',
        value: completionRates.habitConsistency,
        color: '#2196F3',
      },
      {
        label: 'Lembretes',
        value: completionRates.reminderRate,
        color: '#FFC107',
      },
    ];
  }, [completionRates]);

  // -----------------------------------------------------------
  // Última atualização
  // -----------------------------------------------------------
  const lastUpdated = useMemo(() => {
    const date = stats.generatedAt
      ? new Date(stats.generatedAt).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      : '—';
    return `Atualizado em ${date}`;
  }, [stats.generatedAt]);

  // -----------------------------------------------------------
  // Retorno final
  // -----------------------------------------------------------
  return {
    cards,
    chartData,
    summary,
    lastUpdated,
    stats,
  };
}
