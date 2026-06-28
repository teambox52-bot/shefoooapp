import colors from "@/constants/colors";
import { useAppTheme } from "@/theme/ThemeProvider";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 * When a sibling web artifact's dark tokens are synced into a `dark`
 * key, this hook will automatically switch palettes based on the
 * app theme setting.
 */
export function useColors() {
  const { colorScheme } = useAppTheme();
  const palette = colors[colorScheme];
  return { ...palette, radius: colors.radius };
}
