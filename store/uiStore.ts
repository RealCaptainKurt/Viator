import { create } from 'zustand';
import type { GamePage } from '../types/node';

/** Transient UI state shared across pages. Nothing here is saved. */

export interface NodeRef {
  page: GamePage;
  nodeId: string;
}

interface UIStore {
  isSidebarOpen: boolean;
  isEditMode: boolean;
  /** Node picked up for a move; drop targets appear on both pages. */
  moving: (NodeRef & { name: string }) | null;

  // Single shared modal hosts (one instance per page, not per node).
  editing: NodeRef | null;
  adding: { page: GamePage; parentId: string } | null;
  editingValue: NodeRef | null;
  editingDescription: NodeRef | null;

  openSidebar: () => void;
  closeSidebar: () => void;
  toggleEditMode: () => void;
  startMove: (ref: NodeRef, name: string) => void;
  cancelMove: () => void;
  set: (patch: Partial<Pick<UIStore, 'editing' | 'adding' | 'editingValue' | 'editingDescription'>>) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  isEditMode: false,
  moving: null,
  editing: null,
  adding: null,
  editingValue: null,
  editingDescription: null,

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),
  startMove: (ref, name) => set({ moving: { ...ref, name }, editing: null }),
  cancelMove: () => set({ moving: null }),
  set: (patch) => set(patch),
}));
