const colors = {
  light: {
    // Legacy aliases (used by scaffold components like ErrorBoundary, tabs)
    text: '#1b1b1b',
    tint: '#0051d5',
    background: '#F8FAFC',
    foreground: '#1b1b1b',
    card: '#FFFFFF',
    cardForeground: '#1b1b1b',
    primary: '#0051d5',
    primaryForeground: '#ffffff',
    secondary: '#f3f3f3',
    secondaryForeground: '#1b1b1b',
    muted: '#f3f3f3',
    mutedForeground: '#4c4546',
    accent: '#dbe1ff',
    accentForeground: '#0051d5',
    destructive: '#ba1a1a',
    destructiveForeground: '#ffffff',
    border: '#cfc4c5',
    input: '#f3f3f3',

    // HealthSync brand tokens
    brand: '#000000',
    brandForeground: '#ffffff',
    actionBlue: '#0051d5',
    actionBlueForeground: '#ffffff',
    actionBlueContainer: '#346cef',
    actionBlueSoft: '#dbe1ff',

    // Surfaces
    surfaceBackground: '#F8FAFC',
    surface: '#f9f9f9',
    surfaceCard: '#FFFFFF',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f3f3f3',
    surfaceContainer: '#eeeeee',
    surfaceContainerHigh: '#e8e8e8',

    // Text roles
    onSurface: '#1b1b1b',
    onSurfaceVariant: '#4c4546',

    // Borders
    outline: '#7e7576',
    outlineVariant: '#cfc4c5',

    // Error
    errorColor: '#ba1a1a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    // Vitals status
    vitalsNormal: '#10B981',
    vitalsInfo: '#3B82F6',
    vitalsElevated: '#F59E0B',
    vitalsCritical: '#EF4444',
  },
  dark: {
    // Legacy aliases (used by scaffold components like ErrorBoundary, tabs)
    text: '#F4FAFA',
    tint: '#33D6FF',
    background: '#071015',
    foreground: '#F4FAFA',
    card: '#112231',
    cardForeground: '#F4FAFA',
    primary: '#33D6FF',
    primaryForeground: '#041017',
    secondary: '#0E1A24',
    secondaryForeground: '#F4FAFA',
    muted: '#122434',
    mutedForeground: '#A8B7C2',
    accent: '#123B4C',
    accentForeground: '#33D6FF',
    destructive: '#FF6B6B',
    destructiveForeground: '#08111A',
    border: 'rgba(255,255,255,0.08)',
    input: '#0E1A24',

    // HealthSync brand tokens
    brand: '#F4FAFA',
    brandForeground: '#071015',
    actionBlue: '#33D6FF',
    actionBlueForeground: '#041017',
    actionBlueContainer: '#0B5CFF',
    actionBlueSoft: 'rgba(51,214,255,0.14)',

    // Surfaces
    surfaceBackground: '#071015',
    surface: '#08111A',
    surfaceCard: '#112231',
    surfaceContainerLowest: '#0B1822',
    surfaceContainerLow: '#0E1A24',
    surfaceContainer: '#132535',
    surfaceContainerHigh: '#1A3042',

    // Text roles
    onSurface: '#F4FAFA',
    onSurfaceVariant: '#A8B7C2',

    // Borders
    outline: '#6F8190',
    outlineVariant: 'rgba(255,255,255,0.12)',

    // Error
    errorColor: '#FF6B6B',
    errorContainer: 'rgba(255,107,107,0.16)',
    onErrorContainer: '#FFD8D8',

    // Vitals status
    vitalsNormal: '#18E0C2',
    vitalsInfo: '#33D6FF',
    vitalsElevated: '#FBBF24',
    vitalsCritical: '#FF5C7A',
  },
  radius: 12,
};

export default colors;
