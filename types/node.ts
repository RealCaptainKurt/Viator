import type { AccentId } from './index';

// ─── Node ────────────────────────────────────────────────────────────────────
/**
 * The single building block for everything on a character or campaign page.
 *
 * Each attachment is an optional field; its presence *is* the attachment.
 *   - Adding the number attachment sets `value: 0`; removing it deletes the key.
 *   - `children: undefined` → no sub-list. `children: []` → has a sub-list that
 *     is currently empty (UI shows an "add" affordance).
 *   - `description: ''` → attached but empty (UI shows an empty text box).
 */
export interface Node {
  id: string;
  name: string;

  /** Number attachment (XP, level, rating…). Unbounded. */
  value?: number;
  /** Text attachment, displayed as a collapsible text box. */
  description?: string;
  /** Sub-object attachment. Nests without limit. */
  children?: Node[];
}

// ─── Game ────────────────────────────────────────────────────────────────────
export const GAME_SCHEMA_VERSION = 1;

/** One save. Contains both trees; each is shown on its own page. */
export interface Game {
  /** Bumped when the shape changes so future saves can be migrated. */
  version: typeof GAME_SCHEMA_VERSION;
  id: string;
  /** Accent color for this game (the light/dark mode is a device preference). */
  accent: AccentId;
  createdAt: number;
  updatedAt: number;
  /** Root of the Character page. name = character name, value = XP. */
  character: Node;
  /** Root of the Campaign page. name = campaign name. */
  campaign: Node;
}

export type GamePage = 'character' | 'campaign';
