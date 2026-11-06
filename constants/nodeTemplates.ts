import { DEFAULT_SCHEME } from './colorSchemes';
import { GAME_SCHEMA_VERSION, type Game, type Node } from '../types/node';
import type { ColorSchemeId } from '../types';
import { generateId } from '../utils/id';

// ─── "Add…" templates ────────────────────────────────────────────────────────
/** Pre-shaped nodes offered when adding a child. Add entries here to expand. */
export interface NodeTemplate {
  id: string;
  label: string;
  create: (name?: string) => Node;
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: 'blank',
    label: 'Blank node',
    create: (name = 'New Node') => ({ id: generateId(), name }),
  },
  {
    id: 'trait',
    label: 'Trait',
    create: (name = 'New Trait') => ({ id: generateId(), name, value: 1 }),
  },
  {
    id: 'npc',
    label: 'NPC',
    create: (name = 'New NPC') => ({
      id: generateId(),
      name,
      value: 0,
      valueLabel: 'XP',
      description: '',
      children: [{ id: generateId(), name: 'Traits', children: [] }],
    }),
  },
];

// ─── New game defaults ───────────────────────────────────────────────────────
// Ordinary nodes: they can all be renamed, edited or deleted.

export function createDefaultCharacter(name = 'New Character'): Node {
  return {
    id: generateId(),
    name,
    value: 0,
    valueLabel: 'XP',
    description: '',
    children: [{ id: generateId(), name: 'Traits', children: [] }],
  };
}

export function createDefaultCampaign(name = 'New Campaign'): Node {
  return {
    id: generateId(),
    name,
    children: [
      { id: generateId(), name: 'Current Scene', description: '' },
      { id: generateId(), name: 'NPCs', childValueLabel: 'XP', children: [] },
      { id: generateId(), name: 'Locations', children: [] },
      { id: generateId(), name: 'Scenes', children: [] },
    ],
  };
}

export function createGame(opts: {
  characterName?: string;
  campaignName?: string;
  colorScheme?: ColorSchemeId;
} = {}): Game {
  const now = Date.now();
  return {
    version: GAME_SCHEMA_VERSION,
    id: generateId(),
    colorScheme: opts.colorScheme ?? DEFAULT_SCHEME,
    createdAt: now,
    updatedAt: now,
    character: createDefaultCharacter(opts.characterName),
    campaign: createDefaultCampaign(opts.campaignName),
  };
}
