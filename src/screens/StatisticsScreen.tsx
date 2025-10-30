// src/screens/StatisticsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useStats } from "@/hooks/useStats";
import GlassCard from "@/components/GlassCard";
import { Chart } from "@/components/Chart";
import { Button } from "@/components/Button";
import { generatePDFReport, sharePDF, ReportData } from "@/services/PDFService";

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const { stats, completionRates, summary } = useStats();
  const [loading, setLoading] = useState(false);

  const colors = theme.colors;

  // summary vem assim:
  // { performance: string; consistency: string; mood: string }
  // vamos transformar isso em números pra jogar no PDF
  const summaryToNumber = (value: string): number => {
    const v = value.toLowerCase();
    if (v.includes("ótimo") || v.includes("excelente")) return 90;
    if (v.includes("bom")) return 75;
    if (v.includes("ok") || v.includes("regular")) return 60;
    if (v.includes("ruim")) return 40;
    return 70; // default
  };

  const handleGenerate = async (period: "weekly" | "monthly") => {
    try {
      setLoading(true);

      const reportData: ReportData = {
        mood: {
          // se o summary.mood for "Bom", vira número
          average: summaryToNumber(summary.mood) / 20, // vira escala 1..5
          goodDays: 5,
          badDays: 2,
          streak: 3,
        },
        habits: {
          total: 10,
          completed: Math.round((completionRates.habitConsistency / 100) * 10),
          consistency: completionRates.habitConsistency,
          bestHabit: "Meditação",
        },
        reminders: {
          total: 8,
          done: Math.round((completionRates.reminderRate / 100) * 8),
          pending: 8 - Math.round((completionRates.reminderRate / 100) * 8),
        },
        summary: {
          productivity: summaryToNumber(summary.performance),
          balance: summaryToNumber(summary.consistency),
          wellBeing: summaryToNumber(summary.mood),
        },
      };

      const periodLabel = period === "weekly" ? "Relatório Semanal" : "Relatório Mensal";

      const uri = await generatePDFReport({
        stats: reportData,
        periodLabel,
        username: "Merian",
      });

      await sharePDF(uri);

      Alert.alert("Sucesso", "PDF gerado e pronto pra compartilhar!");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>Estatísticas</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Veja seus dados e exporte para PDF.
      </Text>

      {/* HUMOR */}
      <GlassCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Humor</Text>
        <Chart
          title="Últimos 7 dias"
          data={{
            labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            values: [60, 75, 80, 70, 85, 90, 65],
          }}
        />
        <Text style={[styles.rowText, { color: colors.textSecondary }]}>
          Resumo: {summary.mood}
        </Text>
      </GlassCard>

      {/* HÁBITOS */}
      <GlassCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hábitos</Text>
        <Text style={[styles.rowText, { color: colors.textSecondary }]}>
          Consistência: {completionRates.habitConsistency}%
        </Text>
      </GlassCard>

      {/* LEMBRETES */}
      <GlassCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lembretes</Text>
        <Text style={[styles.rowText, { color: colors.textSecondary }]}>
          Conclusão: {completionRates.reminderRate}%
        </Text>
      </GlassCard>

      {/* EXPORTAR */}
      <View style={{ marginTop: 20, gap: 12 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Exportar Relatórios</Text>
        <Button
          title="Relatório Semanal (PDF)"
          onPress={() => handleGenerate("weekly")}
        />
        <Button
          title="Relatório Mensal (PDF)"
          variant="secondary"
          onPress={() => handleGenerate("monthly")}
        />
      </View>

      {loading && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <Text style={[styles.footer, { color: colors.textSecondary }]}>
        Última atualização: {new Date(stats.generatedAt).toLocaleString("pt-BR")}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  rowText: { fontSize: 14, marginBottom: 4 },
  footer: { textAlign: "center", marginTop: 24, fontSize: 12 },
});
