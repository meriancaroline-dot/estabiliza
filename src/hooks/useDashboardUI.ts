import { useMemo } from "react";
import { useStats } from "@/hooks/useStats";
import { useTheme } from "@/hooks/useTheme";

// -------------------------------------------------------------
// Hook responsável por gerar os dados prontos pro Dashboard
// -------------------------------------------------------------
export function useDashboardUI() {
  const { stats, completionRates, summary } = useStats();
  const { theme } = useTheme();

  // -----------------------------------------------------------
  // Seções de dados do dashboard (cards e gráficos)
  // -----------------------------------------------------------
  const sections = useMemo(
    () => [
      {
        title: "Tarefas e Hábitos",
        data: [
          {
            label: "Tarefas concluídas",
            value: `${completionRates.taskRate}%`,
            color: theme.colors.primary,
          },
          {
            label: "Consistência de hábitos",
            value: `${completionRates.habitConsistency}%`,
            color: theme.colors.success,
          },
          {
            label: "Lembretes cumpridos",
            value: `${completionRates.reminderRate}%`,
            color: theme.colors.secondary,
          },
        ],
      },
      {
        title: "Humor e Progresso",
        data: [
          {
            label: "Média de humor",
            value: `${stats.moodAverage?.toFixed(1) ?? "0.0"}/5`,
            color: theme.colors.warning,
          },
          {
            label: "Maior sequência",
            value: `${stats.streakLongest ?? 0}`,
            color: theme.colors.success,
          },
        ],
      },
    ],
    [completionRates, stats, theme.colors]
  );

  // -----------------------------------------------------------
  // Dicas dinâmicas — geradas conforme progresso
  // -----------------------------------------------------------
  const tips = useMemo(() => {
    const baseTips = [
      "Mantenha pequenas vitórias diárias.",
      "Reflita sobre seu humor e celebre o equilíbrio.",
      "Hábitos consistentes valem mais do que intensos.",
      "Respire fundo. O progresso não precisa ser perfeito.",
      "Reveja suas metas com gentileza, não com culpa.",
    ];

    if (completionRates.taskRate > 80)
      baseTips.unshift("Excelente progresso! Continue firme!");
    if ((stats.streakLongest ?? 0) >= 7)

      baseTips.unshift("🔥 Uma semana de consistência! Incrível!");

    return baseTips.slice(0, 5);
  }, [completionRates.taskRate, stats.streakLongest]);

  return { stats, sections, summary, tips };
}
