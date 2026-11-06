import { cap, d6, roll6, roll66, stop } from './oracleRoll';

/**
 * Generators for individual Viator games (Bordeaux, Starbound, The Tower of
 * Echoes), transcribed from each game's PDF.
 *
 * Conventions:
 *  - A 6-entry table is a d6 (`roll6`). Entries the book groups (e.g. "1-2")
 *    are repeated so every die face has its own slot.
 *  - A 36-entry table is "2d6 in order" (`roll66`): 11, 12 … 16, 21 … 66.
 *  - Entries are written so they drop straight into the sentence that uses
 *    them (lowercase unless they're a proper noun), so each result reads as
 *    plain English.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Bordeaux
// ═══════════════════════════════════════════════════════════════════════════

const BX_CLIENT = [
  'a small business owner',
  'a decent business owner',
  'a rogue Mask',
  'a poor slums resident',
  'a banker',
  'a noble',
];
const BX_AWARENESS = [
  "doesn't know you are a rebel",
  "doesn't know you are a rebel",
  'has suspicions that you are a rebel',
  'has suspicions that you are a rebel',
  'knows that you are a rebel',
  'knows that you are a rebel',
];
const BX_TASK = [
  'deliver something to someone in',
  'sabotage something in',
  'steal something from',
  'rescue someone in',
  'learn something from',
  'make someone disappear from',
];
const BX_PLACE = [
  'a local business',
  'a local business',
  'a bank or noble house',
  'a laboratory / biofarm',
  'a Mask station',
  'a seemingly random home',
];
const BX_DISTRICT = [
  'the Verdant Grove',
  'Sunset Crest',
  'the Azure Heights',
  'the Eastern Slums',
  'the Eastern Factories',
  'the Capital District',
];
const BX_PAY = [
  '1/2 reputation points',
  '1/2 reputation points',
  '1/2 reputation points',
  'one full point of reputation',
  '1/2 reputation points and a small prize or favor',
  '1/2 reputation points and a large prize or favor',
];
const BX_BUT = [
  "if you're found out, you fail immediately",
  'someone close to the client wants to tag along',
  "the client doesn't have important information",
  "the client isn't trustworthy",
  'you gain two levels of Stress just accepting the job',
  'the job is morally gray',
];
const BX_AND_OR = [
  'the Masks are extra heavy in the area today',
  'a festival is currently happening in the area',
  'a group of loud lost kin are in the area',
  "your target isn't actually where it should be",
  'a group of nobles are doing business in the area',
  'one of the VIPs shows up',
];

/** Bordeaux Job Generator. */
export function rollBordeauxJob(): string {
  return (
    `Job: The client is ${roll6(BX_CLIENT)} who ${roll6(BX_AWARENESS)}. ` +
    `They want you to ${roll6(BX_TASK)} ${roll6(BX_PLACE)} in ${roll6(BX_DISTRICT)}. ` +
    `In exchange, you'll earn ${roll6(BX_PAY)}. ` +
    `But ${roll6(BX_BUT)}, and/or ${roll6(BX_AND_OR)}.`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Starbound
// ═══════════════════════════════════════════════════════════════════════════

// ── Inner Planet Location Builder ──────────────────────────────────────────
const SB_INNER_KIND = [
  'a Khon shuttle or station town',
  'a bar, club, or venue',
  'a spacestation resort',
  'a small or secluded town',
  'a large port or trade city',
  'a district of a huge megacity',
];
const SB_INNER_FEEL = [
  'bright, clean, and orderly',
  'seedy and worn down',
  'full of history',
  'booming with new money',
  'fading out of its prime',
  'going through changes',
];
const SB_INNER_PEOPLE = [
  'cheerful and friendly',
  'quiet and secluded',
  'reverent and religious',
  'welcoming to Starbounds',
  'on edge and worried',
  'short and direct',
];
const SB_INNER_TROUBLE = [
  'new, unwanted visitors',
  'a corrupt Khon racket',
  'a local or nearby war',
  'a recent Khon crackdown',
  'deserter troublemakers',
  'a local crime syndicate',
];
const SB_INNER_KHONS = [
  'are a respected authority',
  'are mostly religious leaders',
  'are stretched thin',
  'are militarized zealots',
  "aren't all they seem to be",
  'mostly just go through the motions',
];
const SB_INNER_ACCESS = [
  'on a main shuttle path',
  'slightly off the main path',
  'isolated and self-sufficient',
  'a busy transport hub',
  'recently cut off from the outside world',
  'reachable only by private ship',
];

/** Starbound Inner Planet Location Builder. */
export function rollInnerPlanetLocation(): string {
  return (
    `Inner Planet Location: This is ${roll6(SB_INNER_KIND)} that is ${roll6(SB_INNER_FEEL)}. ` +
    `People here are mostly ${roll6(SB_INNER_PEOPLE)}, and dealing with ${roll6(SB_INNER_TROUBLE)}. ` +
    `The Khons here ${roll6(SB_INNER_KHONS)}. ` +
    `The location is ${roll6(SB_INNER_ACCESS)}.`
  );
}

// ── Outer Planet Location Builder ──────────────────────────────────────────
const SB_OUTER_KIND = [
  'a bar, club, or venue',
  'a private station in orbit',
  'an office or business',
  'a small or simple town',
  'a large port or trade city',
  'a district of a huge megacity',
];
const SB_OUTER_FEEL = [
  'sleek and minimalistic',
  'built on Golden Age ruins',
  'hidden away',
  'busy and visually messy',
  'booming with new money',
  'fading out of its prime',
];
const SB_OUTER_PEOPLE = [
  'happy and helpful',
  'careful and watchful',
  'rambunctious and chaotic',
  'direct and rough-around-the-edges',
  'hopeful and curious',
  'on edge and worried',
];
const SB_OUTER_TROUBLE = [
  'new, unwanted visitors',
  'Khons trying to prove their authority',
  'a local or nearby war',
  'a lack of resources',
  'a leadership crisis',
  'a local crime syndicate',
];
const SB_OUTER_LEADER = [
  'a corporate agent, probably from Branden-Decker',
  'a locally-elected leader',
  'a hero or merc who has offered protection',
  'a pirate or merc who has offered "protection"',
  'a Khon garrison that nobody asked for',
  'a nearby nation or city',
];
const SB_OUTER_RUNS_ON = [
  'a valuable product or export',
  'trade and passing travelers',
  'smuggling, gray-market deals, and playing dirty',
  "a patron corporation's generous investments",
  'stubbornness and hard work',
  "nothing, it's barely surviving",
];

/** Starbound Outer Planet Location Builder. */
export function rollOuterPlanetLocation(): string {
  return (
    `Outer Planet Location: This is ${roll6(SB_OUTER_KIND)} that is ${roll6(SB_OUTER_FEEL)}. ` +
    `People here are mostly ${roll6(SB_OUTER_PEOPLE)}, and dealing with ${roll6(SB_OUTER_TROUBLE)}. ` +
    `It's run by ${roll6(SB_OUTER_LEADER)}. ` +
    `What keeps it running: ${roll6(SB_OUTER_RUNS_ON)}.`
  );
}

// ── Asteroid Belt Location Builder ─────────────────────────────────────────
const SB_BELT_KIND = [
  'a bar, club, or venue',
  'a privately owned ship',
  'a local factory or business',
  'a small or secluded town',
  'a mid-sized surviving town',
  'a large town with a spaceport',
];
const SB_BELT_FEEL = [
  'sleek and minimalistic',
  'just a little bit grimy',
  'comfortable and lived-in',
  'trying to be professional',
  'barely sputtering along',
  'newly thriving and growing',
];
const SB_BELT_PEOPLE = [
  'helpful and polite',
  'wary of strangers',
  'hostile to any outsiders',
  'friendly and rambunctious',
  'scared of violent visitors',
  'looking to exploit visitors',
];
const SB_BELT_TROUBLE = [
  'inconsistent energy',
  'a recent brutal pirate raid',
  'current pirate visitors',
  'current Khon visitors',
  'internal politics / arguments',
  'malfunctioning relics / tech',
];
const SB_BELT_ASTEROID = [
  'small, with basically all of its surface space covered',
  'large, with lots of unused space on its surface',
  'lush and full of life',
  'oddly shaped with multiple sides',
  'partially hollow, with exposed internal caves',
  'tied to another nearby asteroid / structure / resource',
];
const SB_BELT_RELICS = [
  'a nearby bunker provides plenty of solar power',
  'they scavenge hidden ruins for materials',
  'relics are taboo here',
  'they are locked out of ruins',
  'a strong Ghost user lives here',
  "some experimental tech is core to the location's survival",
];

/** Starbound Asteroid Belt Location Builder. */
export function rollAsteroidBeltLocation(): string {
  return (
    `Asteroid Belt Location: This is ${roll6(SB_BELT_KIND)} that is ${roll6(SB_BELT_FEEL)}. ` +
    `People here are mostly ${roll6(SB_BELT_PEOPLE)}, and dealing with ${roll6(SB_BELT_TROUBLE)}. ` +
    `The asteroid is ${roll6(SB_BELT_ASTEROID)}. ` +
    `As for Golden Age relics, ${roll6(SB_BELT_RELICS)}.`
  );
}

// ── Random Style Generator (2d6 in order) ──────────────────────────────────
const SB_STYLE = [
  // 11–16
  'Spread out and spacious',
  'Dense and tightly packed',
  'Part of one mega structure',
  'In a large dome',
  'Stacked up in layered tiers',
  'Made of several merged styles over time',
  // 21–26
  'In the side of a mountain or crevice',
  'Underwater',
  'Floating in the water',
  'Floating in the air',
  'Underground',
  'Split by a river or ravine',
  // 31–36
  'Smooth, circular, childish',
  'Sharp, angular, dangerous',
  'Blocky, uninviting, hard',
  'Curvy, abstract, inefficient',
  'Soft, bright, open',
  'Straight, bland, brutalist',
  // 41–46
  'Eerily quiet at all hours',
  'Neon-lit and glowing',
  'Constant hum of machines',
  'Covered in graffiti murals',
  'Thick with smoke / haze',
  'Dim and lantern-lit',
  // 51–56
  'Encircles a greenhouse',
  'Encircles a busy market',
  'Encircles one main street',
  'Encircles Golden Age ruins',
  'Encircles an old Khon station',
  'Encircles a bonfire',
  // 61–66
  'Made with local rock / ice',
  'Made with scrap pieces',
  'Made with prefab pieces',
  'Made with lab-grown materials',
  'Made of a derelict ship',
  'Made of Golden Age bits',
];

/** Starbound Random Style Generator — one 2d6 roll (tens, then ones). */
export function rollStarboundStyle(): string {
  return `Style: ${roll66(SB_STYLE)}`;
}

// ── NPC Builder / Client Builder ───────────────────────────────────────────
const SB_NPC_WHO = [
  'a small business owner',
  'a Khon officer / soldier',
  'a reasonable pirate / outlaw',
  'a busy corporate agent',
  'a well-connected broker',
  'an ordinary laborer',
];
const SB_NPC_WANTS = [
  'material wealth',
  'to protect something',
  'recognition / fame',
  'to stick to their ideals',
  'to have fun',
  'to learn something',
];
const SB_NPC_LIKE = [
  'quiet and mousy',
  'large and imposing',
  'nervous and fidgety',
  'confidently incorrect',
  'cool and collected',
  'passionate and excited',
];
const SB_NPC_QUIRK = [
  'They move their hands a lot.',
  'They have an odd body mod.',
  'They dress… uniquely.',
  'They are overly armed.',
  'They are slightly inhuman.',
  'They have a strange accent.',
];
const SB_CLIENT_WHY = [
  'they need your skill',
  'it would hurt their image',
  'nobody local will help',
  "they're being watched",
  'it has to happen fast',
  "they don't trust anyone else",
];
const SB_CLIENT_OFFER = [
  '10 XP each',
  '10 XP each and a favor',
  '10 XP each and a relic',
  '15 XP each',
  '15 XP each and a favor',
  '20 XP each',
];

/** The four NPC categories (shared by NPC and Client). */
function starboundNpcCore(): string {
  return (
    `${cap(roll6(SB_NPC_WHO))} who wants ${roll6(SB_NPC_WANTS)}. ` +
    `They are ${roll6(SB_NPC_LIKE)}. ${roll6(SB_NPC_QUIRK)}`
  );
}

/** Starbound NPC Builder — the first four categories. */
export function rollStarboundNPC(): string {
  return `NPC: ${starboundNpcCore()}`;
}

/** Starbound Client Builder — all six categories (an NPC plus why they need help and the pay). */
export function rollStarboundClient(): string {
  return (
    `Client: ${starboundNpcCore()} ` +
    `They came to you because ${roll6(SB_CLIENT_WHY)}. ` +
    `They are offering ${roll6(SB_CLIENT_OFFER)}.`
  );
}

// ── Job tables ─────────────────────────────────────────────────────────────
// Each job's closing "twist" reads "The twist: …".

const SB_SHOOT_TARGET = [
  'a petty local criminal',
  'a pillar of the community',
  'a reclusive hermit',
  'a rising political figure',
  'a current or retired Khon',
  'a Starbound (just like you)',
];
const SB_SHOOT_WHO = [
  "learned something they shouldn't have",
  'betrayed the wrong person',
  'has a bounty on their head',
  'has powerful friends',
  "isn't who they claim to be",
  "doesn't know they're wanted",
];
const SB_SHOOT_LATELY = [
  'gone into hiding',
  'made a lot of enemies',
  'come into serious money',
  'gotten sloppy and careless',
  'taken on new protection',
  'been asking questions',
];
const SB_SHOOT_PROTECTED = [
  'a squad of hired guns',
  'their own Ghost',
  'automated defenses',
  'their sheer number of allies',
  'their reputation',
  "nothing — they're exposed",
];
const SB_SHOOT_WANTS = [
  'make it quiet, with no witnesses',
  'make an example of them',
  'bring back proof of death',
  'bring them back alive',
  'leave their allies untouched',
  'burn it all down',
];
const SB_SHOOT_TWIST = [
  "they're expecting you",
  "they're actually innocent",
  'someone else got here first',
  "you're being set up",
  'the target knows you',
  "no twist, this one's clean",
];

/** Starbound Shooting job. */
export function rollShootingJob(): string {
  return (
    `Shooting Job: The target is ${roll6(SB_SHOOT_TARGET)} who ${roll6(SB_SHOOT_WHO)}. ` +
    `Lately, they've ${roll6(SB_SHOOT_LATELY)}. ` +
    `They're protected by ${roll6(SB_SHOOT_PROTECTED)}. ` +
    `The client wants you to ${roll6(SB_SHOOT_WANTS)}. ` +
    `The twist: ${stop(roll6(SB_SHOOT_TWIST))}`
  );
}

const SB_SMUGGLE_CARGO = [
  'a case of illicit substances',
  'a living being',
  'classified documents or data',
  'forbidden religious texts',
  'illegally modded weaponry',
  'a Golden Age relic',
];
const SB_SMUGGLE_THAT = [
  'was stolen from the Khons',
  'is notably volatile or fragile',
  'is uncomfortably unwieldy',
  'draws attention',
  'came from someone dangerous',
  'is instantly recognizable',
];
const SB_SMUGGLE_BLOCK = [
  'a Khon checkpoint',
  'a rival gang who wants what you have',
  'the asteroid belt itself',
  'a dangerous storm / hazard',
  'an unrelated conflict',
  'almost nothing, strangely',
];
const SB_SMUGGLE_ALONG = [
  'you must pass through a crowded public area',
  'the area is under quarantine',
  'a local festival is underway',
  'the area is notably sketchy',
  'the buyer changes things',
  'pirates catch your scent',
];
const SB_SMUGGLE_BUYER = [
  'a local black market broker',
  'a gang leader',
  'a corrupt Khon officer',
  'a private scientist',
  'a worker in over their head',
  'a mysterious rich stranger',
];
const SB_SMUGGLE_TWIST = [
  'the client set you up',
  'the cargo has a tracker',
  'the buyer never shows',
  'the contraband is fake',
  "it'll go bad if you're not fast",
  "no twist, this one's clean",
];

/** Starbound Smuggling job. */
export function rollSmugglingJob(): string {
  return (
    `Smuggling Job: The contraband is ${roll6(SB_SMUGGLE_CARGO)} that ${roll6(SB_SMUGGLE_THAT)}. ` +
    `Your way is blocked by ${roll6(SB_SMUGGLE_BLOCK)}. ` +
    `And along the way, ${roll6(SB_SMUGGLE_ALONG)}. ` +
    `The buyer is ${roll6(SB_SMUGGLE_BUYER)}. ` +
    `The twist: ${stop(roll6(SB_SMUGGLE_TWIST))}`
  );
}

const SB_STEAL_TARGET = [
  'a precious relic or item',
  'a ship or vehicle',
  'sensitive documents or data',
  'a living being',
  'a priceless work of art',
  'something seemingly normal',
];
const SB_STEAL_THAT = [
  'was already recently stolen',
  'has religious value',
  'could be weaponized',
  'is more famous than you first thought',
  'has strange properties',
  'would upend the local power balance',
];
const SB_STEAL_NOW = [
  'briefly on display',
  'locked in a private vault',
  'being transported',
  'in the hands of a rival',
  'going through a private sale',
  'hidden somewhere secret',
];
const SB_STEAL_PUBLIC = [
  'a team of trained guards',
  'automated defenses',
  'a dangerous lock',
  'the current owner',
  'cameras and attention',
  'almost nothing, strangely',
];
const SB_STEAL_SECRET = [
  'a second, hidden security layer',
  'a Ghost-wielding specialist',
  'a well-connected local gang',
  'a Golden Age AI relic',
  'trained alien creatures',
  'a password',
];
const SB_STEAL_TWIST = [
  'another party is after it too',
  "it's a convincing decoy",
  "the owner's been tipped off",
  'it was all a gray-hat security test',
  'a third party interrupts',
  "no twist, this one's clean",
];

/** Starbound Stealing job. */
export function rollStealingJob(): string {
  return (
    `Stealing Job: The target is ${roll6(SB_STEAL_TARGET)} that ${roll6(SB_STEAL_THAT)}. ` +
    `It's currently — or about to be — ${roll6(SB_STEAL_NOW)}. ` +
    `Publicly, it's protected by ${roll6(SB_STEAL_PUBLIC)}; secretly, by ${roll6(SB_STEAL_SECRET)}. ` +
    `The twist: ${stop(roll6(SB_STEAL_TWIST))}`
  );
}

const SB_SALVAGE_PLACE = [
  'ancient ruins on an asteroid',
  'a crashed ship',
  'a ghost ship, lost in space',
  'old underground bunkers',
  'known Golden Age ruins',
  'an abandoned town',
];
const SB_SALVAGE_FOR = [
  'working ship parts',
  'a specific piece of tech',
  'Golden Age relics',
  'data or information',
  'signs of life',
  'anything of value',
];
const SB_SALVAGE_DANGER = [
  'it could collapse at any moment',
  "it's pitch black",
  'hostile scavvers are there',
  'there could be survivors',
  'other crews never returned',
  'old defenses are still active',
];
const SB_SALVAGE_ARRIVE = [
  "it's been cleared out",
  'you find still warm bodies',
  "it's larger than you thought",
  'something inhuman lives here now',
  'the entrance collapses',
  "it's exactly as described",
];
const SB_SALVAGE_NEED = [
  'a way to haul the loot',
  'specialized tools to get in',
  'protective suits or gear',
  'a way to navigate the maze',
  'more time than you have',
  'guts and greed',
];
const SB_SALVAGE_TWIST = [
  'everything is working fine',
  'the client has an agenda',
  "this place isn't abandoned",
  "it's rigged to blow!",
  'the whole site is a trap',
  "no twist, this one's clean",
];

/** Starbound Salvaging job. */
export function rollSalvagingJob(): string {
  return (
    `Salvaging Job: The salvage is in ${roll6(SB_SALVAGE_PLACE)}. ` +
    `You're there for ${roll6(SB_SALVAGE_FOR)}. ` +
    `It's dangerous because ${roll6(SB_SALVAGE_DANGER)}. ` +
    `And when you get there, ${roll6(SB_SALVAGE_ARRIVE)}. ` +
    `To do the job, you'll need ${roll6(SB_SALVAGE_NEED)}. ` +
    `The twist: ${stop(roll6(SB_SALVAGE_TWIST))}`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// The Tower of Echoes
// ═══════════════════════════════════════════════════════════════════════════

// ── Floor Builder ──────────────────────────────────────────────────────────
const TW_FLOOR_TONE = ['low tech', 'surreal', 'dark', 'mythological', 'fantastical', 'high tech'];
const TW_FLOOR_SETTING = [
  'wasteland ruins',
  'naturescape',
  'naturescape',
  'small town(s)',
  'port city',
  'mega metropolis',
];
const TW_FLOOR_BIOME = [
  'temperate hills',
  'tropical islands',
  'resource-poor desert',
  'towering mountains',
  'lush jungle',
  'freezing tundra',
];
const TW_FLOOR_STATION = [
  'small, with low-effort tests',
  'competent and comfortable',
  'competent and comfortable',
  'a competitive hub of climbers',
  'a large, intricate floating ship',
  'a massive, luxurious facility',
];
const TW_FLOOR_POWER = [
  'elemental/natural magic',
  'arcane spellcasting',
  'energy manipulation',
  'unique abilities',
  'spiritual power',
  'matter manipulation',
];
const TW_FLOOR_POWER_USE = [
  'learned or trained',
  'part of the body',
  'kept secret / forbidden',
  'commonplace',
  'summoned',
  'used with tech / tools',
];
const TW_FLOOR_EVENTS = [
  // 11–16
  'an anti-founding family rebel group is hiding here',
  'an infamous head hunter is on the floor',
  'the Registry station is unable to run tests right now',
  'the Registry workers are working for a corrupt goal',
  'a notorious climber is here',
  'stuck climbers want to sabotage the test',
  // 21–26
  'the natives in the area are at war',
  'the natives are terrified of climbers for some reason',
  'natives are trying to attack the Registry station',
  'the natives are facing a famine',
  'a deadly plague is ongoing',
  'monstrous beasts will attack anyone on the floor',
  // 31–36
  'a famous climber team is on the floor',
  'multiple teams are struggling to pass the test',
  'there is a founding family fortress on the floor',
  'there is a major clan fortress on the floor',
  'there is a Manifold library',
  'an open rebel group is also taking the test on this floor',
  // 41–46
  "the natives' ruler just died",
  'an ancient monster lives on this floor',
  'a climber is recruiting people for a "special mission"',
  'a climber has taken over a nearby city / castle',
  'a god or mythical figure is said to live on this floor',
  'a mysterious patron is offering to help climbers',
  // 51–56
  'a high-level Registry worker is running inspections',
  'a rebel group plans to attack during a test',
  'the Registry is trying out some new tech for this test',
  'many climbers settle down on this floor',
  'reaching this floor is considered a major milestone',
  "there's a competition for Anilite workshop items",
  // 61–66
  'natives treat climbers like heroes… to a suspicious degree',
  'founding family members are skirmishing on this floor',
  'a group on this floor is trying to revive an ancient evil',
  'a gigantic corpse of a dead god rests on this floor',
  'this floor is contained, with a fake horizon and sky',
  "a local ruler competes for climbers' names",
];

/** Tower of Echoes Floor Builder. */
export function rollTowerFloor(): string {
  return (
    `Floor: ${cap(roll6(TW_FLOOR_TONE))} ${roll6(TW_FLOOR_SETTING)}. ` +
    `The local biome is ${roll6(TW_FLOOR_BIOME)}. ` +
    `The Registry station is ${roll6(TW_FLOOR_STATION)}. ` +
    `The native power system is ${roll6(TW_FLOOR_POWER)}, and it is ${roll6(TW_FLOOR_POWER_USE)}. ` +
    `Local event: ${cap(roll66(TW_FLOOR_EVENTS))}.`
  );
}

// ── Test Builder (Making Tests) ────────────────────────────────────────────
const TW_TEST_CHALLENGE = [
  'combat / war game',
  'retrieval / race',
  'puzzle solving / deduction',
  'manipulation / subterfuge',
  'survival / endurance',
  'sport / competition',
];
const TW_TEST_WIN = [
  'be first to finish',
  'get enough points / score',
  'reach a destination',
  'defeat opponent(s)',
  'last for an amount of time',
  'get approval from judge(s)',
];
const TW_TEST_COMPLICATION = [
  'one team / climber is a plant',
  'the instructions are a lie',
  'there is a tight time limit',
  'special gear is required',
  'an unrelated disaster strikes!',
  null, // 6 — hidden extra goal: roll a new challenge and win condition
];
const TW_TEST_FORMAT = [
  'everyone for themself',
  'team vs team',
  'team(s) vs environment',
  'team(s) vs Registry',
  'team-based battle royale',
  null, // 6 — gauntlet: roll new challenge and win condition 2-3 times
];

/** One challenge + win condition. */
function towerTestStage(): string {
  return `${cap(roll6(TW_TEST_CHALLENGE))} (goal: ${roll6(TW_TEST_WIN)})`;
}

/**
 * Tower of Echoes Test Builder. A complication of 6 adds a hidden extra goal
 * (one more challenge + win condition); a format of 6 makes it a gauntlet
 * (2–3 more).
 */
export function rollTowerTest(): string {
  const complication = roll6(TW_TEST_COMPLICATION);
  const format = roll6(TW_TEST_FORMAT);

  const lines = [`Test: ${towerTestStage()}`];
  lines.push(
    complication === null
      ? `Complication: Hidden extra goal — ${towerTestStage()}`
      : `Complication: ${cap(complication)}`,
  );
  if (format === null) {
    const stages = Array.from({ length: d6() <= 3 ? 2 : 3 }, towerTestStage);
    lines.push(`Format: Gauntlet — then ${stages.join('; then ')}`);
  } else {
    lines.push(`Format: ${cap(format)}`);
  }
  return lines.join('\n');
}

// ── Hook ───────────────────────────────────────────────────────────────────
const TW_HOOK_GOAL = [
  'Save / Rescue / Protect',
  'Kill / Destroy / Get revenge',
  'Find / Discover / Claim',
  'Learn / Research / Uncover',
  'Help / Advance / Redeem',
  'Surpass / Prove / Transcend',
];
const TW_HOOK_TARGET = [
  'a family member',
  'a secret organization',
  'a mythical figure or object',
  'an old friend',
  'a place or home',
  'oneself',
];

/** Tower of Echoes Hook — a PC's goal and what it's aimed at. */
export function rollTowerHook(): string {
  return `Hook: ${roll6(TW_HOOK_GOAL)} — ${roll6(TW_HOOK_TARGET)}`;
}

// ── NPC Builder ────────────────────────────────────────────────────────────
const TW_NPC_ROLE = ['Battery', 'Guard', 'Solo', 'Riff', 'Conductor']; // 6 = mixed (roll twice)
const TW_NPC_BACKSTORY = [
  'suffered a betrayal',
  'fell from grace',
  'is a hardworking underdog',
  'has nothing of note in their past',
  'is held to high expectations',
  'has a pampered good life',
];
const TW_NPC_OUTER = [
  'charming / charismatic',
  'blunt / direct',
  'deceptive / secretive',
  'honorable / stoic',
  'erratic / unpredictable',
  'easygoing / lazy',
];
const TW_NPC_INNER = [
  'desperate / driven',
  'confident / self-assured',
  'conflicted / torn',
  'bitter / resentful',
  'idealistic / hopeful',
  'pragmatic / realistic',
];
const TW_NPC_FOUNDING_FAMILY = [
  'the Var family (high-ranking)',
  'the Var family (low-ranking)',
  'the Children of Kallas',
  'the Manifold family',
  'the Anilite family',
  'the Helsing family',
];
const TW_NPC_TIES = [
  'They keep to just their group.',
  'They keep to just their group.',
  'They are tied to a rebel group.',
  'They are tied to one of the player characters.',
  'They are tied to a random major family.',
  null, // 6 — a founding family (rolled separately)
];

/** A role; on a 6 ("Mixed") rolls two different roles and combines them. */
function towerNpcRole(): string {
  const roll = d6();
  if (roll <= 5) return TW_NPC_ROLE[roll - 1];
  const first = Math.floor(Math.random() * TW_NPC_ROLE.length);
  let second = Math.floor(Math.random() * (TW_NPC_ROLE.length - 1));
  if (second >= first) second += 1;
  return `${TW_NPC_ROLE[first]}/${TW_NPC_ROLE[second]}`;
}

/** Tower of Echoes NPC Builder. */
export function rollTowerNPC(): string {
  const role = towerNpcRole();
  const tie = roll6(TW_NPC_TIES) ?? `They are tied to a founding family: ${roll6(TW_NPC_FOUNDING_FAMILY)}.`;
  return (
    `NPC: A ${role} who ${roll6(TW_NPC_BACKSTORY)}. ` +
    `Outwardly they are ${roll6(TW_NPC_OUTER)}, but inwardly they are ${roll6(TW_NPC_INNER)}. ` +
    tie
  );
}
