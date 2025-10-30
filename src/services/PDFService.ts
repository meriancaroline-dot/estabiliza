// src/services/PDFService.ts
// -------------------------------------------------------------
// Geração e compartilhamento de PDF estilizado do Estabiliza
// Mantém a estética do app (tema claro/escuro, cores vibrantes)
// -------------------------------------------------------------
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Theme } from "@/hooks/useTheme";

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export type ReportData = {
  mood: {
    average: number;
    goodDays: number;
    badDays: number;
    streak: number;
  };
  habits: {
    total: number;
    completed: number;
    consistency: number;
    bestHabit: string;
  };
  reminders: {
    total: number;
    done: number;
    pending: number;
  };
  summary: {
    performance: string;
    consistency: string;
    mood: string;
  };
};

export type ReportOptions = {
  stats: ReportData;
  periodLabel?: string;
  username?: string;
  theme?: Theme;
};

// -------------------------------------------------------------
// Geração do PDF
// -------------------------------------------------------------
export async function generatePDFReport(options: ReportOptions): Promise<string> {
  const {
    stats,
    periodLabel = "Relatório recente",
    username = "Usuário",
    theme,
  } = options;

  const colors = theme
    ? theme.colors
    : {
        primary: "#6C5CE7",
        secondary: "#00BCD4",
        success: "#2ecc71",
        warning: "#f1c40f",
        danger: "#e74c3c",
        text: "#1f2937",
        textSecondary: "#6b7280",
        background: "#ffffff",
        surface: "#f8fafc",
        border: "#e5e7eb",
      };

  const isDark = theme?.isDark ?? false;

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Relatório Estabiliza</title>
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          background: ${isDark ? colors.background : colors.surface};
          color: ${colors.text};
          padding: 32px;
        }

        h1 {
          text-align: center;
          color: ${colors.primary};
          font-size: 28px;
          margin-bottom: 4px;
        }

        h2 {
          color: ${colors.text};
          border-left: 5px solid ${colors.primary};
          padding-left: 8px;
          margin-top: 30px;
          font-size: 18px;
        }

        p, td, th {
          font-size: 14px;
        }

        .subtitle {
          text-align: center;
          color: ${colors.textSecondary};
          margin-bottom: 20px;
          font-size: 13px;
        }

        .grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-top: 16px;
        }

        .card {
          width: 48%;
          background: ${isDark ? colors.surface : colors.background};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .card h3 {
          color: ${colors.primary};
          font-size: 15px;
          margin-bottom: 4px;
        }

        .value {
          font-size: 24px;
          font-weight: 700;
          color: ${colors.text};
        }

        .section {
          margin-top: 24px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        th {
          text-align: left;
          font-size: 14px;
          color: ${colors.textSecondary};
          border-bottom: 1px solid ${colors.border};
          padding-bottom: 4px;
        }

        td {
          padding: 6px 0;
          font-size: 14px;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          color: ${colors.textSecondary};
          margin-top: 32px;
        }

        .tag {
          background: ${colors.primary}22;
          color: ${colors.primary};
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>Relatório de Progresso</h1>
      <p class="subtitle">${periodLabel} — Gerado por ${username}</p>

      <div class="section">
        <h2>Humor</h2>
        <div class="grid">
          <div class="card">
            <h3>Média</h3>
            <div class="value">${stats.mood.average.toFixed(1)} / 5</div>
          </div>
          <div class="card">
            <h3>Maior Sequência</h3>
            <div class="value">${stats.mood.streak}</div>
          </div>
          <div class="card">
            <h3>Dias Bons</h3>
            <div class="value">${stats.mood.goodDays}</div>
          </div>
          <div class="card">
            <h3>Dias Ruins</h3>
            <div class="value">${stats.mood.badDays}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Hábitos</h2>
        <div class="grid">
          <div class="card">
            <h3>Total</h3>
            <div class="value">${stats.habits.total}</div>
          </div>
          <div class="card">
            <h3>Concluídos</h3>
            <div class="value">${stats.habits.completed}</div>
          </div>
          <div class="card">
            <h3>Consistência</h3>
            <div class="value">${stats.habits.consistency}%</div>
          </div>
          <div class="card">
            <h3>Mais consistente</h3>
            <div class="value">${stats.habits.bestHabit}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Lembretes</h2>
        <div class="grid">
          <div class="card">
            <h3>Total</h3>
            <div class="value">${stats.reminders.total}</div>
          </div>
          <div class="card">
            <h3>Concluídos</h3>
            <div class="value">${stats.reminders.done}</div>
          </div>
          <div class="card">
            <h3>Pendentes</h3>
            <div class="value">${stats.reminders.pending}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Resumo</h2>
        <table>
          <tr>
            <th>Desempenho</th>
            <td>${stats.summary.performance}</td>
          </tr>
          <tr>
            <th>Consistência</th>
            <td>${stats.summary.consistency}</td>
          </tr>
          <tr>
            <th>Humor</th>
            <td>${stats.summary.mood}</td>
          </tr>
        </table>
      </div>

      <p class="footer">
        Estabiliza © ${new Date().getFullYear()}<br/>
        Gerado em ${new Date().toLocaleString("pt-BR")}
      </p>
    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

// -------------------------------------------------------------
// Compartilhamento do PDF
// -------------------------------------------------------------
export async function sharePDF(uri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Compartilhamento não disponível neste dispositivo.");
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Compartilhar relatório Estabiliza",
  });
}
