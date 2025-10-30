// src/theme/index.ts
// -------------------------------------------------------------
// Exporta o tema completo (light e dark)
// -------------------------------------------------------------

import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

export const shadows = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const zIndex = {
  background: 0,
  content: 1,
  modal: 10,
  toast: 20,
  overlay: 30,
};

export const lightTheme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  mode: 'light' as const,
};

export const darkTheme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  mode: 'dark' as const,
};

export type Theme = typeof lightTheme | typeof darkTheme;
