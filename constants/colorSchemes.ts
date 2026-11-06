import type { AccentId, ThemeMode } from '../types';

/**
 * Theme = a neutral light/dark base (used for all reading surfaces) plus one of
 * eight accent colors (icons, bars, value boxes, active states).
 *
 * Components consume the flat `ColorScheme` object from `useScheme()`; it is
 * composed here from the two independent choices.
 */

// ─── Accents ─────────────────────────────────────────────────────────────────
// Each accent has two tuned shades: a deeper one that keeps text/icons legible
// on the light base, and a brighter one for the dark base.
export const ACCENTS: Record<AccentId, { label: string; light: string; dark: string }> = {
  crimson: { label: 'Crimson', light: '#b91c1c', dark: '#f87171' },
  amber: { label: 'Amber', light: '#c2410c', dark: '#fb923c' },
  gold: { label: 'Gold', light: '#a16207', dark: '#facc15' },
  verdant: { label: 'Verdant', light: '#15803d', dark: '#4ade80' },
  teal: { label: 'Teal', light: '#0f766e', dark: '#2dd4bf' },
  azure: { label: 'Azure', light: '#0369a1', dark: '#38bdf8' },
  violet: { label: 'Violet', light: '#6d28d9', dark: '#a78bfa' },
  rose: { label: 'Rose', light: '#be185d', dark: '#f472b6' },
};

export const ACCENT_IDS = Object.keys(ACCENTS) as AccentId[];
export const DEFAULT_ACCENT: AccentId = 'amber';
export const DEFAULT_MODE: ThemeMode = 'light';

export function isAccent(v: unknown): v is AccentId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(ACCENTS, v);
}

/**
 * Coerce a stored value to an accent. Understands the 16 pre-overhaul scheme
 * ids ('ancientTanLight', 'obsidian', …) by mapping each family to the
 * nearest accent.
 */
export function toAccent(v: unknown): AccentId {
  if (isAccent(v)) return v;
  if (typeof v !== 'string') return DEFAULT_ACCENT;
  const family = v.replace(/(Dark|Light)$/, '');
  return LEGACY_FAMILIES[family] ?? DEFAULT_ACCENT;
}

const LEGACY_FAMILIES: Record<string, AccentId> = {
  obsidian: 'teal',
  ancientTan: 'amber',
  peacefulPink: 'rose',
  hardlightBlue: 'azure',
  alchemicalGold: 'gold',
  magicalPurple: 'violet',
  monsterGreen: 'verdant',
  apocalypseRed: 'crimson',
};

// ─── Color helpers ───────────────────────────────────────────────────────────
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Blend `top` over `base` by `amount` (0–1) into a solid hex color. */
function mix(base: string, top: string, amount: number): string {
  const a = rgb(base);
  const b = rgb(top);
  const out = a.map((c, i) => Math.round(c + (b[i] - c) * amount));
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

// ─── Base palettes ───────────────────────────────────────────────────────────
interface Base {
  background: string;
  gradientStart: string;
  gradientEnd: string;
  surface: string;
  surfaceSolid: string;
  surfaceBorder: string;
  inputBackground: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  destructive: string;
}

const BASES: Record<ThemeMode, Base> = {
  light: {
    background: '#f6f5f2',
    gradientStart: '#faf9f7',
    gradientEnd: '#eeede8',
    surface: 'rgba(255, 255, 255, 0.72)',
    surfaceSolid: '#ffffff',
    surfaceBorder: 'rgba(28, 28, 32, 0.12)',
    inputBackground: 'rgba(28, 28, 32, 0.045)',
    text: '#1c1c20',
    textSecondary: '#4b4b55',
    textMuted: 'rgba(75, 75, 85, 0.6)',
    destructive: '#c62828',
  },
  dark: {
    background: '#121316',
    gradientStart: '#181a1e',
    gradientEnd: '#0d0e10',
    surface: 'rgba(255, 255, 255, 0.055)',
    surfaceSolid: '#1d1f24',
    surfaceBorder: 'rgba(255, 255, 255, 0.11)',
    inputBackground: 'rgba(255, 255, 255, 0.07)',
    text: '#ececf1',
    textSecondary: '#a9a9b6',
    textMuted: 'rgba(169, 169, 182, 0.6)',
    destructive: '#ff6b6b',
  },
};

// ─── Composed scheme ─────────────────────────────────────────────────────────
export interface ColorScheme {
  mode: ThemeMode;
  accent: AccentId;

  // Neutral — reading surfaces
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  surface: string; // translucent card base
  surfaceSolid: string; // opaque surface (modals)
  surfaceBorder: string;
  inputBackground: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  destructive: string;
  blurTint: 'light' | 'dark';

  // Accent — icons, bars, value boxes, active states
  primary: string; // accent for icons / text on the base (hex, so `+ '33'` alpha works)
  primaryMuted: string; // faint accent wash (value boxes, banners)
  bar: string; // solid accent-tinted fill for the tab bar and top bar
  barBorder: string;
}

const cache = new Map<string, ColorScheme>();

/** The flat scheme for a mode + accent. Results are cached (16 combinations). */
export function buildScheme(mode: ThemeMode, accent: AccentId): ColorScheme {
  const key = `${mode}:${accent}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const base = BASES[mode];
  const primary = ACCENTS[accent][mode];
  const dark = mode === 'dark';

  const scheme: ColorScheme = {
    mode,
    accent,
    background: base.background,
    backgroundGradientStart: base.gradientStart,
    backgroundGradientEnd: base.gradientEnd,
    surface: base.surface,
    surfaceSolid: base.surfaceSolid,
    surfaceBorder: base.surfaceBorder,
    inputBackground: base.inputBackground,
    text: base.text,
    textSecondary: base.textSecondary,
    textMuted: base.textMuted,
    destructive: base.destructive,
    blurTint: mode,
    primary,
    primaryMuted: withAlpha(primary, dark ? 0.16 : 0.1),
    bar: mix(base.background, primary, dark ? 0.12 : 0.07),
    barBorder: withAlpha(primary, dark ? 0.32 : 0.28),
  };
  cache.set(key, scheme);
  return scheme;
}
