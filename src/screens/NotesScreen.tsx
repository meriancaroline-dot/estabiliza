import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/types/models';

export default function NotesScreen() {
  const { theme } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // -----------------------------------------------------------
  // Salvar ou atualizar nota
  // -----------------------------------------------------------
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) return;

    try {
      if (editingId) {
        await updateNote(editingId, {
          title: trimmedTitle || 'Sem título',
          content: trimmedContent,
        });
        Alert.alert('✅ Atualizado', 'A nota foi atualizada com sucesso.');
      } else {
        await addNote({
          title: trimmedTitle || 'Sem título',
          content: trimmedContent,
        });
        Alert.alert('📝 Salvo', 'Nova nota adicionada.');
      }
      setTitle('');
      setContent('');
      setEditingId(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a nota.');
    }
  };

  // -----------------------------------------------------------
  // Editar nota existente
  // -----------------------------------------------------------
  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  // -----------------------------------------------------------
  // Excluir nota
  // -----------------------------------------------------------
  const handleDelete = (id: string) => {
    Alert.alert('Excluir nota', 'Tem certeza que deseja excluir esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNote(id);
          } catch {
            Alert.alert('Erro', 'Falha ao excluir a nota.');
          }
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // Renderizar item da lista
  // -----------------------------------------------------------
  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.noteItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        {item.content ? (
          <Text style={styles.noteContent}>{item.content}</Text>
        ) : null}
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // -----------------------------------------------------------
  // Renderização principal
  // -----------------------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suas Anotações</Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Título da nota"
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.input}
        />

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Escreva aqui o conteúdo..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>
            {editingId ? 'Atualizar' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...notes].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma nota ainda.</Text>
        }
      />
    </View>
  );
}

// -----------------------------------------------------------
// 💅 Estilos
// -----------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderColor: theme.colors.border,
      borderWidth: 1,
      marginBottom: theme.spacing.sm,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
    noteItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    noteTitle: {
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 4,
    },
    noteContent: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    noteActions: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: theme.spacing.sm,
    },
    actionText: {
      fontSize: 18,
    },
    separator: {
      height: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
    },
  });
