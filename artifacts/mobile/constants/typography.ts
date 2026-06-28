import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  headlineXlMobile: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.56,
  },
  headlineLg: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  headlineMd: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  vitalsDisplay: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1.08,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
};
