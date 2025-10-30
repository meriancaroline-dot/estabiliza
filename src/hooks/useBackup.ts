import { useCallback, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { ExportData } from '@/types/models';
import { useReminders } from './useReminders';
import { useHabits } from './useHabits';
import { useAchievements } from './useAchievements';
import { useUser } from './useUser';
import { useTheme } from './useTheme';
import { useMood } from './useMood';

// -------------------------------------------------------------
// Tipagem local estável para expo-file-system
// -------------------------------------------------------------
type FSLike = {
  documentDirectory?: string | null;
  cacheDirectory?: string | null;
  writeAsStringAsync: (
    uri: string,
    data: string,
    opts?: { encoding?: 'utf8' | 'base64' },
  ) => Promise<void>;
  readAsStringAsync: (
    uri: string,
    opts?: { encoding?: 'utf8' | 'base64' },
  ) => Promise<string>;
  readDirectoryAsync: (uri: string) => Promise<string[]>;
  deleteAsync: (uri: string, opts?: { idempotent?: boolean }) => Promise<void>;
};
const FS = FileSystem as unknown as FSLike;

// -------------------------------------------------------------
// Hook principal de Backup e Restauração
// -------------------------------------------------------------
export function useBackup() {
  const { reminders } = useReminders();
  const { habits } = useHabits();
  const { achievements } = useAchievements();
  const { user } = useUser();
  const { theme } = useTheme();
  const { moods } = useMood();

  const [loading, setLoading] = useState(false);

  const DOCUMENT_DIR = (FS.documentDirectory ?? FS.cacheDirectory ?? '') as string;
  const CACHE_DIR = (FS.cacheDirectory ?? FS.documentDirectory ?? DOCUMENT_DIR) as string;

  // -----------------------------------------------------------
  // Exporta backup local completo
  // -----------------------------------------------------------
  const exportData = useCallback(async () => {
    try {
      setLoading(true);

      const backup: ExportData = {
        user: user ?? undefined,
        reminders,
        moods,
        habits,
        achievements,
        tasks: [],
        notes: [],
        stats: undefined,
        settings: {
          theme: theme.mode,
          notificationsEnabled: true,
        },
        exportedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(backup, null, 2);
      const fileName = `backup-estabiliza-${Date.now()}.json`;
      const path = `${DOCUMENT_DIR}${fileName}`;

      await FS.writeAsStringAsync(path, json, { encoding: 'utf8' });
      console.log('💾 Backup exportado em:', path);
      Alert.alert('Backup concluído', 'Backup exportado com sucesso!');
    } catch (e) {
      console.error('Erro ao exportar backup:', e);
      Alert.alert('Erro', 'Não foi possível exportar o backup.');
    } finally {
      setLoading(false);
    }
  }, [user, reminders, moods, habits, achievements, theme, DOCUMENT_DIR]);

  // -----------------------------------------------------------
  // Retorna o conteúdo do último arquivo de backup (.json)
  // -----------------------------------------------------------
  const getLastBackup = useCallback(async (): Promise<string | null> => {
    try {
      const files = await FS.readDirectoryAsync(DOCUMENT_DIR);
      const backups = files
        .filter((f) => f.startsWith('backup-estabiliza') && f.endsWith('.json'))
        .sort();

      if (backups.length === 0) return null;

      const latest = backups[backups.length - 1];
      const json = await FS.readAsStringAsync(`${DOCUMENT_DIR}${latest}`, {
        encoding: 'utf8',
      });
      console.log('📦 Último backup encontrado:', latest);
      return json;
    } catch (e) {
      console.error('Erro ao buscar último backup:', e);
      return null;
    }
  }, [DOCUMENT_DIR]);

  // -----------------------------------------------------------
  // Importa backup a partir de uma string JSON
  // -----------------------------------------------------------
  const importData = useCallback(async (jsonString: string) => {
    try {
      setLoading(true);
      const parsed: ExportData = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') throw new Error('Formato inválido.');

      console.log('📥 Backup importado:', parsed.exportedAt);
      Alert.alert('Backup restaurado', 'Os dados foram importados com sucesso!');
    } catch (e) {
      console.error('Erro ao importar backup:', e);
      Alert.alert('Erro', 'Falha ao importar backup.');
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------------
  // Limpa backups antigos (mantém 3 mais recentes)
  // -----------------------------------------------------------
  const clearOldBackups = useCallback(async () => {
    try {
      const files = await FS.readDirectoryAsync(DOCUMENT_DIR);
      const backups = files.filter((f: string) => f.startsWith('backup-estabiliza'));
      if (backups.length <= 3) return;

      const sorted = backups.sort().reverse();
      const toDelete = sorted.slice(3);

      for (const file of toDelete) {
        await FS.deleteAsync(`${DOCUMENT_DIR}${file}`, { idempotent: true });
      }
      console.log(`🧹 ${toDelete.length} backups antigos removidos.`);
    } catch (e) {
      console.error('Erro ao limpar backups antigos:', e);
    }
  }, [DOCUMENT_DIR]);

  return {
    exportData,
    importData,
    getLastBackup,
    clearOldBackups,
    loading,
  };
}
