import { AppState, Platform } from 'react-native';
import { create } from 'zustand';
import { NODE_TEMPLATES, createGame } from '../constants/nodeTemplates';
import type { ColorSchemeId } from '../types';
import type { Game, GamePage, Node } from '../types/node';
import { parseGamesFile, serializeGames } from '../utils/gameFile';
import * as storage from '../utils/gameStorage';
import type { GameSummary, Prefs } from '../utils/gameStorage';
import * as tree from '../utils/tree';
import type { Attachment, NodePatch } from '../utils/tree';

interface GameStore {
  isLoaded: boolean;
  games: GameSummary[];
  /** The open game, fully loaded. Others stay on disk until opened. */
  game: Game | null;
  prefs: Prefs;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  initialize: () => Promise<void>;
  newGame: (opts?: Parameters<typeof createGame>[0]) => Promise<Game>;
  openGame: (id: string) => Promise<boolean>;
  closeGame: () => void;
  deleteGame: (id: string) => Promise<void>;
  setColorScheme: (scheme: ColorSchemeId) => void;

  // ─── Node edits (on the open game) ─────────────────────────────────
  updateNode: (page: GamePage, id: string, patch: NodePatch) => void;
  addAttachment: (page: GamePage, id: string, kind: Attachment) => void;
  removeAttachment: (page: GamePage, id: string, kind: Attachment) => void;
  /** Add a child built from a template ('blank' | 'trait' | 'npc' …). Returns its id. */
  addChild: (page: GamePage, parentId: string, templateId?: string, name?: string, index?: number) => string | null;
  removeNode: (page: GamePage, id: string) => void;
  /**
   * Drag-and-drop. Moves a node to `toParentId` (on either page) at `index`,
   * measured in the destination list before the move.
   */
  moveNode: (id: string, toPage: GamePage, toParentId: string, index: number) => void;

  // ─── UI prefs ──────────────────────────────────────────────────────
  toggleCollapsed: (nodeId: string) => void;

  // ─── Files ─────────────────────────────────────────────────────────
  /** Serialize the given saved games (default: the open one). */
  exportGames: (ids?: string[]) => Promise<string>;
  /** Import a file's text. Returns the number of games added. Throws GameFileError. */
  importGames: (text: string) => Promise<number>;
}

let listenersAttached = false;
function attachFlushListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  AppState.addEventListener('change', (s) => {
    if (s !== 'active') storage.flushSaves();
  });
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => storage.flushSaves());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') storage.flushSaves();
    });
  }
}

export const useGameStore = create<GameStore>((set, get) => {
  /** Apply a change to the open game, stamp it, and queue a save. */
  const commit = (fn: (g: Game) => Game) => {
    const current = get().game;
    if (!current) return;
    const next = fn(current);
    if (next === current) return;
    const stamped = { ...next, updatedAt: Date.now() };
    storage.scheduleSave(stamped);
    set({ game: stamped, games: storage.listGames() });
  };

  /** Apply a tree operation to one page's root. */
  const editPage = (page: GamePage, op: (root: Node) => Node) =>
    commit((g) => {
      const root = op(g[page]);
      return root === g[page] ? g : { ...g, [page]: root };
    });

  const setPrefs = (patch: Partial<Prefs>) => {
    const prefs = { ...get().prefs, ...patch };
    set({ prefs });
    storage.savePrefs(prefs);
  };

  return {
    isLoaded: false,
    games: [],
    game: null,
    prefs: { activeGameId: null, collapsed: {} },

    initialize: async () => {
      attachFlushListeners();
      const [games, prefs] = await Promise.all([storage.loadIndex(), storage.loadPrefs()]);
      const game = prefs.activeGameId ? await storage.loadGame(prefs.activeGameId) : null;
      set({ games, prefs: { ...prefs, activeGameId: game?.id ?? null }, game, isLoaded: true });
    },

    newGame: async (opts) => {
      await storage.flushSaves();
      const game = createGame(opts);
      await storage.saveGameNow(game);
      set({ game, games: storage.listGames() });
      setPrefs({ activeGameId: game.id });
      return game;
    },

    openGame: async (id) => {
      if (get().game?.id === id) return true;
      await storage.flushSaves();
      const game = await storage.loadGame(id);
      if (!game) return false;
      set({ game });
      setPrefs({ activeGameId: id });
      return true;
    },

    closeGame: () => {
      storage.flushSaves();
      set({ game: null });
      setPrefs({ activeGameId: null });
    },

    deleteGame: async (id) => {
      await storage.deleteGame(id);
      if (get().game?.id === id) {
        set({ game: null });
        setPrefs({ activeGameId: null });
      }
      set({ games: storage.listGames() });
    },

    setColorScheme: (scheme) => commit((g) => (g.colorScheme === scheme ? g : { ...g, colorScheme: scheme })),

    updateNode: (page, id, patch) => editPage(page, (r) => tree.updateNode(r, id, patch)),
    addAttachment: (page, id, kind) => editPage(page, (r) => tree.addAttachment(r, id, kind)),
    removeAttachment: (page, id, kind) => editPage(page, (r) => tree.removeAttachment(r, id, kind)),

    addChild: (page, parentId, templateId = 'blank', name, index) => {
      const template = NODE_TEMPLATES.find((t) => t.id === templateId) ?? NODE_TEMPLATES[0];
      const child = template.create(name);
      let added = false;
      editPage(page, (r) => {
        const next = tree.insertNode(r, parentId, child, index);
        added = next !== r;
        return next;
      });
      return added ? child.id : null;
    },

    removeNode: (page, id) => editPage(page, (r) => tree.removeNode(r, id).root),

    moveNode: (id, toPage, toParentId, index) =>
      commit((g) => {
        const fromPage: GamePage | null = tree.findNode(g.character, id)
          ? 'character'
          : tree.findNode(g.campaign, id)
            ? 'campaign'
            : null;
        if (!fromPage || !tree.findNode(g[toPage], toParentId)) return g;
        if (fromPage === toPage) {
          const root = tree.moveNode(g[toPage], id, toParentId, index);
          return root === g[toPage] ? g : { ...g, [toPage]: root };
        }
        const { root: source, removed } = tree.removeNode(g[fromPage], id);
        if (!removed) return g;
        return { ...g, [fromPage]: source, [toPage]: tree.insertNode(g[toPage], toParentId, removed, index) };
      }),

    toggleCollapsed: (nodeId) => {
      const collapsed = { ...get().prefs.collapsed };
      if (collapsed[nodeId]) delete collapsed[nodeId];
      else collapsed[nodeId] = true;
      setPrefs({ collapsed });
    },

    exportGames: async (ids) => {
      await storage.flushSaves();
      const wanted = ids ?? (get().game ? [get().game!.id] : []);
      const loaded = await Promise.all(wanted.map(storage.loadGame));
      return serializeGames(loaded.filter((g): g is Game => !!g));
    },

    importGames: async (text) => {
      const imported = parseGamesFile(text);
      await Promise.all(imported.map(storage.saveGameNow));
      set({ games: storage.listGames() });
      return imported.length;
    },
  };
});
