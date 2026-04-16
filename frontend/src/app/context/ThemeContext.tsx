import { createContext, useContext, useState, ReactNode } from 'react';

export type PaletteKey = 'midnight' | 'ocean' | 'forest' | 'luxe';

export interface Palette {
  key: PaletteKey;
  name: string;
  description: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;
  border: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  success: string;
  warning: string;
  danger: string;
  gradient: string;
  accentGradient: string;
  chart1: string;
  chart2: string;
  chart3: string;
  swatches: string[];
}

export const palettes: Record<PaletteKey, Palette> = {
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    description: 'Deep purple vibes — bold, crypto-native aesthetic.',
    bg: '#080012',
    surface: '#140A28',
    surfaceAlt: '#1E1040',
    surfaceHover: '#2A1558',
    border: '#3D1A6E',
    primary: '#8B3DFF',
    primaryLight: '#B07FFF',
    primaryDark: '#6A1FCC',
    onPrimary: '#FFFFFF',
    accent: '#F5E642',
    onAccent: '#1A1400',
    text: '#FFFFFF',
    textMuted: '#B89FD4',
    textSubtle: '#6A4D8A',
    success: '#4ADE80',
    warning: '#F59E0B',
    danger: '#F87171',
    gradient: 'linear-gradient(135deg, #8B3DFF 0%, #5B1FBF 100%)',
    accentGradient: 'linear-gradient(135deg, #F5E642 0%, #D4B800 100%)',
    chart1: '#8B3DFF',
    chart2: '#F5E642',
    chart3: '#4ADE80',
    swatches: ['#080012', '#140A28', '#8B3DFF', '#F5E642', '#4ADE80'],
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean',
    description: 'Navy blue meets coral — professional, finance-grade trust.',
    bg: '#020B1A',
    surface: '#071628',
    surfaceAlt: '#0D2040',
    surfaceHover: '#132A54',
    border: '#1A3A6E',
    primary: '#2563EB',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',
    onPrimary: '#FFFFFF',
    accent: '#FF6B47',
    onAccent: '#FFFFFF',
    text: '#E8F4FD',
    textMuted: '#6BA3C8',
    textSubtle: '#3A6080',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    accentGradient: 'linear-gradient(135deg, #FF8C70 0%, #FF6B47 100%)',
    chart1: '#3B82F6',
    chart2: '#FF6B47',
    chart3: '#34D399',
    swatches: ['#020B1A', '#071628', '#2563EB', '#FF6B47', '#34D399'],
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    description: 'Dark teal with electric lime — growth-focused, earthy premium.',
    bg: '#020A10',
    surface: '#071420',
    surfaceAlt: '#0C1E30',
    surfaceHover: '#112840',
    border: '#173A52',
    primary: '#00C896',
    primaryLight: '#34E5B2',
    primaryDark: '#008C6A',
    onPrimary: '#001A12',
    accent: '#AAFF40',
    onAccent: '#0A2000',
    text: '#E8FDF5',
    textMuted: '#5CB89A',
    textSubtle: '#2D6B58',
    success: '#00C896',
    warning: '#F59E0B',
    danger: '#F87171',
    gradient: 'linear-gradient(135deg, #00C896 0%, #007A5E 100%)',
    accentGradient: 'linear-gradient(135deg, #AAFF40 0%, #80CC20 100%)',
    chart1: '#00C896',
    chart2: '#AAFF40',
    chart3: '#34E5B2',
    swatches: ['#020A10', '#071420', '#00C896', '#AAFF40', '#34E5B2'],
  },
  luxe: {
    key: 'luxe',
    name: 'Luxe',
    description: "Charcoal & gold — premium, collector's edition feel.",
    bg: '#09090F',
    surface: '#141420',
    surfaceAlt: '#1E1E30',
    surfaceHover: '#282840',
    border: '#32324A',
    primary: '#E8B423',
    primaryLight: '#F0CC60',
    primaryDark: '#A07810',
    onPrimary: '#1A1200',
    accent: '#C4A5FF',
    onAccent: '#1A0040',
    text: '#F5F0E8',
    textMuted: '#A09AA8',
    textSubtle: '#585466',
    success: '#4ADE80',
    warning: '#E8B423',
    danger: '#F87171',
    gradient: 'linear-gradient(135deg, #E8B423 0%, #A07810 100%)',
    accentGradient: 'linear-gradient(135deg, #C4A5FF 0%, #9055FF 100%)',
    chart1: '#E8B423',
    chart2: '#C4A5FF',
    chart3: '#4ADE80',
    swatches: ['#09090F', '#141420', '#E8B423', '#C4A5FF', '#4ADE80'],
  },
};

interface ThemeContextType {
  palette: Palette;
  paletteKey: PaletteKey;
  setPalette: (key: PaletteKey) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('midnight');
  return (
    <ThemeContext.Provider value={{ palette: palettes[paletteKey], paletteKey, setPalette: setPaletteKey }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
