// src/hooks/useAutoBackup.ts
import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

import * as FileSystem from 'expo-file-system';
import { useBackup } from './useBackup';
import { useStorage } from './useStorage';
import { AppSettings } from '@/types/models';
import { ensureNotificationChannel } from '@/services/Notifications';

// Tipagem leve para APIs legadas do FileSystem (se você ainda usa)
type FSLike = {
  documentDirectory?: string | null;
  readDirectoryAsync: (uri: string) => Promise<string[]>;
  deleteAsync: (uri: string, opts?: { idempotent?: boolean }) => Promise<void>;
};
const FS = FileSystem as unknown as FSLike;

export function useAutoBackup() {
  const { exportData } = useBackup();

  const {
    value: settings,
    setValue: setSettings,
    save: saveSettings,
    load: loadSettings,
  } = useStorage<AppSettings>({
    key: 'app_settings',
    initialValue: {
      theme: 'system',
      notificationsEnabled: true,
      backupEnabled: true,
    },
  });

  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const DOCUMENT_DIR = (FS.documentDirectory ?? '') as string;

  // Permissões
  const checkNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) {
        setPermissionGranted(true);
        return true;
      }
      const { granted } = await Notifications.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (!granted) {
        Alert.alert(
          'Permissão necessária',
          'Ative as notificações para receber alertas de backup automático.'
        );
      }
      return granted;
    } catch (e) {
      console.error('Erro ao verificar permissão de notificações:', e);
      return false;
    }
  }, []);

  // Execução do backup
  const runAutoBackup = useCallback(async () => {
    if (running || !settings.backupEnabled) return;
    try {
      setRunning(true);

      // Gera o backup via hook
      await exportData();

      // Enxuga somente backups automáticos antigos (mantém 7)
      const files = await FS.readDirectoryAsync(DOCUMENT_DIR);
      const autoBackups = files.filter((f) => f.startsWith('auto-backup-'));
      if (autoBackups.length > 7) {
        const sorted = autoBackups.sort().reverse();
        const old = sorted.slice(7);
        for (const f of old) {
          await FS.deleteAsync(`${DOCUMENT_DIR}${f}`, { idempotent: true });
        }
      }

      setLastAutoBackup(new Date().toISOString());
      console.log('🤖 Backup automático concluído');
    } catch (e) {
      console.error('Erro no backup automático:', e);
      Alert.alert('Erro', 'Falha ao executar backup automático.');
    } finally {
      setRunning(false);
    }
  }, [exportData, DOCUMENT_DIR, running, settings.backupEnabled]);

  // Agenda notificação DIÁRIA às 22h usando DailyTriggerInput (campo `type` é obrigatório)
  const scheduleBackupReminder = useCallback(async () => {
    if (!settings.backupEnabled) return;
    const granted = await checkNotificationPermission();
    if (!granted) return;

    try {
      await ensureNotificationChannel('backup', 'default');
      await Notifications.cancelAllScheduledNotificationsAsync(); // evita duplicar

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧩 Backup diário',
          body: 'Seu backup automático foi realizado ou está programado.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 22,
          minute: 0,
          channelId: 'backup',
        },
      });

      console.log('🔔 Notificação diária de backup agendada às 22h.');
    } catch (e) {
      console.error('Erro ao agendar lembrete de backup:', e);
    }
  }, [settings.backupEnabled, checkNotificationPermission]);

  // Inicialização
  useEffect(() => {
    (async () => {
      await loadSettings();
      if (settings.backupEnabled) {
        const granted = await checkNotificationPermission();
        if (granted) await scheduleBackupReminder();
      } else {
        console.log('⚙️ Backup automático desativado nas configurações.');
      }
    })();

    // Verifica a cada hora e executa às 22h (local)
    const interval = setInterval(() => {
      if (!settings.backupEnabled) return;
      const hour = new Date().getHours();
      if (hour === 22) runAutoBackup();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAutoBackup, checkNotificationPermission, scheduleBackupReminder, settings.backupEnabled]);

  // Toggle
  const toggleAutoBackup = useCallback(async () => {
    const updated = { ...settings, backupEnabled: !settings.backupEnabled };
    setSettings(updated);
    await saveSettings(updated);
    console.log(
      updated.backupEnabled ? '✅ Backup automático ativado' : '⏸️ Backup automático desativado'
    );
    if (updated.backupEnabled) {
      await scheduleBackupReminder();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [settings, setSettings, saveSettings, scheduleBackupReminder]);

  return {
    lastAutoBackup,
    running,
    permissionGranted,
    backupEnabled: settings.backupEnabled,
    toggleAutoBackup,
    runAutoBackup,
  };
}
