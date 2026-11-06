import { COLOR_SCHEMES, DEFAULT_SCHEME, type ColorScheme } from '../constants/colorSchemes';
import { useGameStore } from '../store/gameStore';

/** The open game's color scheme, or the default when no game is open. */
export function useScheme(): ColorScheme {
  const id = useGameStore((s) => s.game?.colorScheme);
  return COLOR_SCHEMES[id ?? DEFAULT_SCHEME] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
}
