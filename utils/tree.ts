import type { Node } from '../types/node';

/**
 * Immutable operations on a Node tree. Every function returns a new root
 * (or the same root reference when nothing changed), so they plug straight
 * into React/zustand state updates.
 */

export type Attachment = 'value' | 'description' | 'children';

export interface NodeLocation {
  node: Node;
  parent: Node | null;
  index: number;
}

// ─── Queries ─────────────────────────────────────────────────────────────────
export function findNode(root: Node, id: string): NodeLocation | null {
  if (root.id === id) return { node: root, parent: null, index: -1 };
  const stack: Node[] = [root];
  while (stack.length) {
    const parent = stack.pop()!;
    const kids = parent.children;
    if (!kids) continue;
    for (let i = 0; i < kids.length; i++) {
      if (kids[i].id === id) return { node: kids[i], parent, index: i };
      stack.push(kids[i]);
    }
  }
  return null;
}

/** True when `id` is `ancestorId` itself or lies anywhere beneath it. */
export function isWithin(root: Node, ancestorId: string, id: string): boolean {
  const ancestor = findNode(root, ancestorId);
  return !!ancestor && !!findNode(ancestor.node, id);
}

export function walk(root: Node, visit: (node: Node, depth: number) => void, depth = 0): void {
  visit(root, depth);
  root.children?.forEach((c) => walk(c, visit, depth + 1));
}

// ─── Core rewrite helper ─────────────────────────────────────────────────────
/** Replace the node with `id` by `fn(node)`. Returns the same root if not found. */
export function mapNode(root: Node, id: string, fn: (node: Node) => Node): Node {
  if (root.id === id) return fn(root);
  if (!root.children) return root;
  let changed = false;
  const children = root.children.map((c) => {
    const next = mapNode(c, id, fn);
    if (next !== c) changed = true;
    return next;
  });
  return changed ? { ...root, children } : root;
}

// ─── Edits ───────────────────────────────────────────────────────────────────
export type NodePatch = Partial<Pick<Node, 'name' | 'value' | 'description'>>;

/** Shallow-merge fields. A key set to `undefined` is removed from the node. */
export function updateNode(root: Node, id: string, patch: NodePatch): Node {
  return mapNode(root, id, (node) => {
    const next: Node = { ...node };
    for (const [k, v] of Object.entries(patch) as [keyof NodePatch, unknown][]) {
      if (v === undefined) delete next[k];
      else (next as any)[k] = v;
    }
    return next;
  });
}

export function addAttachment(root: Node, id: string, kind: Attachment): Node {
  return mapNode(root, id, (node) => {
    if (node[kind] !== undefined) return node;
    const empty = kind === 'value' ? 0 : kind === 'description' ? '' : [];
    return { ...node, [kind]: empty };
  });
}

/** Removing `children` discards the whole subtree. */
export function removeAttachment(root: Node, id: string, kind: Attachment): Node {
  return mapNode(root, id, (node) => {
    if (node[kind] === undefined) return node;
    const next = { ...node };
    delete next[kind];
    return next;
  });
}

/** Insert `child` under `parentId` at `index` (default: end). Adds a children list if needed. */
export function insertNode(root: Node, parentId: string, child: Node, index?: number): Node {
  return mapNode(root, parentId, (parent) => {
    const kids = [...(parent.children ?? [])];
    const at = index === undefined ? kids.length : Math.max(0, Math.min(index, kids.length));
    kids.splice(at, 0, child);
    return { ...parent, children: kids };
  });
}

/** Remove a non-root node. Returns the new root and the removed subtree (null if not found). */
export function removeNode(root: Node, id: string): { root: Node; removed: Node | null } {
  const loc = findNode(root, id);
  if (!loc || !loc.parent) return { root, removed: null };
  const parentId = loc.parent.id;
  const next = mapNode(root, parentId, (parent) => ({
    ...parent,
    children: parent.children!.filter((c) => c.id !== id),
  }));
  return { root: next, removed: loc.node };
}

/**
 * Move a node within one tree to `newParentId` at `index`, where `index` is the
 * position in the destination list as it looks *before* the move. Refuses to
 * move a root or to drop a node into itself / its own descendants.
 */
export function moveNode(root: Node, id: string, newParentId: string, index: number): Node {
  if (isWithin(root, id, newParentId)) return root;
  const loc = findNode(root, id);
  if (!loc || !loc.parent) return root;
  // Removing from the same list shifts later positions down by one.
  const adjusted = loc.parent.id === newParentId && loc.index < index ? index - 1 : index;
  const { root: without, removed } = removeNode(root, id);
  return insertNode(without, newParentId, removed!, adjusted);
}
