import type { Game, Node } from '../types/node';

// ─── Plaintext export ────────────────────────────────────────────────────────
// A readable outline of every node. Not re-importable; JSON is for that.

const DIVIDER = '='.repeat(48);
const INDENT = '  ';

function renderNode(node: Node, depth: number, out: string[]): void {
  const pad = INDENT.repeat(depth);
  let line = `${pad}${depth > 0 ? '- ' : ''}${node.name.trim() || '(untitled)'}`;
  if (node.value !== undefined) {
    line += ` (${node.value})`;
  }
  out.push(line);

  const text = node.description?.trim();
  if (text) {
    const textPad = pad + INDENT + (depth > 0 ? INDENT : '');
    out.push(...text.split('\n').map((l) => (l.length ? textPad + l : l)));
  }
  node.children?.forEach((c) => renderNode(c, depth + 1, out));
}

function renderTree(title: string, root: Node): string {
  const out: string[] = [title.toUpperCase(), DIVIDER];
  renderNode(root, 0, out);
  return out.join('\n');
}

export function gamesToPlaintext(games: Game[]): string {
  return games
    .flatMap((g) => [renderTree('Character', g.character), renderTree('Campaign', g.campaign)])
    .join('\n\n\n') + '\n';
}
