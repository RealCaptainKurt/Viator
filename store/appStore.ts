import { create } from 'zustand';
import {
  Character,
  Campaign,
  ColorSchemeId,
  Trait,
  NamedItem,
  AdditionalComponent,
  AdditionalNumberComponent,
} from '../types';
import {
  loadCharacters,
  saveCharacter,
  deleteCharacter,
  loadCampaigns,
  saveCampaign,
  deleteCampaign,
  loadActiveEntry,
  saveActiveEntry,
} from '../utils/storage';
import { generateId } from '../utils/id';
import { DEFAULT_SCHEME } from '../constants/colorSchemes';

interface AppState {
  // Data
  characters: Record<string, Character>;
  campaigns: Record<string, Campaign>;

  // Active view
  activeCharacterId: string | null;
  activeCampaignId: string | null;

  // UI
  isSidebarOpen: boolean;
  isLoaded: boolean;

  // Init
  initialize: () => Promise<void>;

  // Sidebar
  openSidebar: () => void;
  closeSidebar: () => void;

  // Active selection
  setActive: (characterId: string | null, campaignId: string | null) => void;

  // ─── Character CRUD ───────────────────────────────────────────────
  createCharacter: (
    name: string,
    description: string,
    traits: Omit<Trait, 'id'>[],
    colorScheme?: ColorSchemeId
  ) => Character;
  updateCharacterField: <K extends keyof Character>(
    id: string,
    field: K,
    value: Character[K]
  ) => void;

  // Traits
  addTrait: (characterId: string, name: string, level: number) => void;
  updateTrait: (
    characterId: string,
    traitId: string,
    name: string,
    level: number
  ) => void;
  removeTrait: (characterId: string, traitId: string) => void;

  // Additional components on character (text, list, or number)
  addCharacterComponent: (
    characterId: string,
    type: 'text' | 'list' | 'number',
    name: string
  ) => void;
  updateCharacterComponentNumber: (
    characterId: string,
    componentId: string,
    value: number
  ) => void;
  updateCharacterComponentText: (
    characterId: string,
    componentId: string,
    name: string,
    content: string
  ) => void;
  addCharacterComponentListItem: (
    characterId: string,
    componentId: string,
    name: string,
    description: string
  ) => void;
  updateCharacterComponentListItem: (
    characterId: string,
    componentId: string,
    itemId: string,
    name: string,
    description: string
  ) => void;
  removeCharacterComponentListItem: (
    characterId: string,
    componentId: string,
    itemId: string
  ) => void;
  removeCharacterComponent: (characterId: string, componentId: string) => void;

  removeCharacter: (id: string) => void;

  // ─── Campaign CRUD ────────────────────────────────────────────────
  createCampaign: (name: string, colorScheme?: ColorSchemeId) => Campaign;
  updateCampaignField: <K extends keyof Campaign>(
    id: string,
    field: K,
    value: Campaign[K]
  ) => void;

  // Named item lists
  addCampaignListItem: (
    campaignId: string,
    list: 'npcs' | 'locations' | 'scenes',
    name: string,
    description: string
  ) => void;
  updateCampaignListItem: (
    campaignId: string,
    list: 'npcs' | 'locations' | 'scenes',
    itemId: string,
    name: string,
    description: string
  ) => void;
  removeCampaignListItem: (
    campaignId: string,
    list: 'npcs' | 'locations' | 'scenes',
    itemId: string
  ) => void;

  // Additional components
  addCampaignComponent: (
    campaignId: string,
    type: 'text' | 'list' | 'number',
    name: string
  ) => void;
  updateCampaignComponentNumber: (
    campaignId: string,
    componentId: string,
    value: number
  ) => void;
  updateCampaignComponentText: (
    campaignId: string,
    componentId: string,
    name: string,
    content: string
  ) => void;
  addCampaignComponentListItem: (
    campaignId: string,
    componentId: string,
    name: string,
    description: string
  ) => void;
  updateCampaignComponentListItem: (
    campaignId: string,
    componentId: string,
    itemId: string,
    name: string,
    description: string
  ) => void;
  removeCampaignComponentListItem: (
    campaignId: string,
    componentId: string,
    itemId: string
  ) => void;
  removeCampaignComponent: (campaignId: string, componentId: string) => void;

  removeCampaign: (id: string) => void;

  // Link/unlink
  linkCharacterToCampaign: (characterId: string, campaignId: string) => void;
  unlinkCharacterFromCampaign: (characterId: string) => void;
}

// ─── Helper: persist character ───────────────────────────────────────────────
function persistChar(char: Character) {
  saveCharacter(char).catch(console.error);
}
function persistCamp(camp: Campaign) {
  saveCampaign(camp).catch(console.error);
}

export const useAppStore = create<AppState>((set, get) => ({
  characters: {},
  campaigns: {},
  activeCharacterId: null,
  activeCampaignId: null,
  isSidebarOpen: false,
  isLoaded: false,

  initialize: async () => {
    const [characters, campaigns, active] = await Promise.all([
      loadCharacters(),
      loadCampaigns(),
      loadActiveEntry(),
    ]);

    // Migrate old character components: add `type: 'text'` if missing
    for (const char of Object.values(characters)) {
      let migrated = false;
      const updated = char.additionalComponents.map((c: any) => {
        if (!c.type) {
          migrated = true;
          return { ...c, type: 'text' as const };
        }
        return c;
      });
      if (migrated) {
        characters[char.id] = { ...char, additionalComponents: updated };
        persistChar(characters[char.id]);
      }
    }

    // Migrate old campaigns: currentSceneEvents → currentScene
    for (const camp of Object.values(campaigns)) {
      const raw = camp as any;
      if (raw.currentSceneEvents !== undefined && raw.currentScene === undefined) {
        const sceneText = (raw.currentSceneEvents as any[])
          .map((e: any) => (e.description ? `${e.name}: ${e.description}` : e.name))
          .join('\n');
        const migrated = { ...camp, currentScene: sceneText };
        delete (migrated as any).currentSceneEvents;
        campaigns[camp.id] = migrated;
        persistCamp(campaigns[camp.id]);
      }
    }

    set({
      characters,
      campaigns,
      activeCharacterId: active.characterId,
      activeCampaignId: active.campaignId,
      isLoaded: true,
    });
  },

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  setActive: (characterId, campaignId) => {
    set({ activeCharacterId: characterId, activeCampaignId: campaignId });
    saveActiveEntry(characterId, campaignId).catch(console.error);
  },

  // ─── Characters ────────────────────────────────────────────────────────────
  createCharacter: (name, description, traits, colorScheme = DEFAULT_SCHEME) => {
    const char: Character = {
      id: generateId(),
      name,
      xp: 0,
      description,
      traits: traits.map((t) => ({ ...t, id: generateId() })),
      additionalComponents: [],
      colorScheme,
      campaignId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ characters: { ...s.characters, [char.id]: char } }));
    persistChar(char);
    return char;
  },

  updateCharacterField: (id, field, value) => {
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      const updated = { ...char, [field]: value, updatedAt: Date.now() };
      persistChar(updated);
      return { characters: { ...s.characters, [id]: updated } };
    });
  },

  addTrait: (characterId, name, level) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const trait: Trait = { id: generateId(), name, level };
      const updated = {
        ...char,
        traits: [...char.traits, trait],
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateTrait: (characterId, traitId, name, level) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        traits: char.traits.map((t) =>
          t.id === traitId ? { ...t, name, level } : t
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeTrait: (characterId, traitId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        traits: char.traits.filter((t) => t.id !== traitId),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  addCharacterComponent: (characterId, type, name) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const comp: AdditionalComponent =
        type === 'text'
          ? { id: generateId(), type: 'text', name, content: '' }
          : type === 'list'
          ? { id: generateId(), type: 'list', name, items: [] }
          : { id: generateId(), type: 'number', name, value: 0 };
      const updated = {
        ...char,
        additionalComponents: [...char.additionalComponents, comp],
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterComponentNumber: (characterId, componentId, value) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.map((c) =>
          c.id === componentId && c.type === 'number' ? { ...c, value } : c
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterComponentText: (characterId, componentId, name, content) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.map((c) =>
          c.id === componentId && c.type === 'text'
            ? { ...c, name, content }
            : c
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  addCharacterComponentListItem: (characterId, componentId, name, description) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            const item: NamedItem = { id: generateId(), name, description };
            return { ...c, items: [...c.items, item] };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterComponentListItem: (characterId, componentId, itemId, name, description) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            return {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, name, description } : i
              ),
            };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterComponentListItem: (characterId, componentId, itemId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            return { ...c, items: c.items.filter((i) => i.id !== itemId) };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterComponent: (characterId, componentId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: char.additionalComponents.filter(
          (c) => c.id !== componentId
        ),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacter: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.characters;
      const newActiveChar =
        s.activeCharacterId === id ? null : s.activeCharacterId;
      if (newActiveChar !== s.activeCharacterId) {
        saveActiveEntry(newActiveChar, s.activeCampaignId).catch(console.error);
      }
      deleteCharacter(id).catch(console.error);
      return { characters: rest, activeCharacterId: newActiveChar };
    });
  },

  // ─── Campaigns ─────────────────────────────────────────────────────────────
  createCampaign: (name, colorScheme = DEFAULT_SCHEME) => {
    const camp: Campaign = {
      id: generateId(),
      name,
      currentScene: '',
      npcs: [],
      locations: [],
      scenes: [],
      additionalComponents: [],
      colorScheme,
      characterId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ campaigns: { ...s.campaigns, [camp.id]: camp } }));
    persistCamp(camp);
    return camp;
  },

  updateCampaignField: (id, field, value) => {
    set((s) => {
      const camp = s.campaigns[id];
      if (!camp) return s;
      const updated = { ...camp, [field]: value, updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [id]: updated } };
    });
  },

  addCampaignListItem: (campaignId, list, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const item: NamedItem = { id: generateId(), name, description };
      const updated = {
        ...camp,
        [list]: [...camp[list], item],
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignListItem: (campaignId, list, itemId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        [list]: camp[list].map((i: NamedItem) =>
          i.id === itemId ? { ...i, name, description } : i
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignListItem: (campaignId, list, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        [list]: camp[list].filter((i: NamedItem) => i.id !== itemId),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignComponent: (campaignId, type, name) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const comp: AdditionalComponent =
        type === 'text'
          ? { id: generateId(), type: 'text', name, content: '' }
          : type === 'list'
          ? { id: generateId(), type: 'list', name, items: [] }
          : { id: generateId(), type: 'number', name, value: 0 };
      const updated = {
        ...camp,
        additionalComponents: [...camp.additionalComponents, comp],
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignComponentNumber: (campaignId, componentId, value) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) =>
          c.id === componentId && c.type === 'number' ? { ...c, value } : c
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignComponentText: (campaignId, componentId, name, content) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) =>
          c.id === componentId && c.type === 'text'
            ? { ...c, name, content }
            : c
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignComponentListItem: (campaignId, componentId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            const item: NamedItem = { id: generateId(), name, description };
            return { ...c, items: [...c.items, item] };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignComponentListItem: (
    campaignId,
    componentId,
    itemId,
    name,
    description
  ) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            return {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, name, description } : i
              ),
            };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignComponentListItem: (campaignId, componentId, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.map((c) => {
          if (c.id === componentId && c.type === 'list') {
            return { ...c, items: c.items.filter((i) => i.id !== itemId) };
          }
          return c;
        }),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignComponent: (campaignId, componentId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: camp.additionalComponents.filter(
          (c) => c.id !== componentId
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaign: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.campaigns;
      const newActiveCamp =
        s.activeCampaignId === id ? null : s.activeCampaignId;
      if (newActiveCamp !== s.activeCampaignId) {
        saveActiveEntry(s.activeCharacterId, newActiveCamp).catch(console.error);
      }
      deleteCampaign(id).catch(console.error);
      return { campaigns: rest, activeCampaignId: newActiveCamp };
    });
  },

  linkCharacterToCampaign: (characterId, campaignId) => {
    set((s) => {
      const char = s.characters[characterId];
      const camp = s.campaigns[campaignId];
      if (!char || !camp) return s;
      const updatedChar = { ...char, campaignId, updatedAt: Date.now() };
      const updatedCamp = { ...camp, characterId, updatedAt: Date.now() };
      persistChar(updatedChar);
      persistCamp(updatedCamp);
      return {
        characters: { ...s.characters, [characterId]: updatedChar },
        campaigns: { ...s.campaigns, [campaignId]: updatedCamp },
      };
    });
  },

  unlinkCharacterFromCampaign: (characterId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char || !char.campaignId) return s;
      const camp = s.campaigns[char.campaignId];
      const updatedChar = { ...char, campaignId: null, updatedAt: Date.now() };
      persistChar(updatedChar);
      const updates: Partial<AppState> = {
        characters: { ...s.characters, [characterId]: updatedChar },
      };
      if (camp) {
        const updatedCamp = { ...camp, characterId: null, updatedAt: Date.now() };
        persistCamp(updatedCamp);
        updates.campaigns = { ...s.campaigns, [camp.id]: updatedCamp };
      }
      return updates;
    });
  },
}));
