import { useEffect, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import { useHabits } from './useHabits';
import { useReminders } from './useReminders';
import { useMood } from './useMood';
import { useStats } from './useStats';

// -------------------------------------------------------------
// Hook — Gera notificações inteligentes com base nos dados do usuário
// -------------------------------------------------------------
export function useNotificationsDashboard() {
  const { habits } = useHabits();
  const { reminders } = useReminders();
  const { moods } = useMood();
  const { stats } = useStats();

  // -----------------------------------------------------------
  // Regras de comportamento para notificações
  // -----------------------------------------------------------
  const shouldEncourageHabit = useMemo(() => {
    const inactive = habits.filter((h) => (h.streak ?? 0) === 0).length;
    return inactive > 2;
  }, [habits]);

  const shouldRemindTasks = useMemo(() => {
    const pending = reminders.filter((r) => !r.isCompleted).length;
    return pending > 0;
  }, [reminders]);

  const shouldSendMoodCheck = useMemo(() => {
    if (!moods.length) return true;
    const last = moods[moods.length - 1];
    if (!last || !last.date) return true;
    const lastDate = new Date(last.date);
    const diffHours =
      (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
    return diffHours > 24; // mais de 1 dia sem registro de humor
  }, [moods]);

  // -----------------------------------------------------------
  // Agenda notificações com base nas condições
  // -----------------------------------------------------------
  useEffect(() => {
    const scheduleNotifications = async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 1️⃣ Motivação de hábitos
      if (shouldEncourageHabit) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔥 Mantenha o ritmo!',
            body: 'Você tem alguns hábitos parados. Que tal recomeçar hoje?',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 10,
            repeats: false,
          },
        });
      }

      // 2️⃣ Lembrete de tarefas
      if (shouldRemindTasks) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🕑 Tem lembretes pendentes!',
            body: 'Não se esqueça de concluir suas tarefas do dia.',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 15,
            repeats: false,
          },
        });
      }

      // 3️⃣ Check de humor
      if (shouldSendMoodCheck) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💬 Como você está se sentindo hoje?',
            body: 'Registre seu humor pra acompanhar seu bem-estar.',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 20,
            repeats: false,
          },
        });
      }

      console.log('🔔 Notificações inteligentes atualizadas com base nos dados.');
    };

    scheduleNotifications();
  }, [shouldEncourageHabit, shouldRemindTasks, shouldSendMoodCheck]);

  // -----------------------------------------------------------
  // Resumo das condições atuais
  // -----------------------------------------------------------
  const status = useMemo(() => {
    return {
      habitsLow: shouldEncourageHabit,
      remindersPending: shouldRemindTasks,
      moodMissing: shouldSendMoodCheck,
      generatedAt: stats.generatedAt,
    };
  }, [shouldEncourageHabit, shouldRemindTasks, shouldSendMoodCheck, stats.generatedAt]);

  return { status };
}
