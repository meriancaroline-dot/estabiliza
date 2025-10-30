// src/screens/TasksScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/models';

export default function TasksScreen() {
  const { theme } = useTheme();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  const openCreate = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (t: Task) => {
    setEditingId(t.id);
    setTitle(t.title);
    setDescription(t.description ?? '');
    setVisible(true);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'O título é obrigatório.');
      return;
    }
    try {
      if (editingId) {
        await updateTask(editingId, {
          title: title.trim(),
          description: description.trim() || undefined,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addTask({
          title: title.trim(),
          description: description.trim() || undefined,
        });
      }
      setVisible(false);
      resetForm();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a tarefa.');
    }
  };

  const toggleComplete = async (t: Task) => {
    try {
      await updateTask(t.id, { completed: !t.completed });
    } catch {
      Alert.alert('Erro', 'Falha ao atualizar a tarefa.');
    }
  };

  const onDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(id);
          } catch {
            Alert.alert('Erro', 'Falha ao excluir.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={() => toggleComplete(item)}
        style={[styles.checkbox, item.completed && styles.checkedBox]}
      >
        {item.completed && <Text style={styles.checkIcon}>✔</Text>}
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemTitle,
            item.completed && { textDecorationLine: 'line-through', opacity: 0.7 },
          ]}
        >
          {item.title}
        </Text>
        {!!item.description && (
          <Text style={styles.itemDesc}>{item.description}</Text>
        )}
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, styles.outline]}>
          <Text style={styles.actionTxt}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionBtn, styles.danger]}>
          <Text style={styles.actionTxt}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={tasks.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma tarefa criada ainda 📝</Text>
        }
      />

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Editar tarefa' : 'Nova tarefa'}
            </Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Estudar React Native"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Detalhes..."
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
                <Text style={styles.btnPrimaryTxt}>
                  {editingId ? 'Salvar' : 'Criar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
      justifyContent: 'space-between',
      alignItems: 'center',
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
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    checkedBox: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '33',
    },
    checkIcon: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    itemContent: { flex: 1 },
    itemTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    itemDesc: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    itemActions: {
      gap: 6,
      alignItems: 'flex-end',
    },
    actionBtn: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionTxt: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '600',
    },
    outline: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    danger: {
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.background,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
      alignItems: 'center',
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
  });
