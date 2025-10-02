const tintColorLight = '#d19310'; // Amarillo principal
const tintColorDark = '#d19310';

export default {
  light: {
    text: '#d19310', // Amarillo principal
    background: '#0F172A', // Teal muy oscuro
    cardBackground: '#1E293B', // Teal oscuro para tarjetas
    accent: '#d19310', // Naranja para botones
    primary: '#0F172A', // Teal muy oscuro
    secondary: '#d19310', // Amarillo
    white: '#FFFFFF',
    gray: '#94A3B8',
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    // Gradientes
    premiumGradient: ['#fb923c4D', '#14b8a64D', '#9333ea4D'] as const, // orange-400/30, teal-500/30, purple-600/30
    heroGradient: ['#1E293B', '#0F172A'] as const, // Teal oscuro a teal medio
  },
  dark: {
    text: '#d19310', // Amarillo principal
    background: '#0F172A', // Teal muy oscuro
    cardBackground: '#1E293B', // Teal oscuro para tarjetas
    accent: '#d19310', // Naranja para botones
    primary: '#0F172A', // Teal muy oscuro
    secondary: '#d19310', // Amarillo
    white: '#FFFFFF',
    gray: '#94A3B8',
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    // Gradientes
    premiumGradient: ['#fb923c4D', '#14b8a64D', '#9333ea4D'] as const, // orange-400/30, teal-500/30, purple-600/30
    heroGradient: ['#1E293B', '#0F172A'] as const, // Teal oscuro a teal medio
  },
};
