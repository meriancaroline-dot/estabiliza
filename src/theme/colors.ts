// src/theme/colors.ts
// -------------------------------------------------------------
// Paleta de cores do Estabiliza - TEMA PASTEL SUAVE
// Contém variações para temas claro e escuro
// -------------------------------------------------------------

export const lightColors = {
  // ====== Cores principais - Pastel Suave ======
  primary: "#B4A5D9", // Lavanda suave
  secondary: "#D4B5E8", // Lilás pastel claro
  success: "#A8D5BA", // Verde menta suave
  warning: "#FFE8C5", // Pêssego claro
  danger: "#FFB4C8", // Rosa bebê

  // ====== Fundo e superfície - Tons creme ======
  background: "#FDFBF7", // Off-white quente
  surface: "#F7F3EE", // Bege claríssimo

  // ====== Texto - Mais suave ======
  text: "#4A4458", // Cinza arroxeado suave
  textSecondary: "#9B8FA9", // Lavanda acinzentado

  // ====== Bordas e neutros - Tom pastel ======
  border: "#E8E3DC", // Bege claro
  neutral: {
    100: "#FDFBF7",
    200: "#F7F3EE",
    300: "#EFE9E1",
    400: "#E8E3DC",
    500: "#C9C1B8",
    600: "#9B8FA9",
    700: "#7A6E8C",
    800: "#5A5068",
    900: "#4A4458",
  },

  // ====== Extras ======
  muted: "#B8ADBE",
  glass: "rgba(253, 251, 247, 0.7)", // transparência suave
  overlay: "rgba(180, 165, 217, 0.08)", // overlay lavanda suave
  
  // ====== Cores adicionais para variação ======
  accent: {
    lavender: "#D4C5E8",
    mint: "#C8E6D0",
    peach: "#FFD4B8",
    rose: "#FFC9D6",
    sky: "#C5D9F0",
  },
};

export const darkColors = {
  // ====== Cores principais - Pastel para dark ======
  primary: "#9B88C7", // Lavanda mais profundo
  secondary: "#B89DD4", // Lilás médio
  success: "#8BC5A0",
  warning: "#EBCFA0",
  danger: "#E89AAE",

  // ====== Fundo e superfície - Tons escuros suaves ======
  background: "#1E1A24", // Roxo escuro muito suave
  surface: "#2A2533", // Lavanda escuro

  // ====== Texto - Clarinho ======
  text: "#F0EBF4", // Quase branco com toque lavanda
  textSecondary: "#C4B8D0", // Lavanda claro

  // ====== Bordas e neutros ======
  border: "#3D3548",
  neutral: {
    100: "#1E1A24",
    200: "#2A2533",
    300: "#3D3548",
    400: "#504A5C",
    500: "#6B6476",
    600: "#8F849E",
    700: "#AFA5BC",
    800: "#CFC7D8",
    900: "#F0EBF4",
  },

  // ====== Extras ======
  muted: "#7D7289",
  glass: "rgba(155, 136, 199, 0.15)",
  overlay: "rgba(180, 165, 217, 0.12)",
  
  // ====== Cores adicionais para variação ======
  accent: {
    lavender: "#A893C9",
    mint: "#7BB596",
    peach: "#D4B89A",
    rose: "#D48FA8",
    sky: "#8BACC7",
  },
};