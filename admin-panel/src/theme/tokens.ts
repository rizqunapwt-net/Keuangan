/**
 * Design Tokens - Modern & Minimalist System
 * Personality: Trustworthy, Secure, Professional
 *
 * Color system designed for financial applications with:
 * - Clear visual hierarchy and accessibility (WCAG AA+)
 * - Balance between minimalism and clarity
 * - Professional trust-building aesthetic
 */

export const colors = {
  // ═══════════════════════════════════════════
  // Flat color strings — use these for direct CSS styling
  // e.g. style={{ color: colors.primary }}
  // ═══════════════════════════════════════════
  primary: '#0d9488',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#2563eb',

  // Legacy format support
  primaryHover: '#0f766e',
  primaryLight: '#ccfbf1',
  primarySubtle: '#f0fdfa',
  accent: '#2563eb',
  accentLight: '#dbeafe',
  successLight: '#dcfce7',
  warningLight: '#fef3c7',
  dangerLight: '#fee2e2',
  infoLight: '#dbeafe',

  // ═══════════════════════════════════════════
  // Shade scales — use these when you need specific shades
  // e.g. colors.primaryScale[50] for lightest
  // ═══════════════════════════════════════════
  primaryScale: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  successScale: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  warningScale: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  dangerScale: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  infoScale: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// Spacing System (8px base unit for consistency)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  // Semantic names for backwards compatibility
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

// Typography Sizes - Inter typeface optimized
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
} as const;

// Font weights for semantic emphasis
export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// Line heights for readable text
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// Border Radius - Consistent scaling
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  base: 10,
  lg: 14,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Shadows - Layering and depth system
export const shadow = {
  none: 'none',
  xs: '0 1px 3px rgba(0,0,0,0.03)',
  sm: '0 2px 8px rgba(0,0,0,0.04)',
  base: '0 2px 12px rgba(0,0,0,0.04)',
  md: '0 4px 16px rgba(0,0,0,0.06)',
  lg: '0 8px 25px rgba(0,0,0,0.08)',
  xl: '0 12px 35px rgba(0,0,0,0.10)',
  elevated: '0 10px 30px rgba(0,0,0,0.08)',
  hover: '0 8px 25px rgba(0,0,0,0.10)',
} as const;

export const transition = {
  fast: '0.15s ease',
  base: '0.25s ease',
  slow: '0.35s ease',
} as const;

// Z-Index Stack - Layering hierarchy
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  backdrop: 400,
  modal: 500,
  notification: 600,
  tooltip: 700,
} as const;

// Responsive breakpoints
export const breakpoints = {
  xs: 320,    // Mobile
  sm: 640,    // Tablet
  md: 768,    // Medium
  lg: 1024,   // Desktop
  xl: 1280,   // Desktop XL
  '2xl': 1536, // Desktop 2XL
} as const;

// Component-specific semantic colors
export const statColors = {
  sales: { bg: colors.primarySubtle, icon: colors.primary, text: colors.primary },
  debt: { bg: colors.warningLight, icon: colors.warning, text: colors.warning },
  expense: { bg: colors.dangerLight, icon: colors.danger, text: colors.danger },
  profit: { bg: colors.successLight, icon: colors.success, text: colors.success },
} as const;

// Additional semantic color combinations
export const semanticColors = {
  success: {
    bg: colors.successScale[50],
    border: colors.successScale[200],
    text: colors.successScale[700],
    icon: colors.successScale[600],
  },
  warning: {
    bg: colors.warningScale[50],
    border: colors.warningScale[200],
    text: colors.warningScale[700],
    icon: colors.warningScale[600],
  },
  danger: {
    bg: colors.dangerScale[50],
    border: colors.dangerScale[200],
    text: colors.dangerScale[700],
    icon: colors.dangerScale[600],
  },
  info: {
    bg: colors.infoScale[50],
    border: colors.infoScale[200],
    text: colors.infoScale[700],
    icon: colors.infoScale[600],
  },
  primary: {
    bg: colors.primaryScale[50],
    border: colors.primaryScale[200],
    text: colors.primaryScale[700],
    icon: colors.primaryScale[600],
  },
} as const;
