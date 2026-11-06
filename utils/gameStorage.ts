import AsyncStorage from '@react-native-async-storage/async-storage';
import { toAccent } from '../constants/colorSchemes';
import type { AccentId, ThemeMode } from '../types';
import type { Game } from '../types/node';
import { convertLegacyData, normalizeGame } from './gameFile';

/**
 * On-device persistence.
 *
 * Layout (one key per game, so editing a game never rewrites the others):
 *   viator:v2:index        GameSummary[]  — enough to draw the game list
 *   viator:v2:game:<id>    Game
 *   viator:v2:prefs        Prefs          — UI state, not part of any game
 *
 * Writes are debounced per game and flushed when the app is backgrounded or
 * the page is hidden. The index is cached in memory so a flush starts its
 * writes synchronously (important for the web, where the page may be closing).
 */

const PREFIX = 'viator:v2:';
const KEYS = {
  index: `${PREFIX}index`,
  prefs: `${PREFIX}prefs`,
  game: (id: string) => `${PREFIX}game:${id}`,
};
const LEGACY_KEYS = ['viator:characters', 'viator:campaigns', 'viator:activeEntry'];

const SAVE_DELAY_MS = 400;

export interface GameSummary {
  id: string;
  characterName: string;
  accent: AccentId;
  updatedAt: number;
}

export interface Prefs {
  activeGameId: string | null;
  /** Collapsed node IDs. UI state only. */
  collapsed: Record<string, true>;
  /** Light/dark choice. null = follow the device setting until the user picks one. */
  mode: ThemeMode | null;
  /** Favorited game IDs: pinned to the top of the Characters list. Device-local. */
  favorites: Record<string, true>;
  /** Oracle sections the user has opened (true) or closed (false). Unset = the section's default. */
  oracleOpen: Record<string, boolean>;
}

const DEFAULT_PREFS: Prefs = { activeGameId: null, collapsed: {}, mode: null, favorites: {}, oracleOpen: {} };

export function summarize(game: Game): GameSummary {
  return {
    id: game.id,
    characterName: game.character.name,
    accent: game.accent,
    updatedAt: game.updatedAt,
  };
}

// ─── Low-level helpers ───────────────────────────────────────────────────────
async function readJSON(key: string): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch (e) {
    console.warn(`[storage] could not read ${key}`, e);
    return null;
  }
}

function writeJSON(key: string, value: unknown): Promise<void> {
  return AsyncStorage.setItem(key, JSON.stringify(value)).catch((e) => {
    console.warn(`[storage] could not write ${key}`, e);
  });
}

// ─── Index ───────────────────────────────────────────────────────────────────
let indexCache: GameSummary[] = [];

/** Load the game list. Call once at startup before any save. */
export async function loadIndex(): Promise<GameSummary[]> {
  const raw = await readJSON(KEYS.index);
  // Entries written before accents existed carry `colorScheme` instead.
  indexCache = Array.isArray(raw)
    ? (raw as any[]).map(
        (s): GameSummary => ({
          id: s.id,
          characterName: s.characterName ?? '',
          accent: toAccent(s.accent ?? s.colorScheme),
          updatedAt: s.updatedAt ?? 0,
        }),
      )
    : [];
  return sortedIndex();
}

function sortedIndex(): GameSummary[] {
  return [...indexCache].sort((a, b) => b.updatedAt - a.updatedAt);
}

function upsertIndex(summary: GameSummary): void {
  indexCache = [summary, ...indexCache.filter((s) => s.id !== summary.id)];
}

// ─── Games ───────────────────────────────────────────────────────────────────
export async function loadGame(id: string): Promise<Game | null> {
  const raw = await readJSON(KEYS.game(id));
  if (!raw) return null;
  try {
    return normalizeGame(raw);
  } catch (e) {
    console.warn(`[storage] game ${id} is unreadable`, e);
    return null;
  }
}

const pending = new Map<string, Game>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Queue a save. Rapid edits to the same game collapse into one write. */
export function scheduleSave(game: Game): void {
  pending.set(game.id, game);
  upsertIndex(summarize(game));
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushSaves, SAVE_DELAY_MS);
}

/** Write everything queued right now. Safe to call at any time. */
export function flushSaves(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!pending.size) return Promise.resolve();
  const writes = [...pending.values()].map((g) => writeJSON(KEYS.game(g.id), g));
  pending.clear();
  writes.push(writeJSON(KEYS.index, indexCache));
  return Promise.all(writes).then(() => undefined);
}

/** Save immediately (new or imported games). */
export function saveGameNow(game: Game): Promise<void> {
  scheduleSave(game);
  return flushSaves();
}

export async function deleteGame(id: string): Promise<void> {
  pending.delete(id);
  indexCache = indexCache.filter((s) => s.id !== id);
  await Promise.all([AsyncStorage.removeItem(KEYS.game(id)), writeJSON(KEYS.index, indexCache)]);
}

export function listGames(): GameSummary[] {
  return sortedIndex();
}

// ─── Prefs ───────────────────────────────────────────────────────────────────
export async function loadPrefs(): Promise<Prefs> {
  const raw = (await readJSON(KEYS.prefs)) as Partial<Prefs> | null;
  const prefs = { ...DEFAULT_PREFS, ...(raw ?? {}) };
  if (prefs.mode !== 'light' && prefs.mode !== 'dark') prefs.mode = null;
  if (!prefs.favorites || typeof prefs.favorites !== 'object') prefs.favorites = {};
  if (!prefs.oracleOpen || typeof prefs.oracleOpen !== 'object') prefs.oracleOpen = {};
  return prefs;
}

export function savePrefs(prefs: Prefs): Promise<void> {
  return writeJSON(KEYS.prefs, prefs);
}

// ─── Legacy migration ────────────────────────────────────────────────────────
/**
 * One-time import of pre-overhaul saves. Runs only while the new index is
 * empty; the old keys are left in place (untouched) as a fallback.
 */
export async function migrateLegacyStorage(): Promise<number> {
  if (indexCache.length) return 0;
  const [chars, camps] = await Promise.all([readJSON(LEGACY_KEYS[0]), readJSON(LEGACY_KEYS[1])]);
  const characters = chars && typeof chars === 'object' ? Object.values(chars as object) : [];
  const campaigns = camps && typeof camps === 'object' ? Object.values(camps as object) : [];
  if (!characters.length && !campaigns.length) return 0;
  const games = convertLegacyData(characters, campaigns);
  games.forEach(scheduleSave);
  await flushSaves();
  return games.length;
}
