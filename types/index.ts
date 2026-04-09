// ─── Color Schemes ──────────────────────────────────────────────────────────
export type ColorSchemeId =
  | 'midnight'
  | 'forest'
  | 'ember'
  | 'arctic'
  | 'amethyst'
  | 'obsidian';

// ─── Shared Components ──────────────────────────────────────────────────────
export interface Trait {
  id: string;
  name: string;
  level: number; // 1–6
}

export interface NamedItem {
  id: string;
  name: string;
  description: string;
}

export interface AdditionalTextComponent {
  id: string;
  type: 'text';
  name: string;
  content: string;
}

export interface AdditionalListComponent {
  id: string;
  type: 'list';
  name: string;
  items: NamedItem[];
}

export interface AdditionalNumberComponent {
  id: string;
  type: 'number';
  name: string;
  value: number;
}

/** Shared additional component union — used by both Character and Campaign. */
export type AdditionalComponent =
  | AdditionalTextComponent
  | AdditionalListComponent
  | AdditionalNumberComponent;

// ─── Viator Character ────────────────────────────────────────────────────────
export interface Character {
  id: string;
  name: string;
  xp: number;
  description: string;
  traits: Trait[];
  additionalComponents: AdditionalComponent[];
  colorScheme: ColorSchemeId;
  campaignId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Campaign ────────────────────────────────────────────────────────────────
export interface Campaign {
  id: string;
  name: string;
  currentScene: string;
  npcs: NamedItem[];
  locations: NamedItem[];
  scenes: NamedItem[];
  additionalComponents: AdditionalComponent[];
  colorScheme: ColorSchemeId;
  characterId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Section Collapse State ──────────────────────────────────────────────────
export type CollapsedSections = Record<string, boolean>;
