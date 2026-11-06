import { DEFAULT_ACCENT } from './colorSchemes';
import { GAME_SCHEMA_VERSION, type Game, type Node } from '../types/node';
import type { AccentId } from '../types';
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
      description: '',
      // One blank trait directly inside the NPC (no nested "Traits" folder).
      children: [{ id: generateId(), name: 'New Trait', value: 1 }],
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
      { id: generateId(), name: 'NPCs', children: [] },
      { id: generateId(), name: 'Locations', children: [] },
      { id: generateId(), name: 'Scenes', children: [] },
    ],
  };
}

export function createGame(opts: {
  characterName?: string;
  accent?: AccentId;
} = {}): Game {
  const now = Date.now();
  return {
    version: GAME_SCHEMA_VERSION,
    id: generateId(),
    accent: opts.accent ?? DEFAULT_ACCENT,
    createdAt: now,
    updatedAt: now,
    character: createDefaultCharacter(opts.characterName),
    campaign: createDefaultCampaign(),
  };
}
