import { useColorScheme } from 'react-native';
import { DEFAULT_ACCENT, DEFAULT_MODE, buildScheme, type ColorScheme } from '../constants/colorSchemes';
import { useGameStore } from '../store/gameStore';
import type { ThemeMode } from '../types';

/** Light or dark: the saved choice, else the device setting. */
export function useThemeMode(): ThemeMode {
  const saved = useGameStore((s) => s.prefs.mode);
  const system = useColorScheme();
  return saved ?? (system === 'dark' || system === 'light' ? system : DEFAULT_MODE);
}

/** Current theme: the device's light/dark mode + the open game's accent. */
export function useScheme(): ColorScheme {
  const mode = useThemeMode();
  const accent = useGameStore((s) => s.game?.accent);
  return buildScheme(mode, accent ?? DEFAULT_ACCENT);
}
