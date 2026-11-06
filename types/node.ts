import type { ColorSchemeId } from './index';

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

  /**
   * Label for this node's own number. Overrides the parent's childValueLabel.
   * Mainly for roots (no parent) and template-built nodes like NPCs.
   */
  valueLabel?: string;
  /** Default label for the numbers of this node's direct children, e.g. "XP". */
  childValueLabel?: string;
}

/** Resolve the label to show next to a node's number. */
export function resolveValueLabel(node: Node, parent: Node | null): string | undefined {
  return node.valueLabel ?? parent?.childValueLabel;
}

// ─── Game ────────────────────────────────────────────────────────────────────
export const GAME_SCHEMA_VERSION = 1;

/** One save. Contains both trees; each is shown on its own page. */
export interface Game {
  /** Bumped when the shape changes so future saves can be migrated. */
  version: typeof GAME_SCHEMA_VERSION;
  id: string;
  colorScheme: ColorSchemeId;
  createdAt: number;
  updatedAt: number;
  /** Root of the Character page. name = character name, value = XP. */
  character: Node;
  /** Root of the Campaign page. name = campaign name. */
  campaign: Node;
}

export type GamePage = 'character' | 'campaign';
