// -------------------------------------------------------------
// src/hooks/useNotifications.ts
// Hook customizado para interagir com o NotificationContext
// -------------------------------------------------------------

import { useCallback, useEffect, useState, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotifications as useNotificationContext } from '@/contexts/NotificationContext';
import { Reminder } from '@/types/models';

// -------------------------------------------------------------
// Tipagem interna do hook
// -------------------------------------------------------------
interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  date: Date;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
}

interface UseNotificationsReturn {
  permissionGranted: boolean;
  scheduled: ScheduledNotification[];
  requestPermission: () => Promise<boolean>;
  scheduleReminder: (reminder: Reminder) => Promise<string | null>;
  cancelReminder: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  refreshScheduled: () => Promise<void>;
  scheduleTestNotification: () => Promise<void>;
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useNotifications(): UseNotificationsReturn {
  const {
    permissionGranted,
    scheduled: rawScheduled,
    requestPermission,
    refreshScheduled,
    cancelNotification,
    cancelAll,
    scheduleReminder,
    scheduleTestNotification,
  } = useNotificationContext();

  const [initialized, setInitialized] = useState(false);

  // -----------------------------------------------------------
  // Transforma NotificationRequest[] em ScheduledNotification[]
  // -----------------------------------------------------------
  const scheduled = useMemo(() => {
    return rawScheduled.map((notif) => ({
      id: notif.identifier,
      title: notif.content.title || '',
      body: notif.content.body || '',
      date: notif.trigger && 'date' in notif.trigger 
        ? new Date((notif.trigger as any).date || (notif.trigger as any).value || Date.now())
        : new Date(),
      repeat: notif.trigger && 'repeats' in notif.trigger && notif.trigger.repeats
        ? ('daily' as const)
        : ('none' as const),
    }));
  }, [rawScheduled]);

  // -----------------------------------------------------------
  // Cancela lembrete específico
  // -----------------------------------------------------------
  const cancelReminder = useCallback(
    async (id: string) => {
      await cancelNotification(id);
      await refreshScheduled();
    },
    [cancelNotification, refreshScheduled]
  );

  // -----------------------------------------------------------
  // Cancela todas as notificações
  // -----------------------------------------------------------
  const cancelAllReminders = useCallback(async () => {
    await cancelAll();
    await refreshScheduled();
  }, [cancelAll, refreshScheduled]);

  // -----------------------------------------------------------
  // Efeito inicial: checa permissão e sincroniza agendamentos
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      if (initialized) return;
      await refreshScheduled();
      setInitialized(true);
    })();
  }, [initialized, refreshScheduled]);

  // -----------------------------------------------------------
  // Retorno do hook (tudo sincronizado com o Context)
  // -----------------------------------------------------------
  return {
    permissionGranted,
    scheduled,
    requestPermission,
    scheduleReminder,
    cancelReminder,
    cancelAll: cancelAllReminders,
    refreshScheduled,
    scheduleTestNotification,
  };
}