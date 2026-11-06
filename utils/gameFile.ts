import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';
import { createDefaultCampaign, createDefaultCharacter } from '../constants/nodeTemplates';
import type { Campaign, Character, ColorSchemeId, AdditionalComponent, NPCItem } from '../types';
import { GAME_SCHEMA_VERSION, type Game, type Node } from '../types/node';
import { generateId } from './id';

/**
 * Everything that turns untrusted JSON (a file, or what's in storage) into a
 * valid Game, and a Game back into a file.
 */

export const GAME_FILE_FORMAT = 'viator-game';

export interface GameFile {
  format: typeof GAME_FILE_FORMAT;
  version: number;
  exportedAt: number;
  games: Game[];
}

export class GameFileError extends Error {}

// ─── Export ──────────────────────────────────────────────────────────────────
export function serializeGames(games: Game[]): string {
  const file: GameFile = {
    format: GAME_FILE_FORMAT,
    version: GAME_SCHEMA_VERSION,
    exportedAt: Date.now(),
    games,
  };
  return JSON.stringify(file, null, 2);
}

export function exportFileName(games: Game[]): string {
  const base = games.length === 1 ? games[0].character.name || games[0].campaign.name : 'viator-games';
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'viator';
  return `${slug}.json`;
}

// ─── Import ──────────────────────────────────────────────────────────────────
/**
 * Parse a file's text into Games. Accepts the current format, a bare Game,
 * or an export from the old character/campaign app. Imported games always
 * get fresh game IDs so they never overwrite an existing save.
 */
export function parseGamesFile(text: string): Game[] {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new GameFileError('That file is not valid JSON.');
  }

  let games: Game[];
  if (data?.format === GAME_FILE_FORMAT && Array.isArray(data.games)) {
    if (typeof data.version === 'number' && data.version > GAME_SCHEMA_VERSION) {
      throw new GameFileError('This file was made by a newer version of the app.');
    }
    games = data.games.map(normalizeGame);
  } else if (data?.type === 'viator-export') {
    games = convertLegacyExport(data);
  } else if (data && typeof data === 'object' && data.character && data.campaign) {
    games = [normalizeGame(data)];
  } else {
    throw new GameFileError('That file is not a Viator save.');
  }

  if (!games.length) throw new GameFileError('That file contains no games.');
  const now = Date.now();
  return games.map((g) => ({ ...g, id: generateId(), updatedAt: now }));
}

// ─── Validation / repair ─────────────────────────────────────────────────────
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function isScheme(v: unknown): v is ColorSchemeId {
  return isStr(v) && v in COLOR_SCHEMES;
}

/**
 * Coerce anything game-shaped into a valid Game: drops malformed fields,
 * fills required ones, and re-IDs duplicate or missing node IDs. Throws only
 * when there's nothing usable at all.
 */
export function normalizeGame(raw: any): Game {
  if (!raw || typeof raw !== 'object') throw new GameFileError('Invalid game data.');
  const seen = new Set<string>();
  const now = Date.now();
  return {
    version: GAME_SCHEMA_VERSION,
    id: isStr(raw.id) && raw.id ? raw.id : generateId(),
    colorScheme: isScheme(raw.colorScheme) ? raw.colorScheme : DEFAULT_SCHEME,
    createdAt: isNum(raw.createdAt) ? raw.createdAt : now,
    updatedAt: isNum(raw.updatedAt) ? raw.updatedAt : now,
    character: raw.character ? normalizeNode(raw.character, seen) : createDefaultCharacter(),
    campaign: raw.campaign ? normalizeNode(raw.campaign, seen) : createDefaultCampaign(),
  };
}

function normalizeNode(raw: any, seen: Set<string>): Node {
  let id = isStr(raw?.id) && raw.id ? raw.id : generateId();
  if (seen.has(id)) id = generateId();
  seen.add(id);

  const node: Node = { id, name: isStr(raw?.name) ? raw.name : '' };
  if (isNum(raw?.value)) node.value = raw.value;
  if (isStr(raw?.description)) node.description = raw.description;
  if (isStr(raw?.valueLabel)) node.valueLabel = raw.valueLabel;
  if (Array.isArray(raw?.children)) {
    node.children = raw.children
      .filter((c: unknown) => c && typeof c === 'object')
      .map((c: unknown) => normalizeNode(c, seen));
    if (isStr(raw.childValueLabel)) node.childValueLabel = raw.childValueLabel;
  }
  return node;
}

// ─── Legacy (pre-overhaul) export conversion ─────────────────────────────────
function convertLegacyExport(data: any): Game[] {
  const characters: Character[] = Array.isArray(data.characters) ? data.characters : [];
  const campaigns: Campaign[] = Array.isArray(data.campaigns) ? data.campaigns : [];
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));
  const used = new Set<string>();
  const games: any[] = [];

  for (const ch of characters) {
    const camp = ch.campaignId ? campaignById.get(ch.campaignId) : undefined;
    if (camp) used.add(camp.id);
    games.push({
      colorScheme: ch.colorScheme ?? camp?.colorScheme,
      createdAt: ch.createdAt,
      updatedAt: Math.max(ch.updatedAt ?? 0, camp?.updatedAt ?? 0) || undefined,
      character: legacyCharacter(ch),
      campaign: camp ? legacyCampaign(camp) : undefined,
    });
  }
  for (const camp of campaigns) {
    if (used.has(camp.id)) continue;
    games.push({
      colorScheme: camp.colorScheme,
      createdAt: camp.createdAt,
      updatedAt: camp.updatedAt,
      campaign: legacyCampaign(camp),
    });
  }
  return games.map(normalizeGame);
}

const pair = (name: unknown, value: unknown): Node => ({ id: '', name: String(name ?? ''), value: Number(value) || 0 });

function legacyNPC(npc: Partial<NPCItem>): Node {
  return {
    id: '',
    name: npc.name ?? '',
    description: npc.description ?? '',
    children: [{ id: '', name: 'Traits', children: (npc.traits ?? []).map((t) => pair(t.name, t.value)) }],
  };
}

function legacyComponent(c: AdditionalComponent): Node {
  switch (c.type) {
    case 'text':
      return { id: '', name: c.name, description: c.content ?? '' };
    case 'number':
      return pair(c.name, c.value);
    case 'npc':
      return legacyNPC(c);
    case 'text-list':
      return { id: '', name: c.name, children: (c.items ?? []).map((i) => ({ id: '', name: i.name, description: i.content ?? '' })) };
    case 'number-list':
      return { id: '', name: c.name, children: (c.items ?? []).map((i) => pair(i.name, i.value)) };
    case 'npc-list':
      return { id: '', name: c.name, children: (c.items ?? []).map(legacyNPC) };
    default:
      return { id: '', name: (c as any)?.name ?? '' };
  }
}

/** Order sections by the old `sectionOrder`, falling back to declaration order. */
function ordered(builtIns: Record<string, Node | null>, components: AdditionalComponent[], order?: string[]): Node[] {
  const all = new Map<string, Node | null>(Object.entries(builtIns));
  for (const c of components ?? []) all.set(c.id, legacyComponent(c));
  const ids = [...(order ?? []).filter((id) => all.has(id)), ...[...all.keys()].filter((id) => !order?.includes(id))];
  return ids.map((id) => all.get(id)).filter((n): n is Node => !!n);
}

function legacyCharacter(ch: Character): Node {
  return {
    id: '',
    name: ch.name ?? '',
    value: Number(ch.xp) || 0,
    valueLabel: 'XP',
    description: ch.description ?? '',
    children: ordered(
      {
        __description: null, // lives on the root node itself
        __traits: { id: '', name: 'Traits', children: (ch.traits ?? []).map((t) => pair(t.name, t.value)) },
      },
      ch.additionalComponents,
      ch.sectionOrder,
    ),
  };
}

function legacyCampaign(camp: Campaign): Node {
  const named = (items: { name: string; description: string }[] = []) =>
    items.map((i) => ({ id: '', name: i.name, description: i.description ?? '' }));
  return {
    id: '',
    name: camp.name ?? '',
    children: ordered(
      {
        __currentScene: { id: '', name: 'Current Scene', description: camp.currentScene ?? '' },
        __npcs: { id: '', name: 'NPCs', children: (camp.npcs ?? []).map(legacyNPC) },
        __locations: { id: '', name: 'Locations', children: named(camp.locations) },
        __scenes: { id: '', name: 'Scenes', children: named(camp.scenes) },
      },
      camp.additionalComponents,
      camp.sectionOrder,
    ),
  };
}
