import {
  Character,
  Campaign,
  NamedItem,
  NPCItem,
  NPCTrait,
  NumberListItem,
  TextListItem,
  AdditionalComponent,
} from '../types';

// ─── Plaintext export ─────────────────────────────────────────────────────────
// Renders characters and campaigns as a plainly-labeled, human-readable text
// document. Metadata, ordering, and color are intentionally ignored — the goal
// is simply to list every piece of content a player has entered in a way that
// reads cleanly outside the app.

const DIVIDER = '='.repeat(48);
const INDENT = '  ';
const EMPTY = '(empty)';

/** Indent every line of a (possibly multi-line) block of text. */
function indent(text: string, prefix: string = INDENT): string {
  return text
    .split('\n')
    .map((line) => (line.length ? prefix + line : line))
    .join('\n');
}

/** Trim a value and fall back to a placeholder when there's nothing to show. */
function orEmpty(value: string | undefined | null): string {
  const trimmed = (value ?? '').trim();
  return trimmed.length ? trimmed : EMPTY;
}

function renderNPCTraits(traits: NPCTrait[]): string[] {
  if (!traits.length) return [];
  const lines = ['  Traits:'];
  for (const t of traits) {
    lines.push(`    - ${orEmpty(t.name)}: ${t.value}`);
  }
  return lines;
}

function renderNPC(npc: NPCItem): string[] {
  const lines: string[] = [`- ${orEmpty(npc.name)}`];
  const description = (npc.description ?? '').trim();
  if (description) lines.push(indent(description, '    '));
  lines.push(...renderNPCTraits(npc.traits ?? []));
  return lines;
}

function renderNamedItem(item: NamedItem): string {
  const description = (item.description ?? '').trim();
  return description
    ? `- ${orEmpty(item.name)}: ${description}`
    : `- ${orEmpty(item.name)}`;
}

function renderNumberItem(item: NumberListItem): string {
  return `- ${orEmpty(item.name)}: ${item.value}`;
}

function renderTextItem(item: TextListItem): string[] {
  const content = (item.content ?? '').trim();
  if (!content) return [`- ${orEmpty(item.name)}`];
  return [`- ${orEmpty(item.name)}:`, indent(content, '    ')];
}

/** Render a single labeled section: a heading followed by an indented body. */
function section(label: string, body: string[]): string {
  if (!body.length) {
    return `${label}:\n${indent(EMPTY)}`;
  }
  return `${label}:\n${indent(body.join('\n'))}`;
}

function renderAdditionalComponent(comp: AdditionalComponent): string {
  const label = orEmpty(comp.name);
  switch (comp.type) {
    case 'text':
      return section(label, comp.content.trim() ? [comp.content.trim()] : []);
    case 'number':
      return `${label}: ${comp.value}`;
    case 'npc': {
      const body: string[] = [];
      const description = (comp.description ?? '').trim();
      if (description) body.push(description);
      body.push(...renderNPCTraits(comp.traits ?? []));
      return section(label, body);
    }
    case 'text-list':
      return section(
        label,
        comp.items.flatMap(renderTextItem)
      );
    case 'number-list':
      return section(label, comp.items.map(renderNumberItem));
    case 'npc-list':
      return section(label, comp.items.flatMap(renderNPC));
    default:
      return section(label, []);
  }
}

function renderAdditionalComponents(components: AdditionalComponent[]): string[] {
  return components.map(renderAdditionalComponent);
}

// ─── Public builders ──────────────────────────────────────────────────────────

export function characterToPlaintext(character: Character): string {
  const blocks: string[] = [];
  blocks.push(`CHARACTER: ${orEmpty(character.name)}`);
  blocks.push(DIVIDER);
  blocks.push(`Experience Points: ${character.xp}`);
  blocks.push(section('Description', character.description.trim() ? [character.description.trim()] : []));
  blocks.push(section('Traits', character.traits.map(renderNumberItem)));
  blocks.push(...renderAdditionalComponents(character.additionalComponents));
  return blocks.join('\n\n');
}

export function campaignToPlaintext(campaign: Campaign): string {
  const blocks: string[] = [];
  blocks.push(`CAMPAIGN: ${orEmpty(campaign.name)}`);
  blocks.push(DIVIDER);
  blocks.push(section('Current Scene', campaign.currentScene.trim() ? [campaign.currentScene.trim()] : []));
  blocks.push(section('Characters', campaign.npcs.flatMap(renderNPC)));
  blocks.push(section('Locations', campaign.locations.map(renderNamedItem)));
  blocks.push(section('Scenes', campaign.scenes.map(renderNamedItem)));
  blocks.push(...renderAdditionalComponents(campaign.additionalComponents));
  return blocks.join('\n\n');
}

/**
 * Build a single plaintext document listing every selected character and
 * campaign, each separated by blank lines. Used by the "Export as Plaintext"
 * option alongside the JSON export.
 */
export function buildPlaintext(characters: Character[], campaigns: Campaign[]): string {
  const docs: string[] = [];
  for (const c of characters) docs.push(characterToPlaintext(c));
  for (const c of campaigns) docs.push(campaignToPlaintext(c));
  return docs.join('\n\n\n');
}
