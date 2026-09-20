// src/constants/theme.ts
/**
 * Palette de couleurs + design tokens de l'application SSI.
 * 4 thèmes disponibles :
 *  - 'darkBlue'   : noir + bleu sombre (défaut)
 *  - 'orangeRed'  : sombre + accent orangered
 *  - 'light'      : clair + accent bleu
 *  - 'blueDark'   : bleu sombre + accent bleu clair
 */

import '@/global.css';
import { Platform } from 'react-native';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export type ThemeName = 'darkBlue' | 'orangeRed' | 'light' | 'blueDark';

export interface ThemeColors {
  /** Fond principal de l'app */
  background: string;
  /** Fond légèrement plus clair (cartes, header) */
  surface: string;
  /** Fond des éléments interactifs (inputs, boutons secondaires) */
  surfaceAlt: string;
  /** Bordure douce */
  border: string;

  /** Couleur d'accent (boutons, liens, éléments actifs) */
  primary: string;
  /** Accent plus clair (hover, gradients) */
  primarySoft: string;
  /** Texte sur fond primary */
  onPrimary: string;

  /** Texte principal */
  text: string;
  /** Texte secondaire (descriptions, sous-titres) */
  textSecondary: string;
  /** Texte très discret (placeholders, méta) */
  textMuted: string;

  /** Couleurs sémantiques */
  success: string;
  warning: string;
  danger: string;
  info: string;

  /** Onglet inactif / actif */
  tabInactive: string;
  tabActive: string;

  /** Ombre / overlay */
  overlay: string;
}

// ------------------------------------------------------------------
// Palettes
// ------------------------------------------------------------------
const darkBlue: ThemeColors = {
  background: '#0A0E1A',
  surface: '#111827',
  surfaceAlt: '#0C1B46',
  border: '#1F2A44',

  primary: '#2563EB',
  primarySoft: '#3B82F6',
  onPrimary: '#FFFFFF',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',

  tabInactive: '#64748B',
  tabActive: '#3B82F6',

  overlay: 'rgba(0,0,0,0.6)',
};

const orangeRed: ThemeColors = {
  background: '#14100E',
  surface: '#1F1815',
  surfaceAlt: '#2A201C',
  border: '#3A2B24',

  primary: '#FF4500',
  primarySoft: '#FF6A33',
  onPrimary: '#FFFFFF',

  text: '#FDF6F3',
  textSecondary: '#C9B8B0',
  textMuted: '#8A756C',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',

  tabInactive: '#8A756C',
  tabActive: '#FF4500',

  overlay: 'rgba(0,0,0,0.6)',
};

const light: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F7F8FA',
  surfaceAlt: '#EEF1F5',
  border: '#E2E8F0',

  primary: '#2563EB',
  primarySoft: '#3B82F6',
  onPrimary: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',

  tabInactive: '#94A3B8',
  tabActive: '#2563EB',

  overlay: 'rgba(0,0,0,0.4)',
};

const blueDark: ThemeColors = {
  background: '#0B1626',
  surface: '#122036',
  surfaceAlt: '#1A2C48',
  border: '#22385A',

  primary: '#38BDF8',
  primarySoft: '#7DD3FC',
  onPrimary: '#0B1626',

  text: '#F0F9FF',
  textSecondary: '#93B4D0',
  textMuted: '#5A7896',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',

  tabInactive: '#5A7896',
  tabActive: '#38BDF8',

  overlay: 'rgba(0,0,0,0.55)',
};

export const Themes: Record<ThemeName, ThemeColors> = {
  darkBlue,
  orangeRed,
  light,
  blueDark,
};

/** Métadonnées pour l'écran de sélection de thème */
export const ThemeMeta: Record<
  ThemeName,
  { label: string; preview: string; accent: string }
> = {
  darkBlue:  { label: 'Nuit bleue',  preview: '#0A0E1A', accent: '#2563EB' },
  orangeRed: { label: 'Orange feu',  preview: '#14100E', accent: '#FF4500' },
  light:     { label: 'Clair',       preview: '#FFFFFF', accent: '#2563EB' },
  blueDark:  { label: 'Bleu océan',  preview: '#0B1626', accent: '#38BDF8' },
};

// ------------------------------------------------------------------
// Spacing / Radius / Typo
// ------------------------------------------------------------------
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

export const BottomTabInset = Platform.select({ ios: 70, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Nom affiché dans le header */
export const APP_NAME = 'SSI';
export const APP_SUBTITLE = 'SIM SOMGANDE';