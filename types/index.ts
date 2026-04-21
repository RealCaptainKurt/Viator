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

// ─── NPC Types ───────────────────────────────────────────────────────────────
export interface NPCTrait {
  id: string;
  name: string;
  value: number;
}

export interface NPCItem {
  id: string;
  name: string;
  description: string;
  traits: NPCTrait[];
}

// ─── List Item Types ─────────────────────────────────────────────────────────
export interface TextListItem {
  id: string;
  name: string;
  content: string;
}

export interface NumberListItem {
  id: string;
  name: string;
  value: number;
}

// ─── Additional Component Types ──────────────────────────────────────────────
export interface AdditionalTextComponent {
  id: string;
  type: 'text';
  name: string;
  content: string;
}

export interface AdditionalNumberComponent {
  id: string;
  type: 'number';
  name: string;
  value: number;
}

export interface AdditionalNPCComponent {
  id: string;
  type: 'npc';
  name: string;
  description: string;
  traits: NPCTrait[];
}

export interface AdditionalTextListComponent {
  id: string;
  type: 'text-list';
  name: string;
  items: TextListItem[];
}

export interface AdditionalNumberListComponent {
  id: string;
  type: 'number-list';
  name: string;
  items: NumberListItem[];
}

export interface AdditionalNPCListComponent {
  id: string;
  type: 'npc-list';
  name: string;
  items: NPCItem[];
}

/** Shared additional component union — used by both Character and Campaign. */
export type AdditionalComponent =
  | AdditionalTextComponent
  | AdditionalNumberComponent
  | AdditionalNPCComponent
  | AdditionalTextListComponent
  | AdditionalNumberListComponent
  | AdditionalNPCListComponent;

// ─── Viator Character ────────────────────────────────────────────────────────
export interface Character {
  id: string;
  name: string;
  xp: number;
  description: string;
  traits: NumberListItem[];
  additionalComponents: AdditionalComponent[];
  /** Ordered list of section IDs. Base IDs: '__description', '__traits'. */
  sectionOrder?: string[];
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
  npcs: NPCItem[];
  locations: NamedItem[];
  scenes: NamedItem[];
  additionalComponents: AdditionalComponent[];
  /** Ordered list of section IDs. Base IDs: '__currentScene', '__npcs', '__locations', '__scenes'. */
  sectionOrder?: string[];
  colorScheme: ColorSchemeId;
  characterId: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Section Collapse State ──────────────────────────────────────────────────
export type CollapsedSections = Record<string, boolean>;
