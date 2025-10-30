import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import { Reminder } from "@/types/models";

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
interface NotificationContextType {
  permissionGranted: boolean;
  scheduled: Notifications.NotificationRequest[];
  requestPermission: () => Promise<boolean>;
  refreshScheduled: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  scheduleReminder: (reminder: Reminder) => Promise<string | null>;
  scheduleTestNotification: () => Promise<void>;
}

// -------------------------------------------------------------
// Contexto
// -------------------------------------------------------------
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduled, setScheduled] = useState<
    Notifications.NotificationRequest[]
  >([]);

  // -----------------------------------------------------------
  // Handler global
  // -----------------------------------------------------------
  Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // -----------------------------------------------------------
  // Pedir permissão
  // -----------------------------------------------------------
  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    // ✅ Compatível com SDK 54 (sem LIMITED)
    const granted = status === Notifications.PermissionStatus.GRANTED;

    setPermissionGranted(granted);

    if (!granted) {
      Alert.alert(
        "Permissão negada",
        "Não será possível exibir notificações sem permissão."
      );
    }

    return granted;
  }, []);

  // -----------------------------------------------------------
  // Atualizar lista de notificações
  // -----------------------------------------------------------
  const refreshScheduled = useCallback(async () => {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    setScheduled(list);
  }, []);

  // -----------------------------------------------------------
  // Cancelar uma notificação
  // -----------------------------------------------------------
  const cancelNotification = useCallback(
    async (id: string) => {
      await Notifications.cancelScheduledNotificationAsync(id);
      await refreshScheduled();
    },
    [refreshScheduled]
  );

  // -----------------------------------------------------------
  // Cancelar todas
  // -----------------------------------------------------------
  const cancelAll = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await refreshScheduled();
  }, [refreshScheduled]);

  // -----------------------------------------------------------
  // Agendar lembrete (chamado pelo useReminders)
  // -----------------------------------------------------------
  const scheduleReminder = useCallback(
    async (reminder: Reminder) => {
      try {
        const date = new Date(`${reminder.date}T${reminder.time}:00`);
        const now = new Date();
        const diff = (date.getTime() - now.getTime()) / 1000;
        const seconds = diff > 0 ? diff : 5;

        const trigger: Notifications.NotificationTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: false,
        };

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "🔔 Lembrete",
            body: reminder.title,
          },
          trigger,
        });

        await refreshScheduled();
        return id;
      } catch (e) {
        console.error("Erro ao agendar lembrete:", e);
        return null;
      }
    },
    [refreshScheduled]
  );

  // -----------------------------------------------------------
  // Teste
  // -----------------------------------------------------------
  const scheduleTestNotification = useCallback(async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Teste",
        body: "Notificação de teste!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        repeats: false,
      },
    });
  }, []);

  // -----------------------------------------------------------
  // Efeito inicial
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      const settings = await Notifications.getPermissionsAsync();
      const granted = settings.status === Notifications.PermissionStatus.GRANTED;

      setPermissionGranted(granted);
      await refreshScheduled();
    })();
  }, [refreshScheduled]);

  // -----------------------------------------------------------
  // Retorno
  // -----------------------------------------------------------
  const value = useMemo(
    () => ({
      permissionGranted,
      scheduled,
      requestPermission,
      refreshScheduled,
      cancelNotification,
      cancelAll,
      scheduleReminder,
      scheduleTestNotification,
    }),
    [
      permissionGranted,
      scheduled,
      requestPermission,
      refreshScheduled,
      cancelNotification,
      cancelAll,
      scheduleReminder,
      scheduleTestNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// -------------------------------------------------------------
// Hook
// -------------------------------------------------------------
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications deve ser usado dentro de NotificationProvider");
  }
  return ctx;
}
