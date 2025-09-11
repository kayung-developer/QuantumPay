// This file defines our application's design system tokens.

export const colors = {
    primary: {
        light: '#6D28D9',
        DEFAULT: '#4F46E5',
        dark: '#3730A3',
    },
    secondary: {
        light: '#10B981',
        DEFAULT: '#059669',
        dark: '#047857',
    },
    neutral: {
        '50': '#F8FAFC',
        '100': '#F1F5F9',
        '200': '#E2E8F0',
        '300': '#CBD5E1',
        '400': '#94A3B8',
        '500': '#64748B',
        '600': '#475569',
        '700': '#334155',
        '800': '#1E293B',
        '900': '#0F172A',
        '950': '#020617',
    },
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
};

export const fonts = {
    sans: 'Inter-Regular',
    'sans-medium': 'Inter-Medium',
    'sans-semibold': 'Inter-SemiBold',
    'sans-bold': 'Inter-Bold',
    display: 'Lexend-SemiBold',
    'display-bold': 'Lexend-Bold',
};

export const theme = {
    colors,
    fonts,
};

export default theme;