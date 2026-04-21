import { create } from 'zustand';
import {
  Character,
  Campaign,
  ColorSchemeId,
  NamedItem,
  AdditionalComponent,
  AdditionalNumberComponent,
  NPCTrait,
  NPCItem,
  TextListItem,
  NumberListItem,
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

type ComponentType = 'text' | 'number' | 'npc' | 'text-list' | 'number-list' | 'npc-list';

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
  isEditMode: boolean;

  // Init
  initialize: () => Promise<void>;

  // Sidebar
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleEditMode: () => void;

  // Active selection
  setActive: (characterId: string | null, campaignId: string | null) => void;

  // ─── Character CRUD ───────────────────────────────────────────────
  createCharacter: (
    name: string,
    description: string,
    traits: Omit<NumberListItem, 'id'>[],
    colorScheme?: ColorSchemeId
  ) => Character;
  updateCharacterField: <K extends keyof Character>(
    id: string,
    field: K,
    value: Character[K]
  ) => void;

  // Traits (number-list style)
  addTrait: (characterId: string, name: string, value?: number) => void;
  updateTrait: (characterId: string, traitId: string, name: string, value: number) => void;
  removeTrait: (characterId: string, traitId: string) => void;
  reorderCharacterTraits: (characterId: string, from: number, to: number) => void;

  // Additional components
  addCharacterComponent: (characterId: string, type: ComponentType, name: string) => void;
  removeCharacterComponent: (characterId: string, componentId: string) => void;
  reorderCharacterComponents: (characterId: string, from: number, to: number) => void;
  reorderCharacterSection: (characterId: string, from: number, to: number) => void;
  removeCharacterSection: (characterId: string, sectionId: string) => void;

  // Text component
  updateCharacterComponentText: (characterId: string, componentId: string, name: string, content: string) => void;

  // Number component
  updateCharacterComponentNumber: (characterId: string, componentId: string, value: number) => void;

  // NPC component (standalone)
  updateCharacterNPCComponent: (characterId: string, componentId: string, name: string, description: string) => void;
  addCharacterNPCTrait: (characterId: string, componentId: string, traitName: string, traitValue?: number) => void;
  updateCharacterNPCTrait: (characterId: string, componentId: string, traitId: string, name: string, value: number) => void;
  removeCharacterNPCTrait: (characterId: string, componentId: string, traitId: string) => void;

  // Text-list component
  addCharacterTextListItem: (characterId: string, componentId: string, name: string, content: string) => void;
  updateCharacterTextListItem: (characterId: string, componentId: string, itemId: string, name: string, content: string) => void;
  removeCharacterTextListItem: (characterId: string, componentId: string, itemId: string) => void;
  reorderCharacterTextListItems: (characterId: string, componentId: string, from: number, to: number) => void;

  // Number-list component
  addCharacterNumberListItem: (characterId: string, componentId: string, name: string) => void;
  updateCharacterNumberListItemValue: (characterId: string, componentId: string, itemId: string, value: number) => void;
  removeCharacterNumberListItem: (characterId: string, componentId: string, itemId: string) => void;
  reorderCharacterNumberListItems: (characterId: string, componentId: string, from: number, to: number) => void;

  // NPC-list component
  addCharacterNPCListItem: (characterId: string, componentId: string, name: string, description: string) => void;
  updateCharacterNPCListItem: (characterId: string, componentId: string, itemId: string, name: string, description: string) => void;
  removeCharacterNPCListItem: (characterId: string, componentId: string, itemId: string) => void;
  reorderCharacterNPCListItems: (characterId: string, componentId: string, from: number, to: number) => void;
  addCharacterNPCListItemTrait: (characterId: string, componentId: string, itemId: string, traitName: string, traitValue?: number) => void;
  updateCharacterNPCListItemTrait: (characterId: string, componentId: string, itemId: string, traitId: string, name: string, value: number) => void;
  removeCharacterNPCListItemTrait: (characterId: string, componentId: string, itemId: string, traitId: string) => void;

  removeCharacter: (id: string) => void;

  // ─── Campaign CRUD ────────────────────────────────────────────────
  createCampaign: (name: string, colorScheme?: ColorSchemeId) => Campaign;
  updateCampaignField: <K extends keyof Campaign>(id: string, field: K, value: Campaign[K]) => void;

  // Built-in NPC list (campaign.npcs — NPCItem[])
  addCampaignBuiltinNPC: (campaignId: string, name: string, description: string) => void;
  updateCampaignBuiltinNPC: (campaignId: string, npcId: string, name: string, description: string) => void;
  removeCampaignBuiltinNPC: (campaignId: string, npcId: string) => void;
  reorderCampaignBuiltinNPCs: (campaignId: string, from: number, to: number) => void;
  addCampaignBuiltinNPCTrait: (campaignId: string, npcId: string, traitName: string, traitValue?: number) => void;
  updateCampaignBuiltinNPCTrait: (campaignId: string, npcId: string, traitId: string, name: string, value: number) => void;
  removeCampaignBuiltinNPCTrait: (campaignId: string, npcId: string, traitId: string) => void;

  // Built-in location/scene lists (NamedItem[])
  addCampaignListItem: (campaignId: string, list: 'locations' | 'scenes', name: string, description: string) => void;
  updateCampaignListItem: (campaignId: string, list: 'locations' | 'scenes', itemId: string, name: string, description: string) => void;
  removeCampaignListItem: (campaignId: string, list: 'locations' | 'scenes', itemId: string) => void;
  reorderCampaignListItems: (campaignId: string, list: 'locations' | 'scenes', from: number, to: number) => void;

  // Additional components
  addCampaignComponent: (campaignId: string, type: ComponentType, name: string) => void;
  removeCampaignComponent: (campaignId: string, componentId: string) => void;
  reorderCampaignComponents: (campaignId: string, from: number, to: number) => void;
  reorderCampaignSection: (campaignId: string, from: number, to: number) => void;
  removeCampaignSection: (campaignId: string, sectionId: string) => void;

  // Text component
  updateCampaignComponentText: (campaignId: string, componentId: string, name: string, content: string) => void;

  // Number component
  updateCampaignComponentNumber: (campaignId: string, componentId: string, value: number) => void;

  // NPC component (standalone)
  updateCampaignNPCComponent: (campaignId: string, componentId: string, name: string, description: string) => void;
  addCampaignNPCTrait: (campaignId: string, componentId: string, traitName: string, traitValue?: number) => void;
  updateCampaignNPCTrait: (campaignId: string, componentId: string, traitId: string, name: string, value: number) => void;
  removeCampaignNPCTrait: (campaignId: string, componentId: string, traitId: string) => void;

  // Text-list component
  addCampaignTextListItem: (campaignId: string, componentId: string, name: string, content: string) => void;
  updateCampaignTextListItem: (campaignId: string, componentId: string, itemId: string, name: string, content: string) => void;
  removeCampaignTextListItem: (campaignId: string, componentId: string, itemId: string) => void;
  reorderCampaignTextListItems: (campaignId: string, componentId: string, from: number, to: number) => void;

  // Number-list component
  addCampaignNumberListItem: (campaignId: string, componentId: string, name: string) => void;
  updateCampaignNumberListItemValue: (campaignId: string, componentId: string, itemId: string, value: number) => void;
  removeCampaignNumberListItem: (campaignId: string, componentId: string, itemId: string) => void;
  reorderCampaignNumberListItems: (campaignId: string, componentId: string, from: number, to: number) => void;

  // NPC-list component
  addCampaignNPCListItem: (campaignId: string, componentId: string, name: string, description: string) => void;
  updateCampaignNPCListItem: (campaignId: string, componentId: string, itemId: string, name: string, description: string) => void;
  removeCampaignNPCListItem: (campaignId: string, componentId: string, itemId: string) => void;
  reorderCampaignNPCListItems: (campaignId: string, componentId: string, from: number, to: number) => void;
  addCampaignNPCListItemTrait: (campaignId: string, componentId: string, itemId: string, traitName: string) => void;
  updateCampaignNPCListItemTrait: (campaignId: string, componentId: string, itemId: string, traitId: string, name: string, value: number) => void;
  removeCampaignNPCListItemTrait: (campaignId: string, componentId: string, itemId: string, traitId: string) => void;

  removeCampaign: (id: string) => void;

  // Link/unlink
  linkCharacterToCampaign: (characterId: string, campaignId: string) => void;
  unlinkCharacterFromCampaign: (characterId: string) => void;

  // Import
  importData: (characters: Character[], campaigns: Campaign[]) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function reorder<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

function persistChar(char: Character) {
  saveCharacter(char).catch(console.error);
}
function persistCamp(camp: Campaign) {
  saveCampaign(camp).catch(console.error);
}

function makeComponent(type: ComponentType, name: string): AdditionalComponent {
  const id = generateId();
  if (type === 'text') return { id, type: 'text', name, content: '' };
  if (type === 'number') return { id, type: 'number', name, value: 0 };
  if (type === 'npc') return { id, type: 'npc', name, description: '', traits: [] };
  if (type === 'text-list') return { id, type: 'text-list', name, items: [] };
  if (type === 'number-list') return { id, type: 'number-list', name, items: [] };
  return { id, type: 'npc-list', name, items: [] };
}

function migrateComponents(comps: any[]): AdditionalComponent[] {
  return comps.map((c: any) => {
    if (!c.type) return { ...c, type: 'text' as const };
    if (c.type === 'list') {
      return {
        ...c,
        type: 'npc-list' as const,
        items: (c.items ?? []).map((i: any) => ({ ...i, traits: i.traits ?? [] })),
      };
    }
    return c;
  });
}

// ─── Char component updater helpers ──────────────────────────────────────────
function updateCharComp<T extends AdditionalComponent>(
  comps: AdditionalComponent[],
  compId: string,
  type: T['type'],
  fn: (c: T) => T
): AdditionalComponent[] {
  return comps.map((c) => (c.id === compId && c.type === type ? fn(c as T) : c));
}

function updateCampComp<T extends AdditionalComponent>(
  comps: AdditionalComponent[],
  compId: string,
  type: T['type'],
  fn: (c: T) => T
): AdditionalComponent[] {
  return comps.map((c) => (c.id === compId && c.type === type ? fn(c as T) : c));
}

export const useAppStore = create<AppState>((set, get) => ({
  characters: {},
  campaigns: {},
  activeCharacterId: null,
  activeCampaignId: null,
  isSidebarOpen: false,
  isLoaded: false,
  isEditMode: false,

  initialize: async () => {
    const [characters, campaigns, active] = await Promise.all([
      loadCharacters(),
      loadCampaigns(),
      loadActiveEntry(),
    ]);

    // Migrate character traits: Trait.level → NumberListItem.value
    for (const char of Object.values(characters)) {
      const raw = char as any;
      if (raw.traits?.length > 0 && 'level' in raw.traits[0]) {
        characters[char.id] = {
          ...char,
          traits: raw.traits.map((t: any) => ({ id: t.id, name: t.name, value: t.level ?? 0 })),
        };
        persistChar(characters[char.id]);
      }
    }

    // Migrate character components
    for (const char of Object.values(characters)) {
      const migrated = migrateComponents(char.additionalComponents as any[]);
      const changed = migrated.some((c, i) => c !== (char.additionalComponents as any[])[i]);
      if (changed) {
        characters[char.id] = { ...char, additionalComponents: migrated };
        persistChar(characters[char.id]);
      }
    }

    // Migrate campaign npcs: NamedItem → NPCItem (add traits: [])
    for (const camp of Object.values(campaigns)) {
      const raw = camp as any;
      if (raw.npcs?.length > 0 && !('traits' in raw.npcs[0])) {
        campaigns[camp.id] = {
          ...camp,
          npcs: raw.npcs.map((n: any) => ({ ...n, traits: [] })),
        };
        persistCamp(campaigns[camp.id]);
      }
    }

    // Migrate campaign components + old currentSceneEvents
    for (const camp of Object.values(campaigns)) {
      const raw = camp as any;
      let updated: any = camp;

      if (raw.currentSceneEvents !== undefined && raw.currentScene === undefined) {
        const sceneText = (raw.currentSceneEvents as any[])
          .map((e: any) => (e.description ? `${e.name}: ${e.description}` : e.name))
          .join('\n');
        updated = { ...updated, currentScene: sceneText };
        delete updated.currentSceneEvents;
      }

      const migrated = migrateComponents(updated.additionalComponents as any[]);
      const changed = migrated.some((c: any, i: number) => c !== (updated.additionalComponents as any[])[i]);
      if (changed || updated !== camp) {
        campaigns[camp.id] = { ...updated, additionalComponents: migrated };
        persistCamp(campaigns[camp.id]);
      }
    }

    // Migrate: add sectionOrder if missing
    for (const char of Object.values(characters)) {
      if (!(char as any).sectionOrder) {
        characters[char.id] = {
          ...char,
          sectionOrder: ['__description', '__traits', ...char.additionalComponents.map((c) => c.id)],
        };
        persistChar(characters[char.id]);
      }
    }
    for (const camp of Object.values(campaigns)) {
      if (!(camp as any).sectionOrder) {
        campaigns[camp.id] = {
          ...camp,
          sectionOrder: ['__currentScene', '__npcs', '__locations', '__scenes', ...camp.additionalComponents.map((c) => c.id)],
        };
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
  toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),

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
      sectionOrder: ['__description', '__traits'],
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

  addTrait: (characterId, name, value = 0) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const trait: NumberListItem = { id: generateId(), name, value };
      const updated = { ...char, traits: [...char.traits, trait], updatedAt: Date.now() };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateTrait: (characterId, traitId, name, value) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        traits: char.traits.map((t) => (t.id === traitId ? { ...t, name, value } : t)),
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

  reorderCharacterTraits: (characterId, from, to) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = { ...char, traits: reorder(char.traits, from, to), updatedAt: Date.now() };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  addCharacterComponent: (characterId, type, name) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const comp = makeComponent(type, name);
      const baseSectionOrder = char.sectionOrder ?? ['__description', '__traits', ...char.additionalComponents.map((c) => c.id)];
      const updated = {
        ...char,
        additionalComponents: [...char.additionalComponents, comp],
        sectionOrder: [...baseSectionOrder, comp.id],
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
        additionalComponents: char.additionalComponents.filter((c) => c.id !== componentId),
        sectionOrder: char.sectionOrder ? char.sectionOrder.filter((id) => id !== componentId) : undefined,
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  reorderCharacterComponents: (characterId, from, to) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: reorder(char.additionalComponents, from, to),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  reorderCharacterSection: (characterId, from, to) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const order = char.sectionOrder ?? ['__description', '__traits', ...char.additionalComponents.map((c) => c.id)];
      const updated = { ...char, sectionOrder: reorder(order, from, to), updatedAt: Date.now() };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterSection: (characterId, sectionId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const order = char.sectionOrder ?? ['__description', '__traits', ...char.additionalComponents.map((c) => c.id)];
      const sectionOrder = order.filter((id) => id !== sectionId);
      const additionalComponents = sectionId.startsWith('__')
        ? char.additionalComponents
        : char.additionalComponents.filter((c) => c.id !== sectionId);
      const updated = { ...char, sectionOrder, additionalComponents, updatedAt: Date.now() };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  // ── Text ──
  updateCharacterComponentText: (characterId, componentId, name, content) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'text', (c) => ({ ...c, name, content })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  // ── Number ──
  updateCharacterComponentNumber: (characterId, componentId, value) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'number', (c) => ({ ...c, value })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  // ── NPC standalone ──
  updateCharacterNPCComponent: (characterId, componentId, name, description) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc', (c) => ({ ...c, name, description })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  addCharacterNPCTrait: (characterId, componentId, traitName, traitValue = 0) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const trait: NPCTrait = { id: generateId(), name: traitName, value: traitValue };
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc', (c) => ({ ...c, traits: [...c.traits, trait] })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterNPCTrait: (characterId, componentId, traitId, name, value) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc', (c) => ({
          ...c,
          traits: c.traits.map((t) => (t.id === traitId ? { ...t, name, value } : t)),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterNPCTrait: (characterId, componentId, traitId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc', (c) => ({
          ...c,
          traits: c.traits.filter((t) => t.id !== traitId),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  // ── Text-list ──
  addCharacterTextListItem: (characterId, componentId, name, content) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const item: TextListItem = { id: generateId(), name, content };
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'text-list', (c) => ({ ...c, items: [...c.items, item] })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterTextListItem: (characterId, componentId, itemId, name, content) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'text-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, name, content } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterTextListItem: (characterId, componentId, itemId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'text-list', (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  reorderCharacterTextListItems: (characterId, componentId, from, to) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'text-list', (c) => ({ ...c, items: reorder(c.items, from, to) })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  // ── Number-list ──
  addCharacterNumberListItem: (characterId, componentId, name) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const item: NumberListItem = { id: generateId(), name, value: 0 };
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'number-list', (c) => ({ ...c, items: [...c.items, item] })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterNumberListItemValue: (characterId, componentId, itemId, value) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'number-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, value } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterNumberListItem: (characterId, componentId, itemId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'number-list', (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  reorderCharacterNumberListItems: (characterId, componentId, from, to) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'number-list', (c) => ({ ...c, items: reorder(c.items, from, to) })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  // ── NPC-list ──
  addCharacterNPCListItem: (characterId, componentId, name, description) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const item: NPCItem = { id: generateId(), name, description, traits: [] };
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({ ...c, items: [...c.items, item] })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterNPCListItem: (characterId, componentId, itemId, name, description) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, name, description } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterNPCListItem: (characterId, componentId, itemId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  reorderCharacterNPCListItems: (characterId, componentId, from, to) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({ ...c, items: reorder(c.items, from, to) })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  addCharacterNPCListItemTrait: (characterId, componentId, itemId, traitName, traitValue = 0) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const trait: NPCTrait = { id: generateId(), name: traitName, value: traitValue };
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, traits: [...i.traits, trait] } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  updateCharacterNPCListItemTrait: (characterId, componentId, itemId, traitId, name, value) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === itemId
              ? { ...i, traits: i.traits.map((t) => (t.id === traitId ? { ...t, name, value } : t)) }
              : i
          ),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacterNPCListItemTrait: (characterId, componentId, itemId, traitId) => {
    set((s) => {
      const char = s.characters[characterId];
      if (!char) return s;
      const updated = {
        ...char,
        additionalComponents: updateCharComp(char.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === itemId ? { ...i, traits: i.traits.filter((t) => t.id !== traitId) } : i
          ),
        })),
        updatedAt: Date.now(),
      };
      persistChar(updated);
      return { characters: { ...s.characters, [characterId]: updated } };
    });
  },

  removeCharacter: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.characters;
      const newActiveChar = s.activeCharacterId === id ? null : s.activeCharacterId;
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
      sectionOrder: ['__currentScene', '__npcs', '__locations', '__scenes'],
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

  // ── Built-in NPC list ──
  addCampaignBuiltinNPC: (campaignId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const npc: NPCItem = { id: generateId(), name, description, traits: [] };
      const updated = { ...camp, npcs: [...camp.npcs, npc], updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignBuiltinNPC: (campaignId, npcId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        npcs: camp.npcs.map((n) => (n.id === npcId ? { ...n, name, description } : n)),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignBuiltinNPC: (campaignId, npcId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = { ...camp, npcs: camp.npcs.filter((n) => n.id !== npcId), updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  reorderCampaignBuiltinNPCs: (campaignId, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = { ...camp, npcs: reorder(camp.npcs, from, to), updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignBuiltinNPCTrait: (campaignId, npcId, traitName, traitValue = 0) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const trait: NPCTrait = { id: generateId(), name: traitName, value: traitValue };
      const updated = {
        ...camp,
        npcs: camp.npcs.map((n) => (n.id === npcId ? { ...n, traits: [...n.traits, trait] } : n)),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignBuiltinNPCTrait: (campaignId, npcId, traitId, name, value) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        npcs: camp.npcs.map((n) =>
          n.id === npcId
            ? { ...n, traits: n.traits.map((t) => (t.id === traitId ? { ...t, name, value } : t)) }
            : n
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignBuiltinNPCTrait: (campaignId, npcId, traitId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        npcs: camp.npcs.map((n) =>
          n.id === npcId ? { ...n, traits: n.traits.filter((t) => t.id !== traitId) } : n
        ),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── Built-in location/scene lists ──
  addCampaignListItem: (campaignId, list, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const item: NamedItem = { id: generateId(), name, description };
      const updated = { ...camp, [list]: [...camp[list], item], updatedAt: Date.now() };
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
        [list]: camp[list].map((i: NamedItem) => (i.id === itemId ? { ...i, name, description } : i)),
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

  reorderCampaignListItems: (campaignId, list, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = { ...camp, [list]: reorder(camp[list], from, to), updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignComponent: (campaignId, type, name) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const comp = makeComponent(type, name);
      const baseSectionOrder = camp.sectionOrder ?? ['__currentScene', '__npcs', '__locations', '__scenes', ...camp.additionalComponents.map((c) => c.id)];
      const updated = {
        ...camp,
        additionalComponents: [...camp.additionalComponents, comp],
        sectionOrder: [...baseSectionOrder, comp.id],
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
        additionalComponents: camp.additionalComponents.filter((c) => c.id !== componentId),
        sectionOrder: camp.sectionOrder ? camp.sectionOrder.filter((id) => id !== componentId) : undefined,
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  reorderCampaignComponents: (campaignId, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: reorder(camp.additionalComponents, from, to),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  reorderCampaignSection: (campaignId, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const order = camp.sectionOrder ?? ['__currentScene', '__npcs', '__locations', '__scenes', ...camp.additionalComponents.map((c) => c.id)];
      const updated = { ...camp, sectionOrder: reorder(order, from, to), updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignSection: (campaignId, sectionId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const order = camp.sectionOrder ?? ['__currentScene', '__npcs', '__locations', '__scenes', ...camp.additionalComponents.map((c) => c.id)];
      const sectionOrder = order.filter((id) => id !== sectionId);
      const additionalComponents = sectionId.startsWith('__')
        ? camp.additionalComponents
        : camp.additionalComponents.filter((c) => c.id !== sectionId);
      const updated = { ...camp, sectionOrder, additionalComponents, updatedAt: Date.now() };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── Text ──
  updateCampaignComponentText: (campaignId, componentId, name, content) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'text', (c) => ({ ...c, name, content })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── Number ──
  updateCampaignComponentNumber: (campaignId, componentId, value) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'number', (c) => ({ ...c, value })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── NPC standalone ──
  updateCampaignNPCComponent: (campaignId, componentId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc', (c) => ({ ...c, name, description })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignNPCTrait: (campaignId, componentId, traitName, traitValue = 0) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const trait: NPCTrait = { id: generateId(), name: traitName, value: traitValue };
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc', (c) => ({ ...c, traits: [...c.traits, trait] })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignNPCTrait: (campaignId, componentId, traitId, name, value) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc', (c) => ({
          ...c,
          traits: c.traits.map((t) => (t.id === traitId ? { ...t, name, value } : t)),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignNPCTrait: (campaignId, componentId, traitId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc', (c) => ({
          ...c,
          traits: c.traits.filter((t) => t.id !== traitId),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── Text-list ──
  addCampaignTextListItem: (campaignId, componentId, name, content) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const item: TextListItem = { id: generateId(), name, content };
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'text-list', (c) => ({ ...c, items: [...c.items, item] })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignTextListItem: (campaignId, componentId, itemId, name, content) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'text-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, name, content } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignTextListItem: (campaignId, componentId, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'text-list', (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  reorderCampaignTextListItems: (campaignId, componentId, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'text-list', (c) => ({ ...c, items: reorder(c.items, from, to) })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── Number-list ──
  addCampaignNumberListItem: (campaignId, componentId, name) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const item: NumberListItem = { id: generateId(), name, value: 0 };
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'number-list', (c) => ({ ...c, items: [...c.items, item] })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignNumberListItemValue: (campaignId, componentId, itemId, value) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'number-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, value } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignNumberListItem: (campaignId, componentId, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'number-list', (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  reorderCampaignNumberListItems: (campaignId, componentId, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'number-list', (c) => ({ ...c, items: reorder(c.items, from, to) })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  // ── NPC-list ──
  addCampaignNPCListItem: (campaignId, componentId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const item: NPCItem = { id: generateId(), name, description, traits: [] };
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({ ...c, items: [...c.items, item] })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignNPCListItem: (campaignId, componentId, itemId, name, description) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, name, description } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignNPCListItem: (campaignId, componentId, itemId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.filter((i) => i.id !== itemId),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  reorderCampaignNPCListItems: (campaignId, componentId, from, to) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({ ...c, items: reorder(c.items, from, to) })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  addCampaignNPCListItemTrait: (campaignId, componentId, itemId, traitName) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const trait: NPCTrait = { id: generateId(), name: traitName, value: 0 };
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) => (i.id === itemId ? { ...i, traits: [...i.traits, trait] } : i)),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  updateCampaignNPCListItemTrait: (campaignId, componentId, itemId, traitId, name, value) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === itemId
              ? { ...i, traits: i.traits.map((t) => (t.id === traitId ? { ...t, name, value } : t)) }
              : i
          ),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaignNPCListItemTrait: (campaignId, componentId, itemId, traitId) => {
    set((s) => {
      const camp = s.campaigns[campaignId];
      if (!camp) return s;
      const updated = {
        ...camp,
        additionalComponents: updateCampComp(camp.additionalComponents, componentId, 'npc-list', (c) => ({
          ...c,
          items: c.items.map((i) =>
            i.id === itemId ? { ...i, traits: i.traits.filter((t) => t.id !== traitId) } : i
          ),
        })),
        updatedAt: Date.now(),
      };
      persistCamp(updated);
      return { campaigns: { ...s.campaigns, [campaignId]: updated } };
    });
  },

  removeCampaign: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.campaigns;
      const newActiveCamp = s.activeCampaignId === id ? null : s.activeCampaignId;
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

  importData: (incomingChars, incomingCamps) => {
    set((s) => {
      const charIdMap: Record<string, string> = {};
      const campIdMap: Record<string, string> = {};
      const newChars = { ...s.characters };
      const newCamps = { ...s.campaigns };

      for (const char of incomingChars) {
        const finalId = newChars[char.id] ? generateId() : char.id;
        charIdMap[char.id] = finalId;
      }
      for (const camp of incomingCamps) {
        const finalId = newCamps[camp.id] ? generateId() : camp.id;
        campIdMap[camp.id] = finalId;
      }

      for (const char of incomingChars) {
        const finalId = charIdMap[char.id];
        const remappedCampId = char.campaignId != null ? (campIdMap[char.campaignId] ?? char.campaignId) : null;
        const finalChar: Character = { ...char, id: finalId, campaignId: remappedCampId };
        newChars[finalId] = finalChar;
        persistChar(finalChar);
      }
      for (const camp of incomingCamps) {
        const finalId = campIdMap[camp.id];
        const remappedCharId = camp.characterId != null ? (charIdMap[camp.characterId] ?? camp.characterId) : null;
        const finalCamp: Campaign = { ...camp, id: finalId, characterId: remappedCharId };
        newCamps[finalId] = finalCamp;
        persistCamp(finalCamp);
      }

      return { characters: newChars, campaigns: newCamps };
    });
  },
}));
