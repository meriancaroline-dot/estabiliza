// src/screens/RemindersScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Reminder } from '@/types/models';
import { useReminders } from '@/hooks/useReminders';
import { useNotifications } from '@/hooks/useNotifications';

// Util simples pra DD/MM/YYYY
function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

export default function RemindersScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
  } = useReminders();

  // opcional: se o hook existir/estiver configurado, usamos; se não, só ignoramos
  const notif = (() => {
    try {
      return useNotifications();
    } catch {
      return null as any;
    }
  })();

  // -----------------------------------------------------------
  // UI state (modal criar/editar)
  // -----------------------------------------------------------
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [time, setTime] = useState(''); // HH:mm

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
  };

  const openCreate = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description ?? '');
    setDate(r.date);
    setTime(r.time);
    setVisible(true);
  };

  // -----------------------------------------------------------
  // Salvar (criar/editar)
  // -----------------------------------------------------------
  const onSave = async () => {
    const cleanTitle = title.trim();
    const cleanDate = date.trim();
    const cleanTime = time.trim();

    if (!cleanTitle) {
      Alert.alert('Campo obrigatório', 'O título é obrigatório.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      Alert.alert('Data inválida', 'Use o formato YYYY-MM-DD.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(cleanTime)) {
      Alert.alert('Hora inválida', 'Use o formato HH:mm.');
      return;
    }

    try {
      if (editingId) {
        await updateReminder(editingId, {
          title: cleanTitle,
          description: description.trim() || undefined,
          date: cleanDate,
          time: cleanTime,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addReminder({
          title: cleanTitle,
          description: description.trim() || undefined,
          date: cleanDate,
          time: cleanTime,
          repeat: 'none',
        });
      }

      // Agenda notificação (opcional) — só se houver hook/permite
      if (notif?.scheduleReminder) {
        try {
          await notif.scheduleReminder({
            id: editingId ?? 'temp',
            title: cleanTitle,
            description: description.trim() || undefined,
            date: cleanDate,
            time: cleanTime,
          });
        } catch (e) {
          // silencioso: se falhar notificação, não quebra UX
          console.warn('⚠️ Falha ao agendar notificação do lembrete:', e);
        }
      }

      setVisible(false);
      resetForm();
    } catch (e) {
      console.error('Erro ao salvar lembrete:', e);
      Alert.alert('Erro', 'Não foi possível salvar o lembrete.');
    }
  };

  // -----------------------------------------------------------
  // Concluir / Desconcluir
  // -----------------------------------------------------------
  const toggleComplete = async (r: Reminder) => {
    try {
      await updateReminder(r.id, { isCompleted: !r.isCompleted });
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar status do lembrete.');
    }
  };

  // -----------------------------------------------------------
  // Excluir
  // -----------------------------------------------------------
  const onDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir este lembrete?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(id);
          } catch {
            Alert.alert('Erro', 'Falha ao excluir o lembrete.');
          }
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // Render item
  // -----------------------------------------------------------
  const renderItem = ({ item }: { item: Reminder }) => {
    const when = `${formatDate(item.date)} • ${item.time}`;
    return (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <Text style={[styles.itemTitle, item.isCompleted && styles.done]}>{item.title}</Text>
          {!!item.description && (
            <Text style={[styles.itemDesc, item.isCompleted && styles.doneMuted]}>
              {item.description}
            </Text>
          )}
          <Text style={styles.itemMeta}>
            {when} {item.repeat && item.repeat !== 'none' ? `• ${ptRepeat(item.repeat)}` : ''}
          </Text>
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity
            onPress={() => toggleComplete(item)}
            style={[
              styles.actionBtn,
              item.isCompleted ? styles.neutral : styles.primary,
            ]}
          >
            <Text style={styles.actionTxt}>
              {item.isCompleted ? 'Reabrir' : 'Concluir'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, styles.outline]}>
            <Text style={styles.actionTxt}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionBtn, styles.danger]}>
            <Text style={styles.actionTxt}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lembretes</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={reminders}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={reminders.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Você ainda não tem lembretes. Crie o primeiro e eu te cutuco na hora certa. ⏰
          </Text>
        }
      />

      {/* Modal criar/editar */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar lembrete' : 'Novo lembrete'}</Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Tomar remédio"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex.: 1 comprimido após o almoço"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2025-10-28"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Hora (HH:mm)</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="08:00"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  resetForm();
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={styles.btnGhostTxt}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSave} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryTxt}>{editingId ? 'Salvar' : 'Criar'}</Text>
              </TouchableOpacity>
            </View>

            {!!notif?.scheduleReminder && (
              <Text style={styles.helperNote}>
                * Notificação será agendada automaticamente após salvar.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ptRepeat(rep: NonNullable<Reminder['repeat']>) {
  switch (rep) {
    case 'daily':
      return 'Diária';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensal';
    default:
      return '';
  }
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.lg,
    },
    emptyContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    item: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    itemLeft: { flex: 1 },
    itemTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    done: {
      textDecorationLine: 'line-through',
      opacity: 0.65,
    },
    itemDesc: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    doneMuted: {
      opacity: 0.6,
    },
    itemMeta: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 6,
    },
    actionsCol: {
      alignItems: 'flex-end',
      gap: 6,
    },
    actionBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
    },
    actionTxt: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    outline: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    neutral: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    danger: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.danger,
    },
    // Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    modalCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    label: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: 4,
      fontSize: 13,
    },
    input: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: theme.spacing.lg,
    },
    btn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    },
    btnGhost: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    btnGhostTxt: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    btnPrimaryTxt: {
      color: '#fff',
      fontWeight: '700',
    },
    helperNote: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  });
