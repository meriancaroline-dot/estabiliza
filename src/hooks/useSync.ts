import { useCallback, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useBackup } from './useBackup';
import { useUser } from './useUser';
import { ExportData } from '@/types/models';

// Tipagem local estável do FS (mesma usada no useBackup)
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

export function useSync() {
  const { exportData, importData, clearOldBackups, loading } = useBackup();
  const { user, isLoggedIn } = useUser();

  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Diretórios
  const DOCUMENT_DIR = (FS.documentDirectory ?? FS.cacheDirectory ?? '') as string;
  const CACHE_DIR = (FS.cacheDirectory ?? FS.documentDirectory ?? DOCUMENT_DIR) as string;

  // Monitorar rede
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsub();
  }, []);

  // Mock de upload (plugue sua API aqui)
  const uploadToCloud = useCallback(async (data: ExportData) => {
    console.log('☁️ Enviando backup...', data.user?.email ?? 'sem usuário');
    await new Promise((r) => setTimeout(r, 1000));
  }, []);

  // Sincronização manual
  const syncNow = useCallback(async () => {
    if (!isLoggedIn) {
      Alert.alert('Aviso', 'Faça login para sincronizar seus dados.');
      return;
    }
    if (!isOnline) {
      Alert.alert('Offline', 'Sem conexão no momento.');
      return;
    }

    try {
      setSyncing(true);
      await exportData();

      const backupPath = `${CACHE_DIR}sync-export.json`;
      const json = JSON.stringify({ user, exportedAt: new Date().toISOString() });

      await FS.writeAsStringAsync(backupPath, json, { encoding: 'utf8' });
      await uploadToCloud(JSON.parse(json) as ExportData);

      const now = new Date().toISOString();
      setLastSync(now);
      Alert.alert('Sincronizado', 'Backup sincronizado com sucesso!');
      console.log('🔁 Sincronização concluída em:', now);
    } catch (e) {
      console.error('Erro na sincronização:', e);
      Alert.alert('Erro', 'Não foi possível sincronizar.');
    } finally {
      setSyncing(false);
    }
  }, [isOnline, isLoggedIn, exportData, uploadToCloud, user, CACHE_DIR]);

  // Restauração local (pega o último backup)
  const restoreFromLocalBackup = useCallback(async () => {
    try {
      const files = await FS.readDirectoryAsync(DOCUMENT_DIR);
      const file = files.find((f: string) => f.startsWith('backup-estabiliza'));
      if (!file) {
        Alert.alert('Nenhum backup encontrado');
        return;
      }

      const content = await FS.readAsStringAsync(`${DOCUMENT_DIR}${file}`, {
        encoding: 'utf8',
      });

      await importData(content);
      Alert.alert('Backup restaurado', 'Dados recuperados com sucesso!');
      console.log('📦 Backup restaurado de', file);
    } catch (e) {
      console.error('Erro ao restaurar backup:', e);
      Alert.alert('Erro', 'Falha ao restaurar backup.');
    }
  }, [importData, DOCUMENT_DIR]);

  // Auto-sync a cada 10 min
  useEffect(() => {
    const itv = setInterval(() => {
      if (isOnline && isLoggedIn && !syncing) {
        console.log('⏱️ Auto-sync...');
        syncNow();
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(itv);
  }, [isOnline, isLoggedIn, syncing, syncNow]);

  return {
    isOnline,
    syncing,
    lastSync,
    syncNow,
    restoreFromLocalBackup,
    clearOldBackups,
    loading,
  };
}
