import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useStorage } from './useStorage';
import { useNotifications } from '@/contexts/NotificationContext';
import { Reminder } from '@/types/models';

// -------------------------------------------------------------
// Hook principal — gerencia lembretes e notificações locais
// -------------------------------------------------------------
export function useReminders() {
  const { scheduleReminder, cancelNotification, refreshScheduled } = useNotifications();

  const {
    value: reminders,
    setValue: setReminders,
    save: saveReminders,
    load: loadReminders,
  } = useStorage<Reminder[]>({
    key: 'reminders',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carrega lembretes salvos uma única vez
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        await loadReminders();
        await refreshScheduled();
      } catch (e) {
        console.error('Erro ao carregar lembretes:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // <- executa só na montagem

  // -----------------------------------------------------------
  // Adicionar lembrete
  // -----------------------------------------------------------
  const addReminder = useCallback(
    async (data: Omit<Reminder, 'id' | 'isCompleted' | 'createdAt' | 'notificationId'>) => {
      try {
        const newReminder: Reminder = {
          ...data,
          id: uuidv4(),
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };

        const updated = [...reminders, newReminder];
        setReminders(updated);
        await saveReminders(updated);

        // agenda a notificação local
        const notifId = await scheduleReminder(newReminder);
        if (notifId) {
          const fixedList = updated.map(r =>
            r.id === newReminder.id ? { ...r, notificationId: notifId } : r
          );
          setReminders(fixedList);
          await saveReminders(fixedList);
        }

        console.log('✅ Lembrete criado:', newReminder.title);
      } catch (e) {
        console.error('Erro ao adicionar lembrete:', e);
        Alert.alert('Erro', 'Não foi possível criar o lembrete.');
      }
    },
    [reminders, setReminders, saveReminders, scheduleReminder],
  );

  // -----------------------------------------------------------
  // Atualizar lembrete
  // -----------------------------------------------------------
  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>) => {
      try {
        const updatedList = reminders.map(r =>
          r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r,
        );
        setReminders(updatedList);
        await saveReminders(updatedList);
        console.log('✏️ Lembrete atualizado:', id);
      } catch (e) {
        console.error('Erro ao atualizar lembrete:', e);
      }
    },
    [reminders, setReminders, saveReminders],
  );

  // -----------------------------------------------------------
  // Remover lembrete
  // -----------------------------------------------------------
  const deleteReminder = useCallback(
    async (id: string) => {
      try {
        const reminder = reminders.find(r => r.id === id);
        const filtered = reminders.filter(r => r.id !== id);
        setReminders(filtered);
        await saveReminders(filtered);

        if (reminder?.notificationId) {
          await cancelNotification(reminder.notificationId);
        }

        console.log('🗑️ Lembrete removido:', id);
      } catch (e) {
        console.error('Erro ao remover lembrete:', e);
      }
    },
    [reminders, setReminders, saveReminders, cancelNotification],
  );

  // -----------------------------------------------------------
  // Alternar conclusão
  // -----------------------------------------------------------
  const toggleComplete = useCallback(
    async (id: string) => {
      try {
        const updated = reminders.map(r =>
          r.id === id ? { ...r, isCompleted: !r.isCompleted } : r,
        );
        setReminders(updated);
        await saveReminders(updated);
      } catch (e) {
        console.error('Erro ao alternar lembrete:', e);
      }
    },
    [reminders, setReminders, saveReminders],
  );

  // -----------------------------------------------------------
  // Limpar todos
  // -----------------------------------------------------------
  const clearReminders = useCallback(async () => {
    try {
      setReminders([]);
      await saveReminders([]);
      console.log('🧹 Lembretes limpos.');
    } catch (e) {
      console.error('Erro ao limpar lembretes:', e);
    }
  }, [setReminders, saveReminders]);

  return {
    reminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    clearReminders,
  };
}
