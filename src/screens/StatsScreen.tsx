// src/screens/StatsScreen.tsx
// -------------------------------------------------------------
// 📊 Tela de Estatísticas — visão geral do progresso
// -------------------------------------------------------------
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useStats } from '@/hooks/useStats';

// -------------------------------------------------------------
// Tela principal
// -------------------------------------------------------------
export default function StatsScreen() {
  const { theme } = useTheme();
  const { stats, completionRates, summary } = useStats();

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Estatísticas Gerais</Text>
      <Text style={styles.subtitle}>
        Um resumo do seu progresso, conquistas e hábitos.
      </Text>

      {/* Cards principais */}
      <View style={styles.cardGrid}>
        <StatCard
          label="Lembretes Criados"
          value={stats?.totalReminders ?? 0}
          color={theme.colors.primary}
        />
        <StatCard
          label="Lembretes Concluídos"
          value={stats?.completedReminders ?? 0}
          color={theme.colors.success}
        />
        <StatCard
          label="Hábitos Ativos"
          value={stats?.activeHabits ?? 0}
          color={theme.colors.secondary}
        />
        <StatCard
          label="Tarefas Concluídas"
          value={stats?.completedTasks ?? 0}
          color={theme.colors.success}
        />
        <StatCard
          label="Média de Humor"
          value={stats?.moodAverage ? stats.moodAverage.toFixed(1) : '—'}
          color={theme.colors.warning}
        />
        <StatCard
          label="Maior Sequência"
          value={stats?.streakLongest ?? 0}
          color={theme.colors.danger}
        />
      </View>

      {/* Taxas de conclusão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taxas de Conclusão (%)</Text>
        <StatRow
          label="Lembretes"
          value={completionRates.reminderRate}
          color={theme.colors.primary}
        />
        <StatRow
          label="Tarefas"
          value={completionRates.taskRate}
          color={theme.colors.success}
        />
        <StatRow
          label="Consistência de Hábitos"
          value={completionRates.habitConsistency}
          color={theme.colors.secondary}
        />
      </View>

      {/* Resumo textual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <Text style={styles.summaryText}>📈 Desempenho: {summary.performance}</Text>
        <Text style={styles.summaryText}>🔁 Consistência: {summary.consistency}</Text>
        <Text style={styles.summaryText}>😊 Humor: {summary.mood}</Text>
      </View>

      <Text style={styles.updatedAt}>
        Última atualização:{' '}
        {stats?.generatedAt ? formatDate(stats.generatedAt) : 'Desconhecida'}
      </Text>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// 📦 Componentes auxiliares
// -------------------------------------------------------------
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <View
    style={{
      backgroundColor: color + '15',
      borderColor: color + '55',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      flex: 1,
      minWidth: '45%',
      margin: 6,
    }}
  >
    <Text
      style={{
        fontSize: 28,
        fontWeight: '700',
        color,
        textAlign: 'center',
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        color,
        textAlign: 'center',
        marginTop: 4,
        fontSize: 13,
        fontWeight: '600',
      }}
    >
      {label}
    </Text>
  </View>
);

const StatRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
    <Text style={{ color: themeColor(color, 0.8), fontSize: 14 }}>{label}</Text>
    <Text style={{ color: themeColor(color, 1), fontWeight: '700' }}>
      {value.toFixed(1)}%
    </Text>
  </View>
);

function themeColor(color: string, opacity: number) {
  return color + Math.round(opacity * 255).toString(16);
}

// -------------------------------------------------------------
// 🗓️ Helper
// -------------------------------------------------------------
function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

// -------------------------------------------------------------
// 💅 Estilos
// -------------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    cardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 6,
    },
    summaryText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginBottom: 4,
    },
    updatedAt: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginBottom: theme.spacing.xl,
    },
  });
