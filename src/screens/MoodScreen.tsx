// src/screens/MoodScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useMood } from '@/hooks/useMood';

export default function MoodScreen() {
  const { theme } = useTheme();
  const { moods, addMood, deleteMood } = useMood();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // -----------------------------------------------------------
  // Tabela de opções visuais + valor numérico (rating)
  // -----------------------------------------------------------
  const moodOptions = [
    { id: 'muito_feliz', label: 'Muito feliz', emoji: '😁', color: '#FFD93D', rating: 5 },
    { id: 'feliz', label: 'Feliz', emoji: '🙂', color: '#F9E076', rating: 4 },
    { id: 'neutro', label: 'Neutro', emoji: '😐', color: '#A0AEC0', rating: 3 },
    { id: 'triste', label: 'Triste', emoji: '😔', color: '#7D8597', rating: 2 },
    { id: 'muito_triste', label: 'Muito triste', emoji: '😭', color: '#64748B', rating: 1 },
  ];

  const periods = [
    { id: 'morning', label: '🌅 Manhã' },
    { id: 'afternoon', label: '🌞 Tarde' },
    { id: 'night', label: '🌙 Noite' },
  ];

  // -----------------------------------------------------------
  // Salvar humor
  // -----------------------------------------------------------
  const saveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Selecione um humor', 'Escolha como você está se sentindo.');
      return;
    }

    try {
      const chosen = moodOptions.find((m) => m.id === selectedMood);
      await addMood(selectedPeriod, chosen?.label ?? 'Neutro', chosen?.emoji ?? '😐', chosen?.rating ?? 3);
      Alert.alert('Registrado', `Humor da ${periods.find(p => p.id === selectedPeriod)?.label} salvo!`);
      setSelectedMood(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o humor.');
    }
  };

  // -----------------------------------------------------------
  // Excluir registro
  // -----------------------------------------------------------
  const onDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir este registro de humor?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMood(id);
          } catch {
            Alert.alert('Erro', 'Falha ao excluir o registro.');
          }
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // Renderiza um item do histórico
  // -----------------------------------------------------------
  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.historyItem}>
        <Text style={styles.historyEmoji}>{item.emoji}</Text>
        <View style={styles.historyTextBlock}>
          <Text style={styles.historyLabel}>
            {item.mood} ({item.period === 'morning' ? 'manhã' : item.period === 'afternoon' ? 'tarde' : 'noite'})
          </Text>
          <Text style={styles.historyDate}>{item.date}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // -----------------------------------------------------------
  // Renderização
  // -----------------------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como você está se sentindo?</Text>

      {/* Selecionar período */}
      <View style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setSelectedPeriod(p.id as any)}
            style={[
              styles.periodBtn,
              selectedPeriod === p.id && { backgroundColor: theme.colors.primary + '33', borderColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[
                styles.periodTxt,
                selectedPeriod === p.id && { color: theme.colors.primary, fontWeight: '700' },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selecionar humor */}
      <View style={styles.moodSelector}>
        {moodOptions.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => setSelectedMood(m.id)}
            style={[
              styles.moodButton,
              { backgroundColor: m.color + '22' },
              selectedMood === m.id && { borderColor: m.color, borderWidth: 2 },
            ]}
          >
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                selectedMood === m.id && { color: m.color, fontWeight: '700' },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={saveMood} style={styles.saveButton}>
        <Text style={styles.saveText}>Salvar Humor</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Últimos registros</Text>
      <FlatList
        data={[...moods].reverse()}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum registro ainda.</Text>}
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
      marginBottom: theme.spacing.md,
    },
    periodSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.md,
    },
    periodBtn: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    periodTxt: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    moodSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: theme.spacing.lg,
    },
    moodButton: {
      flexBasis: '48%',
      alignItems: 'center',
      paddingVertical: 16,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    moodEmoji: {
      fontSize: 28,
    },
    moodLabel: {
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontSize: 14,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    saveText: {
      color: '#fff',
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    historyEmoji: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    historyTextBlock: { flex: 1 },
    historyLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
    historyDate: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
    deleteText: { fontSize: 18 },
    separator: { height: 10 },
    emptyText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.lg },
  });
