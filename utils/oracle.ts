const d6 = (): number => Math.floor(Math.random() * 6) + 1;

// ── Internal helpers ──────────────────────────────────────────────────────────

function _roll<T>(table: T[]): T {
  return table[Math.floor(Math.random() * table.length)];
}

// ── Oracle focus tables ───────────────────────────────────────────────────────

// d12 — verb phrases: what is happening or what to do
const ACTION_FOCUS_TABLE = [
  "pursue or hunt down",
  "confront and challenge",
  "betray or undermine",
  "protect or defend",
  "uncover or expose",
  "create conflict between",
  "destroy or put an end to",
  "demand or seize",
  "escape or break free from",
  "change or reshape",
  "bargain or negotiate over",
  "unite or drive apart",
];

// d10 — descriptive qualities that color something
const DETAIL_FOCUS_TABLE = [
  "old and weathered",
  "surprisingly powerful",
  "well-hidden or concealed",
  "dangerous and volatile",
  "larger than expected",
  "deceptively insignificant",
  "ordinary on the surface",
  "unique or irreplaceable",
  "linked to the past",
  "not what it appears",
];

// d12 — narrative subjects and themes
const TOPIC_FOCUS_TABLE = [
  "a trusted ally",
  "a long-held secret",
  "an unresolved conflict",
  "something of great value",
  "a figure from the past",
  "someone's true intentions",
  "a hidden threat",
  "an unexpected opportunity",
  "a debt or obligation",
  "the cost of past choices",
  "someone who desperately needs help",
  "a fragile or dangerous alliance",
];

const SCENE_COMPLICATIONS = [
  "hostile forces oppose you",
  "an obstacle blocks your way",
  "the stakes become suddenly higher",
  "an NPC acts suddenly",
  "all is not as it seems",
  "things actually go as planned",
];

// d10
const PACING_MOVES = [
  "Foreshadow trouble ahead",
  "Reveal an unexpected detail",
  "An NPC makes their move",
  "Advance a looming threat",
  "Push a plot arc forward",
  "Introduce a new character or faction",
  "Shift the scene — change the location or conditions",
  "A clue or new lead surfaces",
  "Two existing forces or problems suddenly collide",
  "Something important is lost, taken, or changed",
];

// d10
const FAILURE_MOVES = [
  "Deal harm to someone or something",
  "Put someone in a difficult spot",
  "Offer a hard choice with no good answer",
  "Advance a threat",
  "Reveal an unwelcome truth",
  "Foreshadow something worse to come",
  "Take something away — resource, ally, or advantage",
  "The environment turns hostile or complicated",
  "Introduce a new problem or complication",
  "Someone's loyalty or resolve is tested",
];

function _randomEventText(): string {
  return `${_roll(ACTION_FOCUS_TABLE)} — ${_roll(TOPIC_FOCUS_TABLE)}`;
}

function _pacingMoveText(): string {
  return _roll(PACING_MOVES);
}

// ── Exported oracle functions ─────────────────────────────────────────────────

/**
 * Recluse oracle (yes/no).
 * Even: 1 white d6 vs 1 black d6.
 * Likely: keep max of 2 white dice vs 1 black.
 * Unlikely: 1 white vs keep max of 2 black dice.
 * Equal result → question is unanswerable as posed.
 */
export function rollOracle(likelihood: "even" | "likely" | "unlikely"): string {
  let white: number;
  let black: number;

  if (likelihood === "even") {
    white = d6();
    black = d6();
  } else if (likelihood === "likely") {
    white = Math.max(d6(), d6());
    black = d6();
  } else {
    white = d6();
    black = Math.max(d6(), d6());
  }

  const label =
    likelihood === "even"
      ? "Oracle (Even)"
      : likelihood === "likely"
        ? "Oracle (Likely)"
        : "Oracle (Unlikely)";

  if (white === black) {
    return `${label}: Answer impossible — the question itself may be wrong`;
  }

  const yesNo = white > black ? "Yes" : "No";
  const modifier =
    white <= 3 && black <= 3
      ? ", but..."
      : white >= 4 && black >= 4
        ? ", and..."
        : "";

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
    "Surprisingly lacking",
    "Less than expected",
    "About average",
    "About average",
    "More than expected",
    "Extraordinary",
  ];
  return `How Much: ${HOW_MUCH[d6() - 1]}`;
}

/** OPSE Random Event — Action Focus + Topic Focus. */
export function rollRandomEvent(): string {
  return `Random Event: ${_randomEventText()}`;
}

/** OPSE Action Focus — what is happening or what to do. */
export function rollActionFocus(): string {
  return `Action Focus: ${_roll(ACTION_FOCUS_TABLE)}`;
}

/** OPSE Detail Focus — what kind or quality of thing is it. */
export function rollDetailFocus(): string {
  return `Detail Focus: ${_roll(DETAIL_FOCUS_TABLE)}`;
}

/** OPSE Topic Focus — what is this about. */
export function rollTopicFocus(): string {
  return `Topic Focus: ${_roll(TOPIC_FOCUS_TABLE)}`;
}

/** OPSE Pacing Move — use when action lulls or "what now?" */
export function rollPacingMove(): string {
  return `Pacing Move: ${_pacingMoveText()}`;
}

/** OPSE Failure Move — use when a roll fails with consequences. */
export function rollFailureMove(): string {
  return `Failure Move: ${_roll(FAILURE_MOVES)}`;
}

// ── Dungeon generation tables ─────────────────────────────────────────────────

const DUNGEON_ADJECTIVE = [
  "dingy",
  "dangerous",
  "lavish",
  "mind-bending",
  "converted",
  "war-torn",
];

const DUNGEON_STRUCTURE = [
  "jail or cellar",
  "cave, mine, or natural hideaway",
  "warehouse or industrial space",
  "street or back alley",
  "library, school, lab, or study",
  "church or temple",
];

const DUNGEON_ENEMY_TYPE = [
  "humans (bandits, gangsters, etc.)",
  "humanoids (orcs, goblins, etc.)",
  "magical monsters",
  "mutated beasts",
  "robots / golems",
  "cultists or unholy things",
];

const ROOM_TYPE = [
  "A tight hallway or small room",
  "A holding area for another enemy type",
  "A barracks or storage room",
  "A living space or bunkroom",
  "A large meeting or entertainment room",
  "A large, open space",
];

const ROOM_CONTENTS = [
  "Treasure! (Roll for a magic item)",
  "A puzzle or riddle",
  "A physical blockade or trap",
  "Weak enemy(s)",
  "Normal enemy(s)",
  "Strong enemy(s)",
];

const NUMBER_OF_DOORS = [
  "0 doors",
  "1 locked door",
  "1 door",
  "1 door + 1 locked door",
  "2 doors",
  "2 doors + 1 locked door",
];

const BOSS_ROOM_GIMMICK = [
  "occasional waves of level 1 enemies",
  "hidden traps",
  "a shifting environment",
  "illusions / holograms",
  "two bosses",
  "random spells / spell effects, like creeping ice or reversed gravity",
];

const HIDDEN_GOODIES = [
  "A key that opens a locked room",
  "A key that opens a locked room",
  "A note from the old or current residents",
  "A secret passageway! (Roll for a new room)",
  "Hidden riches! (+2 XP per PC)",
  "A hidden item! (Roll for a magic item)",
];

// ── Dungeon internal helpers ──────────────────────────────────────────────────

function _rollRandomItem(): string {
  return _rollItemName();
}

function _rollMagicItem(): string {
  return `${_rollPowerWords()} ${_rollItemName()}`;
}

function _resolveMagicItemRoll(): string {
  const roll = Math.floor(Math.random() * 3) + 1;
  return roll <= 2 ? _rollRandomItem() : _rollMagicItem();
}

function _resolveItemText(raw: string): string {
  if (raw.includes("(Roll for a magic item)")) {
    return raw.replace(
      "(Roll for a magic item)",
      `— ${_resolveMagicItemRoll()}`,
    );
  }
  return raw;
}

// ── Exported dungeon functions ────────────────────────────────────────────────

/** Labyrinth Dungeon Theme — adjective + structure + enemy type. */
export function rollDungeonTheme(): string {
  const adj = DUNGEON_ADJECTIVE[d6() - 1];
  const structure = DUNGEON_STRUCTURE[d6() - 1];
  const enemy = DUNGEON_ENEMY_TYPE[d6() - 1];
  return `Dungeon Theme: A ${adj} ${structure} populated by ${enemy}.`;
}

/** Labyrinth Dungeon Room — room type, contents, doors, and optional boss. */
export function rollDungeonRoom(): string {
  const roomTypeRoll = d6();
  const contentsRoll = d6();
  const roomType = ROOM_TYPE[roomTypeRoll - 1];
  const doorsText = NUMBER_OF_DOORS[d6() - 1];

  const rawContents = _resolveItemText(ROOM_CONTENTS[contentsRoll - 1]);
  const lcContents = rawContents.charAt(0).toLowerCase() + rawContents.slice(1);

  let result = `Dungeon Room: ${roomType} with ${lcContents}. The room has ${doorsText}.`;

  if ((roomTypeRoll === 5 || roomTypeRoll === 6) && contentsRoll === 6) {
    const gimmick = BOSS_ROOM_GIMMICK[d6() - 1];
    result += ` This is a boss room, and the room has ${gimmick}!`;
  }

  return result;
}

/** Labyrinth Dungeon Loot — d3: 1-2 nothing, 3 roll Hidden Goodies. */
export function rollDungeonLoot(): string {
  const roll = Math.floor(Math.random() * 3) + 1;
  if (roll <= 2) {
    return "Dungeon Loot: Nothing of note.";
  }
  const resolved = _resolveItemText(HIDDEN_GOODIES[d6() - 1]);
  return `Dungeon Loot: ${resolved}`;
}

// ── Sanctuary Organization tables ────────────────────────────────────────────

const ORG_TYPE = [
  "corporate entity",
  "criminal organization",
  "government agency",
  "local business",
  "underground network",
  "cult or religious order",
];

const ORG_POWER_LEVEL = [
  "barely scraping by",
  "struggling, could be better",
  "surviving / well-funded",
  "surviving / well-funded",
  "thriving, more than enough",
  "a dominant force",
];

const ORG_PRIMARY_DRIVE = [
  "survival / protection",
  "profit / growth",
  "control / order",
  "change / revolution",
  "knowledge / truth",
  "service / community",
];

const ORG_OPERATING_STYLE = [
  "direct confrontation",
  "subtle manipulation",
  "open publicity",
  "technological solutions",
  "their network of contacts",
  "adaptive, opportunistic tactics",
];

// ── Exported organization function ───────────────────────────────────────────

/** Sanctuary Organization Generator — type, power level, drive, and operating style. */
export function rollGroup(): string {
  const detail = _roll(DETAIL_FOCUS_TABLE);
  const type = ORG_TYPE[d6() - 1];
  const power = ORG_POWER_LEVEL[d6() - 1];
  const drive = ORG_PRIMARY_DRIVE[d6() - 1];
  const style = ORG_OPERATING_STYLE[d6() - 1];
  return `Group: A ${detail} ${type} that is ${power}. They are driven by ${drive} and they tend to use ${style}.`;
}

// ── Town / City Builder tables ────────────────────────────────────────────────

const TOWN_SIZE = [
  "tiny village",
  "small town",
  "small city",
  "respectably-sized city",
  "large city",
  "huge metropolis",
];

const TOWN_RULER = [
  "a young, inexperienced leader",
  "a wise elder",
  "a leader with wild ambitions",
  "a battle-worn warrior",
  "a council of people",
  "a charming, naturally gifted leader",
];

const TOWN_ATTRACTION = [
  "industry",
  "entertainment",
  "stores and trade",
  "thriving crime world",
  "scientific advancements",
  "history",
];

// Danger from Sanctuary table — Warzone removed, Bad rep & Dangerous shifted up,
// Normal appears twice. Reworded to read naturally after "it is".
const TOWN_DANGER = [
  "relatively safe — people here are generally peaceful",
  "safe, but tightly controlled",
  "fairly normal — although trouble can be found if you go looking",
  "fairly normal — although trouble can be found if you go looking",
  "known to be a bit rough around the edges",
  "dangerous — don't go out alone at night",
];

// Combined Notable Features + More Notable Features (d12).
// Space-centric entries updated to be universal.
const TOWN_NOTABLE_FEATURES = [
  "the city is split by a river or fissure",
  "the city sits on a mountain",
  "there are no nearby cities for miles",
  "something dangerous sits right outside the city, like a volcano or hazardous terrain",
  "the terrain is very vertical",
  "local wildlife helps keep the city running",
  "a giant statue sits in the town square",
  "several different cultures live here with varying styles",
  "the city is surrounded by a protective wall",
  "the city's main gate or port is massive and heavily trafficked",
  "the city has only one main structure",
  "a section of the city has been destroyed",
];

// ── Exported town function ────────────────────────────────────────────────────

/** City Builder — size, ruler, attraction, danger, and notable feature. */
export function rollTown(): string {
  const detail = _roll(DETAIL_FOCUS_TABLE);
  const size = TOWN_SIZE[d6() - 1];
  const ruler = TOWN_RULER[d6() - 1];
  const attraction = TOWN_ATTRACTION[d6() - 1];
  const danger = TOWN_DANGER[d6() - 1];
  const feature = TOWN_NOTABLE_FEATURES[Math.floor(Math.random() * 12)];
  return `Town: A ${detail} ${size} led by ${ruler}. This city is known for its ${attraction}, and it is ${danger}. Notably, ${feature}.`;
}

// ── OPSE NPC & Plot Hook tables ───────────────────────────────────────────────

// d12
const NPC_IDENTITY_TABLE = [
  "outlaw", "tradesman", "commoner", "soldier",
  "merchant", "specialist", "entertainer", "adherent",
  "leader", "mystic", "adventurer", "lord",
];

// d12 — phrased to read naturally after "wants to"
const NPC_GOAL_TABLE = [
  "obtain something", "learn something", "harm someone",
  "restore something", "find something", "protect someone",
  "enrich themselves", "avenge someone", "fulfill their duty",
  "escape", "create something", "serve someone",
];

// Index 0 = unremarkable (special case). Others are used in "They have [X] that is [DETAIL FOCUS]."
const NPC_NOTABLE_FEATURE = [
  null,
  "a notable nature",
  "an obvious physical trait",
  "a quirk or mannerism",
  "unusual equipment",
  "an unexpected age or origin",
];

const PLOT_OBJECTIVE = [
  "eliminate a threat",
  "learn the truth",
  "recover something valuable",
  "escort or deliver someone to safety",
  "restore something broken",
  "save an ally in peril",
];

const PLOT_REWARD = [
  "money or valuables",
  "money or valuables",
  "knowledge and secrets",
  "the support of an ally",
  "advancing a plot arc",
  "a unique item of power",
];

const PLOT_ADVERSARY = [
  "a powerful organization",
  "outlaws",
  "guardians",
  "local inhabitants",
  "an enemy horde or force",
  "a new or recurring villain",
];

// ── OPSE NPC & Plot Hook helpers ──────────────────────────────────────────────

function _article(word: string): string {
  return /^[aeiou]/i.test(word) ? "An" : "A";
}

// ── Exported OPSE generator functions ────────────────────────────────────────

/** OPSE NPC Generator — identity, goal, and notable feature with Detail Focus. */
export function rollNPC(): string {
  const identity = _roll(NPC_IDENTITY_TABLE);
  const goal = _roll(NPC_GOAL_TABLE);
  const featureRoll = d6();
  const feature = NPC_NOTABLE_FEATURE[featureRoll - 1];

  const article = _article(identity);
  let result = `NPC: ${article} ${identity} who wants to ${goal}.`;

  if (feature === null) {
    result += " They are relatively unremarkable.";
  } else {
    const detail = _roll(DETAIL_FOCUS_TABLE);
    result += ` They have ${feature} that is ${detail}.`;
  }

  return result;
}

/** OPSE Plot Hook Generator — objective, reward, adversary, and Detail Focus. */
export function rollPlotHook(): string {
  const objective = PLOT_OBJECTIVE[d6() - 1];
  const reward = PLOT_REWARD[d6() - 1];
  const adversary = PLOT_ADVERSARY[d6() - 1];
  const detail = _roll(DETAIL_FOCUS_TABLE);
  return `Plot Hook: You have to ${objective} in exchange for ${reward}, but in your way stands ${adversary} who are ${detail}.`;
}

// ── GM Guide — One-Shot World Generator tables ────────────────────────────────
// Three paired d6 rolls compose a setting: the Base (tone + age), the
// Strangeness (a subject and how it manifests), and the Lands (environment +
// scope). Options are phrased so they read as plain English in the sentence.

// The Base — the overall tone of the setting…
const WORLD_BASE_TONE = [
  "heroic/mythic",
  "grimdark/gothic",
  "pulpy/dramatic",
  "cozy/campy",
  "surreal/weird",
  "horror/thriller",
];
// …and the age it's set in.
const WORLD_BASE_AGE = [
  "ancient age",
  "middle age",
  "industrial age",
  "modern age",
  "future age",
  "space age",
];

// The Strangeness — a subject that adds a wrinkle to the Base…
const WORLD_STRANGE_SUBJECT = [
  "gods/deities",
  "machines/golems",
  "monsters/behemoths",
  "ancient tech/relics",
  "spirits/ghosts",
  "magic/anomalies",
];
// …and how it manifests (each reads after the plural subject).
const WORLD_STRANGE_STATE = [
  "are a protected secret",
  "are an active threat",
  "are the stuff of legends",
  "are part of daily life",
  "are a resource to be used",
  "are worshipped by many",
];

// The Lands — the environment…
const WORLD_LAND_ENV = [
  "temperate/plain",
  "coastal/oceanic",
  "arid/dry",
  "frigid/barren",
  "rugged/mountainous",
  "fantastical/exotic",
];
// …and the size and scope of the setting.
const WORLD_LAND_SCOPE = [
  "lone city",
  "scattered network",
  "unmapped frontier",
  "Great Nation",
  "vast continent",
  "sealed enclave",
];

// ── Exported world function ───────────────────────────────────────────────────

/**
 * GM Guide One-Shot World Generator — rolls the Base (tone + age), the
 * Strangeness (subject + how it manifests), and the Lands (environment +
 * scope), then composes them into a single plain-English setting sentence.
 */
export function rollWorld(): string {
  const tone = WORLD_BASE_TONE[d6() - 1];
  const age = WORLD_BASE_AGE[d6() - 1];
  const subject = WORLD_STRANGE_SUBJECT[d6() - 1];
  const state = WORLD_STRANGE_STATE[d6() - 1];
  const env = WORLD_LAND_ENV[d6() - 1];
  const scope = WORLD_LAND_SCOPE[d6() - 1];

  const toneArticle = /^[aeiou]/i.test(tone) ? "An" : "A";
  const envArticle = /^[aeiou]/i.test(env) ? "an" : "a";

  return `World: ${toneArticle} ${tone} ${age} world set in ${envArticle} ${env} ${scope} where ${subject} ${state}.`;
}

// ── Tower of Echoes — Power & Item tables ─────────────────────────────────────

const POWER_TYPES = [
  "Blazing",
  "Icy",
  "Windy",
  "Shocking",
  "Earthen",
  "Watery",
  "Bright",
  "Shadow",
  "Holy",
  "Unholy",
  "Healing",
  "Poisonous",
  "Sonic",
  "Binding",
  "Shattering",
  "Slicing",
  "Magnetic",
  "Living",
  "Mental",
  "Swarming",
  "Illusory",
  "Flying",
  "Draining",
  "Exploding",
  "Shielding",
  "Commanding",
  "Terrifying",
  "Charming",
  "Teleporting",
  "Detecting",
  "Lucky",
  "Multiplying",
  "Summoning",
  "Timely",
  "Gravitational",
  "Mimicking",
  "Rusting",
  "Petrifying",
  "Phasing",
  "Mirroring",
  "Withering",
  "Hungry",
  "Dreaming",
  "Cursed",
  "Blooming",
  "Shifting",
  "Sticky",
  "Weeping",
  "Hollow",
  "Bloody",
];

const ITEM_MELEE = [
  "Short Sword",
  "Long Sword",
  "Greatsword",
  "Short Sword",
  "Long Sword",
  "Greatsword",
  "Spear",
  "Spear",
  "Hammer",
  "Axe",
  "Staff",
  "Dagger",
  "Rapier",
  "Flail",
  "Mace",
  "Pick",
  "Knuckles",
  "Sickle",
];
const ITEM_RANGED = [
  "Shortbow",
  "Longbow",
  "Crossbow",
  "Handgun",
  "Rifle",
  "Shotgun",
  "Sling",
  "Throwing Knife",
  "Javelin",
  "Blowgun",
];
const ITEM_ARMOR = [
  "Chestplate",
  "Chain Mail",
  "Plate Armor",
  "Shield",
  "Shield",
  "Helmet",
  "Greaves",
  "Gloves",
  "Bracers",
  "Pauldrons",
];
const ITEM_ACCESSORY = [
  "Ring",
  "Ring",
  "Amulet",
  "Belt",
  "Earring",
  "Crown",
  "Cloak",
  "Bandages",
  "Watch",
  "Mask",
];
const ITEM_HANDHELD = [
  "Wand",
  "Orb",
  "Book",
  "Lantern",
  "Toolkit",
  "Musical Instrument",
  "Umbrella",
  "Box",
  "Dice",
  "Cards",
  "Staff",
  "Idol",
  "Key",
];
const ITEM_CONSUMABLE = [
  "Potion (Consumable)",
  "Potion (Consumable)",
  "Scroll (Consumable)",
  "Scroll (Consumable)",
  "Biscuit (Consumable)",
  "Exploding Beads (Consumable)",
  "Ammo (Consumable)",
];

const ITEM_TABLES = [
  ITEM_MELEE,
  ITEM_RANGED,
  ITEM_ARMOR,
  ITEM_ACCESSORY,
  ITEM_HANDHELD,
  ITEM_CONSUMABLE,
];

// ── Power & Item internal helpers ─────────────────────────────────────────────

function _rollPowerWords(): string {
  const picked: string[] = [];
  while (picked.length < 2) {
    const word = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)];
    if (!picked.includes(word)) picked.push(word);
  }
  return picked.join(" ");
}

function _rollItemName(): string {
  const subTable = ITEM_TABLES[d6() - 1];
  return subTable[Math.floor(Math.random() * subTable.length)];
}

// ── Exported power & item functions ──────────────────────────────────────────

/** Tower of Echoes — roll exactly two different power words. */
export function rollMagicPower(): string {
  return `Magic / Power: ${_rollPowerWords()}`;
}

/** Tower of Echoes — random item from expanded Item Type table (d6 category × d6 sub-type). */
export function rollRandomItem(): string {
  return `Random Item: ${_rollItemName()}`;
}

/** Tower of Echoes — magic item combining power words and item type. */
export function rollMagicItem(): string {
  return `Magic Item: ${_rollPowerWords()} ${_rollItemName()}`;
}
