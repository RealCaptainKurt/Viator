import {
  rollDungeonLoot,
  rollDungeonRoom,
  rollDungeonTheme,
  rollFailureMove,
  rollGroup,
  rollHowMuch,
  rollInstrument,
  rollMagicPower,
  rollNote,
  rollNPC,
  rollPacingMove,
  rollPlotHook,
  rollRandomEvent,
  rollRandomItem,
  rollSetScene,
  rollTown,
  rollWorld,
} from '../utils/oracle';
import {
  rollAsteroidBeltLocation,
  rollBordeauxJob,
  rollInnerPlanetLocation,
  rollOuterPlanetLocation,
  rollSalvagingJob,
  rollShootingJob,
  rollSmugglingJob,
  rollStarboundClient,
  rollStarboundNPC,
  rollStarboundStyle,
  rollStealingJob,
  rollTowerFloor,
  rollTowerHook,
  rollTowerNPC,
  rollTowerTest,
} from '../utils/oracleGames';

/**
 * The Oracle page is built from this list: one collapsible section per entry,
 * each holding any number of generators (rendered as a wrapping button grid).
 *
 * To add a game's generators, append a section here, e.g.
 *
 *   { id: 'my-game', title: 'My Game', generators: [
 *       { id: 'derelict', label: 'Derelict Ship', roll: rollDerelictShip },
 *   ] }
 *
 * A generator is just `() => string`. Game sections can reuse a shared roll
 * function as-is, or point at a tweaked copy (see utils/oracleGames.ts).
 *
 * Button labels name the thing being made ("NPC", "Floor"), never the tool
 * ("NPC Builder", "Floor Generator").
 */

export interface OracleGenerator {
  /** Stable key (unique within its section). */
  id: string;
  /** Button text. */
  label: string;
  /** Rolls the table(s) and returns the text shown in the results box. */
  roll: () => string;
}

export interface OracleSection {
  /** Stable key, also used to remember open/closed. Don't rename once shipped. */
  id: string;
  title: string;
  /** Whether the section starts open before the user has toggled it. */
  defaultOpen?: boolean;
  generators: OracleGenerator[];
}

export const ORACLE_SECTIONS: OracleSection[] = [
  {
    id: 'story',
    title: 'Story Generators',
    defaultOpen: true,
    generators: [
      { id: 'set-scene', label: 'Set a Scene', roll: rollSetScene },
      { id: 'how-much', label: 'How Much', roll: rollHowMuch },
      { id: 'random-event', label: 'Random Event', roll: rollRandomEvent },
      { id: 'pacing', label: 'Pacing Move', roll: rollPacingMove },
      { id: 'failure', label: 'Failure Move', roll: rollFailureMove },
      { id: 'plot-hook', label: 'Plot Hook', roll: rollPlotHook },
    ],
  },
  {
    id: 'world',
    title: 'Worldbuilding',
    generators: [
      { id: 'npc', label: 'NPC', roll: rollNPC },
      { id: 'group', label: 'Group', roll: rollGroup },
      { id: 'town', label: 'Town', roll: rollTown },
      { id: 'world', label: 'World', roll: rollWorld },
      { id: 'power', label: 'Magic / Power', roll: rollMagicPower },
      { id: 'item', label: 'Random Item', roll: rollRandomItem },
      { id: 'dungeon-theme', label: 'Dungeon Theme', roll: rollDungeonTheme },
      { id: 'dungeon-room', label: 'Dungeon Room', roll: rollDungeonRoom },
      { id: 'dungeon-loot', label: 'Dungeon Loot', roll: rollDungeonLoot },
    ],
  },
  {
    id: 'bordeaux',
    title: 'Bordeaux',
    generators: [{ id: 'job', label: 'Job', roll: rollBordeauxJob }],
  },
  {
    id: 'starbound',
    title: 'Starbound',
    generators: [
      { id: 'inner-planet', label: 'Inner Planet Location', roll: rollInnerPlanetLocation },
      { id: 'outer-planet', label: 'Outer Planet Location', roll: rollOuterPlanetLocation },
      { id: 'asteroid-belt', label: 'Asteroid Belt Location', roll: rollAsteroidBeltLocation },
      { id: 'style', label: 'Style', roll: rollStarboundStyle },
      { id: 'npc', label: 'NPC', roll: rollStarboundNPC },
      { id: 'client', label: 'Client', roll: rollStarboundClient },
      { id: 'shooting', label: 'Shooting Job', roll: rollShootingJob },
      { id: 'stealing', label: 'Stealing Job', roll: rollStealingJob },
      { id: 'smuggling', label: 'Smuggling Job', roll: rollSmugglingJob },
      { id: 'salvaging', label: 'Salvaging Job', roll: rollSalvagingJob },
    ],
  },
  {
    id: 'tower-of-echoes',
    title: 'The Tower of Echoes',
    generators: [
      { id: 'floor', label: 'Floor', roll: rollTowerFloor },
      { id: 'test', label: 'Test', roll: rollTowerTest },
      { id: 'npc', label: 'NPC', roll: rollTowerNPC },
      { id: 'hook', label: 'Hook', roll: rollTowerHook },
      { id: 'note', label: 'Note', roll: rollNote },
      { id: 'instrument', label: 'Instrument', roll: rollInstrument },
    ],
  },
];
