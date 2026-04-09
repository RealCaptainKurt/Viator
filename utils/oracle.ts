const d6 = (): number => Math.floor(Math.random() * 6) + 1;

const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const SUIT_FULL = [
  'Physical (appearance, existence)',
  'Technical (mental, operation)',
  'Mystical (meaning, capability)',
  'Social (personal, connection)',
];

function drawCard(): { rank: string; suit: string } {
  return {
    rank: CARD_RANKS[Math.floor(Math.random() * 13)],
    suit: SUIT_FULL[Math.floor(Math.random() * 4)],
  };
}

const ACTION_FOCUS: Record<string, string> = {
  '2': 'Seek', '3': 'Oppose', '4': 'Communicate', '5': 'Move',
  '6': 'Harm', '7': 'Create', '8': 'Reveal', '9': 'Command',
  T: 'Take', J: 'Protect', Q: 'Assist', K: 'Transform', A: 'Deceive',
};

const DETAIL_FOCUS: Record<string, string> = {
  '2': 'Small', '3': 'Large', '4': 'Old', '5': 'New',
  '6': 'Mundane', '7': 'Simple', '8': 'Complex', '9': 'Unsavory',
  T: 'Specialized', J: 'Unexpected', Q: 'Exotic', K: 'Dignified', A: 'Unique',
};

const TOPIC_FOCUS: Record<string, string> = {
  '2': 'Current Need', '3': 'Allies', '4': 'Community', '5': 'History',
  '6': 'Future Plans', '7': 'Enemies', '8': 'Knowledge', '9': 'Rumors',
  T: 'A Plot Arc', J: 'Recent Events', Q: 'Equipment', K: 'A Faction', A: 'The PCs',
};

const SCENE_COMPLICATIONS = [
  'Hostile forces oppose you',
  'An obstacle blocks your way',
  "Wouldn't it suck if...",
  'An NPC acts suddenly',
  'All is not as it seems',
  'Things actually go as planned',
];

const PACING_MOVES = [
  'Foreshadow Trouble',
  'Reveal a New Detail',
  'An NPC Takes Action',
  'Advance a Threat',
  'Advance a Plot',
];

const FAILURE_MOVES = [
  'Cause Harm',
  'Put Someone in a Spot',
  'Offer a Choice',
  'Advance a Threat',
  'Reveal an Unwelcome Truth',
  'Foreshadow Trouble',
];

// ── Internal helpers ──────────────────────────────────────────────────────────

function _cardText(table: Record<string, string>): string {
  const { rank, suit } = drawCard();
  return `${table[rank]} — ${suit}`;
}

function _randomEventText(): string {
  const action = _cardText(ACTION_FOCUS);
  const topic = _cardText(TOPIC_FOCUS);
  return `${action} / ${topic}`;
}

function _pacingMoveText(): string {
  const roll = d6();
  if (roll === 6) {
    return `Random Event — ${_randomEventText()}`;
  }
  return PACING_MOVES[roll - 1];
}

// ── Exported oracle functions ─────────────────────────────────────────────────

/**
 * Recluse oracle (yes/no).
 * Even: 1 white d6 vs 1 black d6.
 * Likely: keep max of 2 white dice vs 1 black.
 * Unlikely: 1 white vs keep max of 2 black dice.
 * Equal result → question is unanswerable as posed.
 */
export function rollOracle(likelihood: 'even' | 'likely' | 'unlikely'): string {
  let white: number;
  let black: number;

  if (likelihood === 'even') {
    white = d6();
    black = d6();
  } else if (likelihood === 'likely') {
    white = Math.max(d6(), d6());
    black = d6();
  } else {
    white = d6();
    black = Math.max(d6(), d6());
  }

  const label =
    likelihood === 'even' ? 'Oracle (Even)' :
    likelihood === 'likely' ? 'Oracle (Likely)' : 'Oracle (Unlikely)';

  if (white === black) {
    return `${label}: Answer impossible — the question itself may be wrong`;
  }

  const yesNo = white > black ? 'Yes' : 'No';
  const modifier =
    white <= 3 && black <= 3 ? ', but...' :
    white >= 4 && black >= 4 ? ', and...' : '';

  return `${label}: ${yesNo}${modifier}`;
}

/**
 * OPSE Set the Scene.
 * Always rolls a Scene Complication. Separately checks for an Altered Scene
 * (5–6 on d6). If altered, appends the alteration; entries 4–6 auto-roll
 * their referenced sub-tables.
 */
export function rollSetScene(): string {
  const complication = SCENE_COMPLICATIONS[d6() - 1];
  const alteredCheck = d6();

  if (alteredCheck >= 5) {
    const alteredRoll = d6();
    switch (alteredRoll) {
      case 1:
        return `Set the Scene: ${complication}\nScene Altered: A major detail of the scene is enhanced or somehow worse`;
      case 2:
        return `Set the Scene: ${complication}\nScene Altered: The environment is different`;
      case 3:
        return `Set the Scene: ${complication}\nScene Altered: Unexpected NPCs are present`;
      case 4: {
        const sub = SCENE_COMPLICATIONS[d6() - 1];
        return `Set the Scene: ${complication}\nScene Altered: Add a Scene Complication — ${sub}`;
      }
      case 5:
        return `Set the Scene: ${complication}\nScene Altered: Add a Pacing Move — ${_pacingMoveText()}`;
      default:
        return `Set the Scene: ${complication}\nScene Altered: Add a Random Event — ${_randomEventText()}`;
    }
  }

  return `Set the Scene: ${complication}`;
}

/** OPSE Oracle (How) — how big, good, strong, etc. something is. */
export function rollHowMuch(): string {
  const HOW_MUCH = [
    'Surprisingly lacking',
    'Less than expected',
    'About average',
    'About average',
    'More than expected',
    'Extraordinary',
  ];
  return `How Much: ${HOW_MUCH[d6() - 1]}`;
}

/** OPSE Random Event — Action Focus + Topic Focus card draws. */
export function rollRandomEvent(): string {
  return `Random Event: ${_randomEventText()}`;
}

/** OPSE Action Focus — what does it do? (card draw) */
export function rollActionFocus(): string {
  return `Action Focus: ${_cardText(ACTION_FOCUS)}`;
}

/** OPSE Detail Focus — what kind of thing is it? (card draw) */
export function rollDetailFocus(): string {
  return `Detail Focus: ${_cardText(DETAIL_FOCUS)}`;
}

/** OPSE Topic Focus — what is this about? (card draw) */
export function rollTopicFocus(): string {
  return `Topic Focus: ${_cardText(TOPIC_FOCUS)}`;
}

/** OPSE Pacing Move — use when action lulls or "what now?" (d6) */
export function rollPacingMove(): string {
  return `Pacing Move: ${_pacingMoveText()}`;
}

/** OPSE Failure Move — use when a roll fails with consequences (d6) */
export function rollFailureMove(): string {
  return `Failure Move: ${FAILURE_MOVES[d6() - 1]}`;
}
