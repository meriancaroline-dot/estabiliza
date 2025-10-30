import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Button,
} from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/hooks/useTheme';
import { useBackup } from '@/hooks/useBackup';
import { useAutoBackup } from '@/hooks/useAutoBackup';

type ThemeChoice = 'light' | 'dark' | 'system';

export default function SettingsScreen(): JSX.Element {
  const { theme } = useTheme();
  const { user, updatePreferences } = useUser();
  const { exportData, importData, getLastBackup, clearOldBackups, loading } = useBackup();
  const { backupEnabled, toggleAutoBackup, runAutoBackup, lastAutoBackup, permissionGranted } =
    useAutoBackup();

  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    user?.preferences?.notificationsEnabled ?? true,
  );
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>(
    user?.preferences?.themeMode ?? 'system',
  );
  const [reminderTime, setReminderTime] = useState<string>(
    user?.preferences?.dailyReminderTime ?? '08:00',
  );
  const [processing, setProcessing] = useState<boolean>(false);

  const styles = useMemo(() => makeStyles(theme), [theme]);

  const handleSavePrefs = useCallback(async () => {
    try {
      await updatePreferences({
        notificationsEnabled: notifEnabled,
        themeMode: themeChoice,
        dailyReminderTime: reminderTime,
      });
      Alert.alert('Preferências salvas', 'Suas configurações foram atualizadas.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as preferências.');
    }
  }, [notifEnabled, themeChoice, reminderTime, updatePreferences]);

  const handleExport = useCallback(async () => {
    try {
      setProcessing(true);
      await exportData();
      Alert.alert('Backup criado', 'O arquivo .json foi salvo no diretório do app.');
    } catch {
      Alert.alert('Erro', 'Falha ao exportar backup.');
    } finally {
      setProcessing(false);
    }
  }, [exportData]);

  const handleImportLast = useCallback(async () => {
    try {
      setProcessing(true);
      const json = await getLastBackup();
      if (!json) {
        Alert.alert('Nenhum backup encontrado', 'Crie um backup antes de restaurar.');
        return;
      }
      await importData(json);
      Alert.alert('Backup restaurado', 'Dados importados com sucesso.');
    } catch {
      Alert.alert('Erro', 'Falha ao restaurar backup.');
    } finally {
      setProcessing(false);
    }
  }, [getLastBackup, importData]);

  const handleClearOld = useCallback(async () => {
    try {
      setProcessing(true);
      await clearOldBackups();
      Alert.alert('Limpeza concluída', 'Backups antigos foram removidos (mantidos 5 recentes).');
    } catch {
      Alert.alert('Erro', 'Falha ao limpar backups antigos.');
    } finally {
      setProcessing(false);
    }
  }, [clearOldBackups]);

  const handleRunAutoBackup = useCallback(async () => {
    try {
      setProcessing(true);
      await runAutoBackup();
      Alert.alert('Backup automático', 'Backup automático executado agora.');
    } catch {
      Alert.alert('Erro', 'Falha ao executar backup automático.');
    } finally {
      setProcessing(false);
    }
  }, [runAutoBackup]);

  const themeLabel = useMemo(() => {
    if (themeChoice === 'system') return 'Sistema';
    if (themeChoice === 'dark') return 'Escuro';
    return 'Claro';
  }, [themeChoice]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Configurações</Text>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Ativar notificações</Text>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              thumbColor={notifEnabled ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lembrete diário (HH:mm)</Text>
            <TextInput
              value={reminderTime}
              onChangeText={setReminderTime}
              style={styles.input}
              placeholder="08:00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <Button title="Salvar preferências" onPress={handleSavePrefs} />
        </View>

        {/* Tema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <Text style={styles.paragraph}>Modo atual: {themeLabel}</Text>
          <View style={styles.rowSpace}>
            <Button title="Claro" onPress={() => setThemeChoice('light')} />
            <Button title="Escuro" onPress={() => setThemeChoice('dark')} />
            <Button title="Sistema" onPress={() => setThemeChoice('system')} />
          </View>
        </View>

        {/* Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup</Text>
          <Text style={styles.paragraph}>
            Backup automático: {backupEnabled ? 'Ativado' : 'Desativado'}{' '}
            {!permissionGranted ? '(sem permissão)' : ''}
          </Text>
          <View style={styles.rowSpace}>
            <Button
              title={backupEnabled ? 'Desativar Auto Backup' : 'Ativar Auto Backup'}
              onPress={toggleAutoBackup}
            />
            <Button title="Rodar auto backup agora" onPress={handleRunAutoBackup} />
          </View>
          <View style={styles.rowSpace}>
            <Button title="Criar backup agora" onPress={handleExport} />
            <Button title="Restaurar último backup" onPress={handleImportLast} />
          </View>
          <View style={styles.rowSpace}>
            <Button title="Limpar backups antigos" onPress={handleClearOld} />
          </View>
          <Text style={styles.small}>
            {lastAutoBackup ? `Último auto-backup: ${lastAutoBackup}` : 'Sem auto-backup ainda.'}
          </Text>
        </View>

        {(loading || processing) && (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.paragraph}>Processando…</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 16, gap: 16 },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowSpace: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    label: { fontSize: 16, color: theme.colors.text, flex: 1 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 100,
      textAlign: 'center',
    },
    paragraph: { fontSize: 14, color: theme.colors.textSecondary },
    small: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 },
    loading: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  });
}
