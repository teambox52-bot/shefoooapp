import React from 'react';
import { ColorSchemeName } from 'react-native';

type AppThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  themeMode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  colorScheme: NonNullable<ColorSchemeName>;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = React.useState<AppThemeMode>('light');

  const value = React.useMemo(
    () => ({
      themeMode,
      setThemeMode,
      colorScheme: themeMode,
    }),
    [themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = React.useContext(ThemeContext);

  if (!value) {
    return {
      themeMode: 'light' as const,
      setThemeMode: () => undefined,
      colorScheme: 'light' as const,
    };
  }

  return value;
}
