// src/screens/DashboardScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useStats } from "@/hooks/useStats";
import GlassCard from "@/components/GlassCard";
import ProgressCircle from "@/components/ProgressCircle";
import { Chart } from "@/components/Chart";
import { Button } from "@/components/Button";

export default function DashboardScreen() {
  // ✅ volta pro nome correto (era toggleTheme)
  const { theme, toggleTheme, isDark } = useTheme();
  const { stats, completionRates, summary } = useStats();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const colors = theme.colors;

  const sections = [
    {
      title: "Progresso Geral",
      data: [
        { label: "Tarefas", value: `${completionRates.taskRate}%`, color: colors.primary },
        { label: "Hábitos", value: `${completionRates.habitConsistency}%`, color: colors.success },
        { label: "Lembretes", value: `${completionRates.reminderRate}%`, color: colors.secondary },
      ],
    },
  ];

  const tips = [
    "Durma ao menos 6h por dia 😴",
    "Tome sol por 30 minutos ☀️",
    "Beba 2L de água 💧",
    "Evite excesso de tela 📱",
  ];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {/* HEADER */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>😊</Text>
            </View>
            <View>
              <Text style={styles.greeting}>{greeting}, Merian!</Text>
              <Text style={styles.subGreeting}>Continue firme no equilíbrio 🌿</Text>
            </View>
          </View>

          {/* ✅ volta toggleTheme */}
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={26}
              color={isDark ? "#FFD700" : "#FFF"}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* CONTEÚDO */}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* HUMOR */}
        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Seu Humor</Text>
          <View style={styles.moodRow}>
            <Text style={styles.moodEmoji}>😌</Text>
            <View>
              <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>
                Humor médio dos últimos dias
              </Text>
              <Text style={[styles.moodValue, { color: colors.success }]}>
                {summary.mood || "4.2 / 5"}
              </Text>
            </View>
          </View>
          <Chart
            title="Humor 7 dias"
            data={{
              labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
              values: [60, 80, 75, 70, 85, 90, 65],
            }}
          />
        </GlassCard>

        {/* PROGRESSO GERAL */}
        {sections.map((section, i) => (
          <GlassCard key={i}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
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
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.metricValue, { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        ))}

        {/* HÁBITOS DO DIA */}
        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hábitos do Dia</Text>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            {/* ✅ volta color no lugar de strokeColor */}
            <ProgressCircle progress={0.75} size={140} color={colors.primary} />
            <Text style={[styles.percentText, { color: colors.text }]}>75%</Text>
            <Text style={[styles.percentLabel, { color: colors.textSecondary }]}>
              de hábitos concluídos
            </Text>
          </View>
        </GlassCard>

        {/* DICAS */}
        <GlassCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dicas Rápidas</Text>
          {tips.map((tip, i) => (
            <Text key={i} style={[styles.tip, { color: colors.textSecondary }]}>
              • {tip}
            </Text>
          ))}
        </GlassCard>

        {/* AÇÕES */}
        <View style={styles.actions}>
          <Button title="Adicionar Lembrete" onPress={() => console.log("Ir para lembretes")} />
          <View style={{ height: 12 }} />
          <Button
            title="Registrar Humor"
            variant="secondary"
            onPress={() => console.log("Ir para humor")}
          />
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          Última atualização: {new Date(stats.generatedAt).toLocaleString("pt-BR")}
        </Text>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: {
    fontSize: 36,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  subGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  themeBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  container: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  chartWrapper: { marginBottom: 12 },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  metricItem: { alignItems: "center" },
  metricLabel: { fontSize: 13 },
  metricValue: { fontSize: 18, fontWeight: "bold" },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  moodEmoji: { fontSize: 60, marginRight: 16 },
  moodLabel: { fontSize: 13 },
  moodValue: { fontSize: 20, fontWeight: "700" },
  percentText: { fontSize: 36, fontWeight: "700", marginTop: 8 },
  percentLabel: { fontSize: 14 },
  tip: { fontSize: 14, marginBottom: 6 },
  actions: { marginTop: 16, marginBottom: 24 },
  footer: { textAlign: "center", fontSize: 12, marginBottom: 20 },
});
