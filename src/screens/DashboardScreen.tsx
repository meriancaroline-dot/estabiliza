import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useStats } from "@/hooks/useStats";
import { Chart } from "@/components/Chart";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { stats, completionRates, summary } = useStats();

  const sections = [
    {
      title: "Progresso Geral",
      data: [
        { label: "Tarefas", value: `${completionRates.taskRate}%`, color: theme.colors.primary },
        { label: "Hábitos", value: `${completionRates.habitConsistency}%`, color: theme.colors.success },
        { label: "Lembretes", value: `${completionRates.reminderRate}%`, color: theme.colors.secondary },
      ],
    },
    {
      title: "Humor médio (últimos dias)",
      data: [
        { label: "Dom", value: "65%", color: "#60a5fa" },
        { label: "Seg", value: "80%", color: "#34d399" },
        { label: "Ter", value: "75%", color: "#facc15" },
        { label: "Qua", value: "70%", color: "#fb923c" },
        { label: "Qui", value: "85%", color: "#4ade80" },
        { label: "Sex", value: "90%", color: "#22d3ee" },
        { label: "Sáb", value: "60%", color: "#f87171" },
      ],
    },
  ];

  const tips = [
    "Durma ao menos 6h por dia 😴",
    "Tome sol por 30 minutos ☀️",
    "Beba 2L de água 💧",
    "Mantenha pausas e evite excesso de tela 📱",
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Veja seu progresso, constância e humor.
      </Text>

      {/* Resumo */}
      <Card title="Resumo">
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>{summary.performance}</Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>{summary.consistency}</Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>{summary.mood}</Text>
      </Card>

      {/* Seções */}
      {sections.map((section, i) => (
        <Card key={i} title={section.title}>
          <View style={styles.chartWrapper}>
            <Chart
              title={section.title}
              data={{
                labels: section.data.map((d) => d.label),
                values: section.data.map((d) => parseFloat(d.value.replace("%", "")) || 0),
              }}
            />
          </View>

          <View style={styles.metricsContainer}>
            {section.data.map((item) => (
              <View key={item.label} style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.metricValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </Card>
      ))}

      {/* Dicas */}
      <Card title="Dicas para manter o equilíbrio">
        {tips.map((tip, i) => (
          <Text key={i} style={[styles.tip, { color: theme.colors.text }]}>
            • {tip}
          </Text>
        ))}
      </Card>

      {/* Ações */}
      <View style={styles.actions}>
        <Button title="Ver hábitos" onPress={() => console.log("Ir para hábitos")} />
        <View style={{ height: 8 }} />
        <Button title="Ver tarefas" variant="secondary" onPress={() => console.log("Ir para tarefas")} />
      </View>

      {/* Rodapé */}
      <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
        Última atualização: {new Date(stats.generatedAt).toLocaleString("pt-BR")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 16 },
  summaryText: { fontSize: 15, marginBottom: 4 },
  chartWrapper: { marginBottom: 12 },
  metricsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 6 },
  metricItem: { alignItems: "center" },
  metricLabel: { fontSize: 13 },
  metricValue: { fontSize: 18, fontWeight: "bold" },
  tip: { fontSize: 14, marginBottom: 6 },
  actions: { marginTop: 16, marginBottom: 24 },
  footer: { textAlign: "center", fontSize: 12, marginBottom: 20 },
});
