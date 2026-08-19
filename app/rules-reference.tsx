import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLOR_SCHEMES, DEFAULT_SCHEME } from "../constants/colorSchemes";
import { useAppStore } from "../store/appStore";
import GlassCard from "../components/ui/GlassCard";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Data ──────────────────────────────────────────────────────────────────────
//
// To add a plain section, paste into the relevant tab's array:
// {
//   title: 'My Section Title',
//   content: 'First paragraph.\n\nSecond paragraph.',
// },
//
// To add a section with nested sub-entries (like "Optional Rules"), use:
// {
//   title: 'My Group Title',
//   subsections: [
//     { title: 'Sub-entry One', content: 'Text here.' },
//     { title: 'Sub-entry Two', content: 'Text here.' },
//   ],
// },

interface RulesSubsection {
  title: string;
  content: string;
}

interface RulesSection {
  title: string;
  /** Plain text content. Omit when using subsections. */
  content?: string;
  /** Nested collapsible entries shown inside this section. */
  subsections?: RulesSubsection[];
}

const SOLO_SECTIONS: RulesSection[] = [
  // ── Add Solo Roleplaying sections here ──────────────────────────────────────
  {
    title: "What is Solo Roleplaying?",
    content:
      "While tabletop roleplaying is usually a group activity, it doesn't have to be. There are plenty of reasons why someone might want to play alone, and that's okay! Solo roleplaying is one of the freest ways to play an RPG, since all of the events, characters, drama, and action take place in your head." +
      "\n\nTo start solo roleplaying, begin with an idea. Pick a world that you'd like to inhabit or a story that you'd like to play out, or use the World, Plot Hook, and Town generators in the Oracle to get the ideas flowing. Once you have a general setting and vibe in mind, create a character." +
      "\n\nTo make up for not having a crew, feel free to give yourself a few extra character creation points, a healing item, or a cool magic item. Or make more than one character and play the whole group!" +
      "\n\nOnce your character (or characters) are made, you can start playing. You run both sides of the story: describe the world, talk to NPCs, and make Trait rolls whenever your character would do something risky. Use a character's or campaign's text components to keep track of important notes, NPCs, and where the story has been." +
      "\n\nIf you have a question that isn't related to an action that your character makes, like one about the world or an NPC's actions, then you can either come up with something that sounds interesting, or you can ask the Oracle.",
  },
  {
    title: "The Oracle",
    content:
      "The Oracle is the tool that speaks for the world. Whenever you want to know something that your character can't simply decide, ask the Oracle a question, roll, and interpret the answer into the story. An answer is only ever a prompt: if a result doesn't fit the fiction, read it loosely or ask again." +
      "\n\nOpen the Oracle with the dice button in the toolbar. Results are added to a running log, so you can look back at the last few answers as a scene plays out.",
    subsections: [
      {
        title: "Yes / No Questions",
        content:
          'The Oracle answers yes or no questions about the world, like "is the guard still watching the gate?" or "does the merchant recognize me?"' +
          '\n\nAnswers come back as Yes or No, sometimes with a twist attached. A "but..." means the answer holds, but it is not all good (or not all bad). An "and..." means the answer is more true than you expected — better than you hoped on a Yes, worse than you feared on a No.' +
          "\n\nIf an answer seems particularly likely or unlikely given what has already happened in the story, use the Oracle Likely or Oracle Unlikely buttons to weight the roll in that direction." +
          "\n\nOccasionally the Oracle will report that an answer is impossible. This means that the question itself may be wrong — usually a sign to back up, ask a different question, or reconsider an assumption your character was making.",
      },
      {
        title: "Focus and Detail",
        content:
          "When you need more than a yes or no, the Oracle can give you something to interpret." +
          "\n\nHow Much answers questions of degree — how big, how strong, how well-guarded, or how valuable something is." +
          "\n\nAction / Activity gives a verb: what something is doing or trying to do. Detail / Type gives a descriptive quality that colors something. Topic / Focus gives a subject or theme that a situation revolves around." +
          "\n\nRandom Event combines an action and a topic into a single prompt, and is best used when something unexpected should happen but you don't know what.",
      },
      {
        title: "World and NPC Generators",
        content:
          "The Oracle also holds generators for filling in the world around your character on the fly." +
          "\n\nNPC creates a person with an identity, a goal, and a notable feature. Group creates an organization with a type, a power level, a drive, and an operating style. Town creates a settlement with a size, a ruler, an attraction, a danger level, and a notable feature." +
          "\n\nPlot Hook gives you an objective, a reward, and an adversary standing in the way. World rolls up an entire setting: a tone and age, a strange element and how it manifests, and the environment and scope of the lands." +
          "\n\nDungeon Theme, Dungeon Room, and Dungeon Loot build out a dungeon one room at a time as your character explores it. Magic / Power, Random Item, and Magic Item generate spell effects, gear, and treasure.",
      },
    ],
  },
  {
    title: "Scene Management",
    content:
      "Since keeping things moving is on you, it helps to think of solo play as a series of scenes. Decide what your character is trying to do, play it out, and then decide what comes next. The tools below exist for the moments where you get stuck.",
    subsections: [
      {
        title: "Setting a Scene",
        content:
          "When you know where your character is going but not what they will find, use Set a Scene. It rolls a complication for the scene, which might be hostile forces opposing you, an obstacle in your way, suddenly higher stakes, an NPC acting suddenly, things not being as they seem, or the rare case where everything actually goes as planned." +
          "\n\nSometimes the scene is also altered, meaning that your expectations were wrong in some way: a major detail is enhanced or somehow worse, the environment is different, unexpected NPCs are present, or an additional complication, pacing move, or random event is layered on top." +
          "\n\nInterpret the result before you start playing the scene, and let it change what your character walks into.",
      },
      {
        title: "Pacing Moves",
        content:
          'Use a Pacing Move whenever the action lulls, a scene runs out of steam, or you find yourself asking "what now?"' +
          "\n\nA Pacing Move nudges the story forward with something new: foreshadowed trouble, an unexpected detail, an NPC making their move, a threat advancing, a plot arc pushing ahead, a new character or faction, a shift in location or conditions, a clue or lead surfacing, two existing problems colliding, or something important being lost, taken, or changed." +
          "\n\nThe result is a prompt, not a script — take whatever fits the current story and run with it.",
      },
      {
        title: "Failure Moves",
        content:
          "Use a Failure Move when a Trait roll fails and you don't know what a good penalty would be." +
          "\n\nA Failure Move might deal harm, put someone in a difficult spot, offer a hard choice with no good answer, advance a threat, reveal an unwelcome truth, foreshadow something worse to come, take away a resource or ally, turn the environment hostile, introduce a new complication, or test someone's loyalty or resolve." +
          "\n\nA good failure result should push the story in an unexpected direction rather than simply telling you that nothing happened.",
      },
      {
        title: "Playing Both Sides",
        content:
          "You play both your character and the world, so it's worth being honest about which hat you're wearing. When you're playing your character, act on what they know and want, even when you know better. When you're playing the world, let NPCs pursue their own goals and let the Oracle surprise you." +
          "\n\nKeep notes as you go. Writing down NPC names, open threads, and unanswered questions gives future scenes something to build on, and it keeps a long solo campaign from drifting.",
      },
    ],
  },
];

const VIATOR_SECTIONS: RulesSection[] = [
  // ── Add Viator sections here ─────────────────────────────────────────────────
  {
    title: "What is Viator?",
    content:
      "Viator is a universal rules-lite Tabletop RPG system developed by RealCaptainKurt. Universal means that it can support games in basically any world or setting imaginable, while rules-lite means that it's easy to learn and play!" +
      "\n\n[Click here](https://realcaptainkurt.itch.io/) for more info on Viator and official settings!",
  },
  {
    title: "Characters",
    content:
      "Characters in Viator are designed to be simple, lightweight, and powered by imagination. See the sections below for the different parts of your characters.",
    subsections: [
      {
        title: "Description",
        content:
          "A character's Description is a short passage that describes anything non-mechanical that you wish to note about your character. A description could contain their backstory, style, personality, relationships, or any other combination of things." +
          "\n\nA description has no bearing on how a character performs, so it can be as simple or elaborate as you desire.",
      },
      {
        title: "Traits",
        content:
          "A character's Traits are freeform titles that represent different aspects about an individual. A character’s Traits work together to show who they are, what they have, and what they can do." +
          '\n\nTraits each have a name and a level. The name of a Trait implies what you can use it for, and the level defines how good you are at that thing, from a scale of 1 to 6. A character with the Trait "Dutiful Paladin (4)" could use it to swing a sword, recite scripture, smite heretics, and heal an ally. A character with the Trait "Stage Magician (2)" is probably good at sleight of hand, trickery, and spectacle.' +
          "\n\nTraits can be temporarily lowered by failing rolls or taking risks. This is called taking Trait damage, or just taking damage. A damaged Trait performs worse, since you use a Trait's current level for rolls." +
          "\n\nIf a Trait ever reaches level 0, then that character is considered defeated, and can no longer use any of their Traits until healed. Depending on the type of damage, Traits might heal back immediately after an encounter, after a good night's rest, or after professional help, for example. A Trait's maximum level can be increased by spending XP (see Progression and XP)." +
          "\n\nYour character typically starts with 10 levels to split between their Traits, with no Trait beginning above level 4. Unused levels could be converted to 10 experience points (XP) for use later in the game, if desired.",
      },
      {
        title: "NPC Traits",
        content:
          "NPCs are usually simpler than your characters, with more all-encompassing Traits. One-off or background characters can usually be summed up with a single Trait, like Buff Barkeep (2) or Rebel Pilot (3). More notable or multi-faceted NPCs might have more Trait options, however. A Big-Bad-Evil-Guy might have Bloodthirsty Vampire (7) and Haunting Charisma (4), while the miserly shopkeeper that you keep running into might have No-Nonsense Merchant (4) and Eye for Valuables (3)." +
          "\n\nMost background or nameless characters will have Traits that are level 2 or 3. A level 4 Trait implies that someone is really good at what they do, while levels 5 or 6 are approaching mastery. Anything above level 6 should be reserved for massive, endgame threats that cannot be beaten outright and must be planned around." +
          "\n\nCampaigns track NPCs in their own NPC section, and an NPC component can be added to any character or campaign as well. Either way, an NPC holds a name, a description, and a list of Traits.",
      },
      {
        title: "Gear",
        content:
          'Like skills, gear is mostly implied by the Trait. A character with "Dutiful Paladin (4)" probably has a holy book, armor, and some kind of weapon. A character with "Tomb Raider (4)" probably has rope, lockpicks, torches, and other tools that would help with raiding tombs. You can choose to have any mundane gear at any time that logically fits with a Trait.' +
          "\n\nAnything that you acquire along the way can go in a character's inventory. An inventory can be used to store and track money, treasure, magic items, notes, specialized gear or anything else that a character could reasonably carry. Items can supplement a Trait roll (usually granting advantage) or be used on their own as a simple action to produce an appropriate narrative effect." +
          '\n\nTo add an inventory, click the settings button of a character and toggle Edit Mode. Then, select "Add component," select the List option and title it Gear, Inventory, Items, or whatever else you prefer.',
      },
      {
        title: "Other Components",
        content:
          "Other components can be added on to characters independently as needed. The different types of components can be used to keep track of inventory, teammates, vehicles, plot hooks, cybernetics, or anything else as desired." +
          '\n\nYou can add components by clicking on settings with a character selected, toggling edit mode, and then clicking "Add component" at the end of the character sheet. Custom components can be reordered as desired.',
      },
    ],
  },
  {
    title: "Progression and XP",
    content:
      "As you go on adventures, you will gain XP, which is tracked in the top right of the character sheet. Over the course of a session, you should gain around 10-20 XP, awarding yourself 1-2 XP at a time for overcoming challenges, good roleplaying, and fun moments. You can spend XP in several ways:" +
      "\n\n- You can spend 2 XP before a Trait roll to gain advantage." +
      "\n- You can level up a Trait (to a max of level 6) at any time by spending 10 times the Trait’s new max level." +
      "\n- You can gain a new Trait by spending 10 XP as long as there is a narrative explanation, like adopting a pet, finding a cool sword, or developing a newfound love for cooking.",
  },
  {
    title: "Rolling Dice",
    content:
      'Whenever you want to do something that carries risk or is not otherwise guaranteed to succeed, you should make a Trait Roll. To make a Trait Roll, you decide which Trait you want to use and then roll as many dice as the Trait currently has levels. The selected Trait must have a chance of completing the action; you could use "Stealthy Rogue (3)" to sneak past a guard, but you probably couldn\'t use "Armored Titan (3)."' +
      "\n\nTrait rolls can also be modified by gear, spells, or narrative position as desired. Advantage lets you roll one extra die, while disadvantage forces you to roll one fewer die. These can be stacked from multiple sources." +
      '\n\nThis application has Viator rolling logic built in to the "Viator Roll Xd6" button, but you can use the following logic to roll your own physical dice. A roll of 1, 2, or 3 will count as a miss, and can be ignored. A 4, 5, or 6 will count as a hit. Sixes also explode, meaning that it counts as a hit and is then re-rolled. After any dice explosions, the total number of hits and the type of roll (shown below) decides roughly how well you do.',
    subsections: [
      {
        title: "Checks",
        content:
          "Checks are character-vs-environment rolls, and should be made whenever an action has a set risk. Before rolling, give the action a Target Number (TN) based on how hard the action is for the chosen Trait. Use the below list to pick the right TN, although most TNs should fall between 1 and 3." +
          "\n\n1 - Easy / Routine actions that are not guaranteed to succeed. A novice has a 50/50 shot at it." +
          "\n2 - Medium / Normal actions that still carry some risk. " +
          "\n3 - Hard / Challenging actions that an expert may fail." +
          "\n4 - Heroic / Extreme actions that only masters of a craft can pull off." +
          "\n5+ - Legendary / Godly actions that should not be possible under normal circumstances." +
          "\n\nIf the Trait Roll matches or beats the TN, then the action succeeds! If not, then the action fails, and you take some penalty, like disadvantage, taking damage, or worsening the situation. (Use the Failure Move option in the Oracle to generate a random result after missing a roll.)",
      },
      {
        title: "Contests",
        content:
          "Contests are character-vs-NPC rolls, and should be made whenever your character (or an NPC) comes head-to-head with another character. Select the Traits used by both competing sides and then make a Trait Roll for each one. The higher roll wins, and gets their desired outcome. If the rolls are a tie, then the initiator (usually your character) wins.",
      },
      {
        title: "Combat",
        content:
          "Combat is the name for any extended fight, challenge, or obstacle that can’t be overcome with a single roll. To initiate Combat, give each opponent (or objective) a Trait level and mark them down somewhere. Once all members of a Combat encounter are accounted for, Combat begins. Each member takes turns moving and making actions, going in whatever order makes narrative sense and keeps the action moving, until one side is defeated." +
          "\n\nMovement in Combat is loose, and mostly constrained by your visualization of the arena and logical movement speed." +
          "\n\nOptionally, if you want more structure than loose movement, you can divide the battlefield into combat zones. Zones are rough separations of an area, which might be different rooms, spots of forest separated by a fallen tree, or anything else that naturally sections off the battlefield. On their turn, a character can use their movement to reposition within a zone, OR to move into an adjacent zone. When using a melee attack, like a sword, club, or fist, characters can only attack enemies within their own zone. When using a ranged attack, like a bow, gun, or fireball spell, characters can choose to attack enemies in adjacent zones, as long as there is nothing blocking their view." +
          "\n\nZones can also have their own Traits, like Bustling With People (2) or Rickety Bridge (1). Characters (or enemies!) can use a Zone Trait to gain advantage on an action, which then decreases the level of the Zone Trait by one as a resource runs out or combatants adjust tactics. When a Zone Trait reaches 0, it can no longer be used in Combat." +
          "\n\nActions are anything that requires a roll or uses an item. An attack is any action intended to directly harm an opponent or worsen their immediate position. To attack, roll a Contest against the target, dealing one level of damage to them on a success, or taking one level of damage on a failure." +
          "\n\nActions that intend to hinder an enemy or manipulate the environment in more complex ways are considered spells (see Spellcasting below)." +
          "\n\nOnce all members of a team are defeated, then Combat is over, and the winning side decides the outcome (within reason).",
      },
    ],
  },
  {
    title: "Spellcasting",
    content: "Spells in Viator are any actions, magical or otherwise, that can do more than just harming one enemy. Like skills, the spells available to a character are mostly defined by their Traits. A \"Fiery Mage (3)\" can blast a fireball or light an enemy ablaze, but probably couldn't cure wounds or poison targets. A \"Dutiful Paladin\" can probably heal wounds and smite enemies, but couldn't talk with animals or summon demons." +
    "\n\nSpells are defined by their effect rather than their source, so shooting a fireball and throwing a grenade are treated the same way." +
    "\n\nTo cast a spell, describe the effects that you want the spell to have (eg. blowing up a box, flipping gravity, or changing hair color), then use the following chart to give it a fair TN based on the effect and the scale of the spell. Then, roll a Check against the TN to attempt to cast the spell. On a success, the spell casts without issue, although NPCs may attempt to make a counter Check to beat your roll in order to avoid the effect. On a failure, ask the Oracle for a Failure Move." +
    "\n\n1 - Small effects, or spells with limited scope or small targets" +
    "\n2 - Moderate effects, or spells targeting a small number of creatures" +
    "\n3 - Notable effects, or spells targeting several creatures" +
    "\n4 - Major effects, or spells covering wide areas" +
    "\n5 - Extreme effects, or spells with worldwide ranges",
  },
  {
    title: "Optional Rules",
    content:
      "By design, Viator is a rather simple game — all the base rules fit on one page! This simplicity lets Viator work with a variety of game styles, but it can also make it feel limited on its own. The rules below are optional modules that can be slotted into a game as needed to better fit a specific play style. Pick and choose based on what sounds cool to you.",
    subsections: [
      {
        title: "Addiction",
        content:
          "Certain drugs, medicines, or activities can be used to gain temporary buffs, but may carry the risk of addiction. While addiction to any substance can be a heavy narrative topic, use the following rules to add mechanical penalties for darker games." +
          "\n\nWhenever a character uses an addictive substance, they must make a Check to resist its influence using a Trait of their choice, with a TN equal to the number of times they have partaken that day minus 1 (minimum of 0). On a fail, the character gains one level of the Addicted (*) Trait, up to a max of level 6." +
          "\n\nWhen an addicted character is NOT under the influence, they roll with stacks of disadvantage equal to half of their current Addicted level (rounded down) when making any Trait roll that isn't related to getting the next hit." +
          "\n\nThe Addicted Trait can only be reduced by taking certain hard-to-obtain medicines or by staying clean. For each period of time that an addicted character goes without partaking (which could be an hour, a day, or a week, depending on the substance), they reduce their Addicted Trait by one level.",
      },
      {
        title: "Armed Combat",
        content:
          "In low-powered settings or games where characters lack proper combat training, the gear on your back can be more important than any knowledge or skills that you may have. Use the following rules for scrappier Combat with a focus on weapons over Traits." +
          "\n\nCharacters should keep a list of equipment called arms. Arms can be weapons, armor, wands, guns, or generally anything that could be useful in battle. Like Traits, arms each have a name and a level from 1-6, such as Scrap Pistol (3), Short Machete (2), Wrapped Glass (1), or Reinforced Leather Jacket (2)." +
          "\n\nDecide your character's starting arms during character creation. The exact arms depend on the power level of the setting, but the default is one Weapon (2) and one Armor (2)." +
          "\n\nIn Combat, characters can use their arms for attacking, defending, and spellcasting instead of their own Traits when appropriate. These actions work normally, dealing damage to an opponent (or their arms) on a success and taking damage on a failure. If an arm hits level 0, it permanently breaks and becomes unusable, but the character is not defeated and can keep using their Traits or other arms. Most NPCs will not willingly break their equipment, and will choose to take Trait damage instead if their arms would break." +
          "\n\nArms heal after Combat with access to the appropriate resources, like scrap metal, ammo, or duct tape. Arms can also be added or leveled up by spending XP equal to 5 times its new max level.",
      },
      {
        title: "Body Mods",
        content:
          "Whether it be high-tech chrome, writhing foreign flesh, or badass magical tattoos, the human body can be upgraded in many different ways. One-off implants can be treated like magic items, but for a more comprehensive system, use the following rules." +
          "\n\nA character's body modifications, or mods, go in a separate list called Mod Slots. Body mods are similar to Traits, in that they have a name describing their functionality and a level from 1-6, with 1 being entry level and 6 being bleeding-edge high quality. Mods should be self-descriptive and have one primary effect, like Hidden Sword Arm (3) or Dragonfly Nerves (2). Mods can be added or replaced by spending XP equal to 5 times the new mod's level at an appropriately qualified clinic, or they can be removed or repaired at a clinic for free." +
          "\n\nMods can either be used on their own for appropriate Trait rolls, using their level like you would any other Trait, or they can supplement another Trait's roll by adding stacks of advantage equal to half of the mod's level (rounded down, minimum of 1). A character could use Hidden Sword Arm (3) on its own to roll 3 dice, while a character with the Neon Swordsman (3) Trait could add half of Hidden Sword Arm (3)'s levels to roll a total of 4 dice." +
          "\n\nTo simulate the internal battle that implants can cause, add and compare the levels for Traits and mods. If the total levels of mods exceeds the total levels of Traits, then the character is at risk of losing their humanity. After every Trait roll that an at risk character makes, they make a humanity roll using a number of dice equal to the difference between total mod and Trait levels. If any dice in a humanity roll show a 1, then they temporarily lose control and cause some bad effect, like collateral damage or self harm. If 3 dice show 1 at once, then that character loses their mind permanently and lashes out at anything around them until stopped.",
      },
      {
        title: "Broken Gear",
        content:
          "Implied gear for a character's Trait may be lost during gameplay. To give this a mechanical downside, use the following rules." +
          "\n\nIf gear essential for a Trait is ever missing, broken, or otherwise unusable, then that Trait is considered unarmed. An unarmed Trait can still make rolls as usual, but only rolls using half the Trait's current level, rounded up.",
      },
      {
        title: "Brutal Combat",
        content:
          "Combat in Viator can tend to go slowly, especially at higher levels when characters have multiple combat-ready Traits. For quicker and deadlier Combat, use the following rules." +
          "\n\nDuring Combat, instead of dealing a single point of damage on a successful hit, damage dealt is equal to the difference between the attacker's and defender's rolls. For example, if the attacker rolls a 4 and the defender rolls a 2, then the defender will take two points of damage in their defending Trait. As usual, either side can take damage depending on who rolls higher.",
      },
      {
        title: "Crafting (Simple)",
        content:
          "Some Traits, like Tinkerer, Inventor, or Blacksmith, imply the ability to create things. For simple and quick item crafting, use the following rules." +
          "\n\nFor one time use items, mundane items, or items that you could reasonably have made ahead of time, item creation can be a single crafting Check. To make a crafting Check, describe what it is that you want to make. Then weigh the complexity of the item (1-3 base TN), the urgency of the current situation (+/- 1 TN), and available resources (+/- 1 TN) to set a Target Number.",
      },
      {
        title: "Crafting (Complex)",
        content:
          "Crafting magical, special, or long-term items is more in-depth. For complex item crafting, use the following rules." +
          "\n\nThe process begins in one of two ways: either you find some special component that you want to turn into an item, or you have an idea for an item and must find an appropriate special component. In either case, crafting a magic item revolves around obtaining one specific material, like a mythical ore, the blood of a dragon, or an experimental battery." +
          "\n\nNext, set a crafting level between 7-12 based on the desired output, with 7 being a relatively simple item and 12 being a notably complex or powerful one. The crafting level should represent both the difficulty involved in making the item as well as the ideal power level of the finished product." +
          "\n\nThen work to reduce the crafting level by providing quality materials, preparing tools or a workspace, or doing research for the craft. These steps may take minutes or they could take days in-game, depending on the action. Most preparation steps will involve a Check of some kind, with TN depending on how helpful and appropriate the action is. Each successful act of preparation reduces the crafting level by one, reducing a maximum of 6 times." +
          "\n\nOnce all preparation is finished, the character with an appropriate crafting Trait begins crafting Combat with the item. Instead of taking turns or making specific actions, the crafter simply rolls successive Contests against the item's current crafting level, with the loser of each Contest losing a level, until one side reaches level 0. If the item's crafting level reaches level 0 first, then the item is successfully created! If the crafter reaches level 0 first, however, then they fail the craft, and the special component and other materials are lost. To avoid this, the crafter can choose to end crafting Combat early once the item reaches crafting level 2 or lower, although this creates a flawed item that has a drawback." +
          "\n\nAfter a successful craft, the item is treated like a magic item as normal. It can be used by an existing Trait, added as a new Trait, or used standalone, depending on the nature of the crafted item.",
      },
      {
        title: "Difficult Terrain",
        content:
          "Certain conditions can make movement difficult, like heavy snowfall, high waters, or especially thick underbrush. Use the following rules if you want to add mechanical difficulty to a harsh environment." +
          "\n\nThere are two levels of difficult terrain: unsteady and hazardous." +
          "\n\nUnsteady terrain is any obstacle that slows you down due to effort or attention, like moving through a foot of water, taking a precarious mountain path, or jumping between rocks floating on lava. A character moving through unsteady terrain has their movement speed halved, and they have disadvantage on any actions that require speed or agility." +
          "\n\nHazardous terrain is any kind of environment that a person could not usually move through safely, like the deep sea, the vacuum of space, or the mental minefield of the astral plane. When in hazardous terrain, all rolls that a character makes can use a maximum of 1 die. To safely act in hazardous terrain, a character must use specialized equipment, like a diving or shielded suit, a harpoon gun, or a grounding idol, which allows them to treat the appropriate hazardous terrain like it is unsteady terrain." +
          "\n\nSome Traits may imply the ability to move through unsteady or hazardous terrain naturally. If a character does have such a Trait, they ignore the penalties of difficult terrain, no matter which Trait they choose to use.",
      },
      {
        title: "Disease and Affliction",
        content:
          "After going through particularly unsanitary conditions, like wading through a dirty river, eating undercooked meat, or failing to eat at all, a character might get sick. To simulate a sick or otherwise afflicted character, use the following rules." +
          "\n\nWhen a character has a chance of catching a disease, they should roll a Resistance Check using a Trait of their choice with a TN of 1-3 depending on the risk. On a success, the character avoids any penalty. If they fail, they gain the Diseased (1) Trait." +
          "\n\nA diseased character has all of their Traits' max levels reduced by the level of their Diseased Trait. If a Trait's level is reduced to 0 in this way, it becomes unusable until healed. If all Trait levels are reduced to 0 because of the disease, then the diseased character becomes too sick to do anything, or in extreme cases, dies outright." +
          "\n\nEvery day, a diseased character can make another Resistance Check with the same TN to try and shake off the sickness. Medicine and adequate rest can give a diseased character one stack of advantage each towards their Resistance Check. On a success, the Diseased Trait goes down one level, while it goes up one level on a failure. If the Diseased Trait reaches level 0, then the character recovers and the Diseased Trait is removed.",
      },
      {
        title: "Downtime",
        content:
          "Sometimes, due to the threat of outside pressure or in-game timers, your characters have ample time to use between missions. To keep your characters engaged and busy outside of action scenes, use the following rules." +
          "\n\nDowntime is any stretch of low-risk time between missions, which could be days or weeks depending on the setting. No matter how long the downtime is, each of your characters chooses one downtime activity to focus on, and you describe how they attempt it. The following options act as a base list that should fit most games, but they may be expanded (or restricted) based on the setting. Some activities require other optional rules." +
          "\n\nAcquire Asset: Attempt a Check to gain access to a specific asset for a short time, like false documents, a vehicle, or an agreement with an ally, with a TN of 1-3 depending on the asset." +
          "\n\nAdvance a Goal: Requires the Goals optional rule. Attempt a Check to work towards a given goal with a TN of 1. On a success, reduce the goal's level by the number of hits." +
          "\n\nCrafting: Requires the Crafting (Complex) optional rule. Attempt a preparation Check to help gather materials or make crafting a given item easier, with a TN of 1-3 depending on the action. On a success, lower the item's crafting level by 1." +
          "\n\nDestress: Requires the Stress optional rule. Attempt a Check to indulge in one of your vices or otherwise relax, with a TN of 1. On a success, reduce your stress by one level." +
          "\n\nNetworking: Requires the Reputation optional rule. Attempt a Check to meet with an NPC contact (TN 1) or establish a new one (TN 2). On a success, either gain one reputation with the contact or create a new one starting at reputation 3, respectively." +
          "\n\nStudy: Attempt a Check to research a specific subject, with a TN of 1-3 depending on how secret the subject is. On a success, you may learn one answer about the subject." +
          "\n\nTrain / Work: Attempt a Check to train or work a day job with one of your Traits, with a TN of 1. On a success, roll a die and divide the result by 2 (rounding up), then gain that much XP.",
      },
      {
        title: "Do-Anything",
        content:
          "There are times when you will want to do things that your character's Traits simply don't cover. To allow attempts at actions that would normally be impossible, use the following rule." +
          "\n\nYour character has an invisible Do Anything (1) Trait not listed on their character sheet. This can be used to attempt something that's technically possible, but not in the range of their Traits.",
      },
      {
        title: "Dying",
        content:
          "By default, being defeated in Combat is not character-ending, and characters will generally all recover after a battle. If you want to add some deadly stakes to defeat, use the following rules." +
          "\n\nWhen a character is defeated in Combat, they cannot move or take actions as usual, but they also must make a Death Check immediately after being defeated and then once on their turn per continued round of Combat. To make a Death Check, roll a single die with a TN of 1, keeping track of hits and misses separately. A roll of six explodes as usual, but any following rolls can only add to the list of hits, and do not add to the miss count." +
          "\n\nA defeated character can be stabilized by another character by making a Check as an action with a TN equal to the number of missed Death Checks that the defeated character has made. A stabilized character still counts as defeated, but no longer makes Death Checks and heals one level after Combat as usual. A character with an appropriate medic / doctor / similar Trait can also choose to heal the defeated character by one level, resetting their Death Checks and getting them back into the fight." +
          "\n\nIf the character reaches 3 Death Check hits, then they recover and regain one level in their defeated Trait. If the character reaches three misses, however, then they succumb to their injuries and die permanently.",
      },
      {
        title: "Failing Forward",
        content:
          "By default, Viator offers two paths as the result of a roll: success or failure. For a third option that increases drama and makes Checks more tense, use the following rules. For a whole new ruleset based around this idea, see the In Tenebris section below." +
          "\n\nWhenever a character makes a Trait roll, if the roll matches the TN exactly, then instead of succeeding like normal, they get a partial success. A partial success is like an answer of \"yes, but\" or \"no, but,\" where the character gets a part of what they want but introduces a new obstacle in the process. The exact balance of success vs obstacle is up to you, but it is important that the result pushes the story forward in an unexpected direction, rather than simply confirming or denying what your character wants to do.",
      },
      {
        title: "Goals",
        content:
          "Some actions cannot be completed or resolved with one roll. Complex jobs like fixing up a junker car, defusing a bomb, changing someone's mind, or translating an ancient book are all best approached slowly and with several attempts. To simulate the slow progress of a long-term goal, use the following rules." +
          "\n\nWhen something will take time, it can be made into a goal. A goal can be any challenge, event, or obstacle that requires time and multiple steps to overcome. A goal is similar to a Trait, with a name that describes the task and a level (usually between 4 and 8, depending on its complexity), like Final Exam Project (4) or Creating a Shop (6)." +
          "\n\nYour characters can work towards the goal by describing how they help the situation and then making a Check with an appropriate Trait, usually with a TN of 1. Each successful Check reduces the goal by one level, while the surrounding situation getting worse can increase the goal by one level. Reducing the goal to level 0 fully completes it.",
      },
      {
        title: "Hacking",
        content:
          "While simple hacking attempts can be done with a single Check, more complex systems require more effort. Although they are flavored as hacking, use the following rules to cover any tense breaching attempt, like lockpicking, bomb defusal, social manipulation, or other delicate situations." +
          "\n\nHacking is an encounter where a hacker attempts to breach a secured space, called the mark. A mark has three components: a TN representing how difficult the mark is to hack (usually between 1-3), a Progress (*) Trait that tracks successful moves (usually between 3-6), and a Risk (*) Trait that tracks failed moves (usually between 3-6). A higher Progress Trait means that the mark takes longer to open, while a shorter one is quicker to open. Likewise, a higher Risk Trait means that there is plenty of room for failure, while a lower value means that danger is near." +
          "\n\nExamples: Small Corps Archives - TN 2, Progress (3), Risk (5). Fascist's Camera Room - TN 3, Progress (4), Risk (2)." +
          "\n\nOnce you have defined all the values, the character may attempt to hack in. To do so, they must make a series of Checks with a relevant Trait against the TN of the mark, with each Check taking one action. On a successful Check, the Progress Trait of the mark goes down by one. On a failed Check, however, the mark's Risk Trait goes down by one. If the mark's Progress Trait reaches 0, then the attempt is successful, and the character breaches the mark. If the Risk Trait reaches 0, the hacking attempt isn't automatically over, but something bad happens — perhaps an alarm gets tripped, or the lockpicks break, or someone else becomes aware of the hacker and will attempt to stop them." +
          "\n\nThe hacker also has special moves they can do. The hacker can Slow Down on a Check, doubling the time needed (from one action to two, if in Combat) but ignoring the Risk Trait on a failure. They can also Rush the attempt, reducing Progress or Risk by 2 based on their Check. Finally, outside characters can give the hacker advantage or disadvantage by messing with the overall situation, like distracting a guard or enabling a firewall.",
      },
      {
        title: "Health",
        content:
          "Characters can swap between Traits in Combat as much as they want between rounds, which adds freedom during encounters but can slow the game down, especially at higher levels. For quicker, more consistent Combat, use the following rules." +
          "\n\nAt character creation, your character gets a Health (*) Trait for free that starts at level 4. NPCs should also have a Health Trait, usually matching their highest Trait level. This Health Trait cannot be used for rolls, and only keeps track of damage. If a character would take damage during Combat or as a result of a roll, they reduce their Health Trait instead of their rolled Trait. If a character's Health ever reaches level 0, then they are defeated like normal." +
          "\n\nAs usual, healing depends on the type of damage, and the Health Trait can be leveled up like other Traits by spending XP equal to 10 times its new max level." +
          "\n\nThe Health rule can be tweaked to fit very different play styles. For a high-powered video-gamey feel, allow Health Traits to yo-yo up and down by taking bullets like a champ and then picking up health packs from defeated foes, or by spending an action in Combat to perform some quick first aid." +
          "\n\nFor a tough, gritty feel, reframe the Health Trait to be more like a shield or luck barrier. Once your character's Health hits 0, they do not become defeated, but now they have to take Trait damage if wounded. For this style of play, only the Health Trait recovers after resting, while Trait damage is more serious and requires proper medical attention." +
          "\n\nTo speed up Combat without slowing down progression, tie the level of the Health Trait to the character's highest Trait level, instead of spending XP to level up health as normal.",
      },
      {
        title: "Helping",
        content:
          "When one character makes a Check, another character can choose to help them as an action. To do so, the helper describes how they can supplement the target's action using one of their Traits, then they roll using that Trait. Half of the helper's hits, rounded down, count towards the target's next action.",
      },
      {
        title: "Hooks and Tales",
        content:
          "Hooks and Tales offer ways to get more invested in your character during character creation, and give easy ways to personalize the story. Use the following rules to add stakes to sandbox-style games or just encourage more roleplay." +
          "\n\nA Hook is a way for a character to drive the story by giving them a strong internal motivation, a fatal flaw, or an established enemy. A hook can be as simple or complex as you like, as long as it adds opportunity to drive the story forward in a compelling way." +
          "\n\nA Tale is an extended backstory for a character, describing who they are and what they did in life before the adventure begins. It can be anywhere from a couple paragraphs to several pages, as long as it fits with the world and established story." +
          "\n\nAt character creation, a character with a hook and / or tale gains one extra point that can be put into their Traits. Additionally, whenever your character's hook or tale becomes relevant to the story, they get 1 XP.",
      },
      {
        title: "Initiative",
        content:
          "By default, characters and NPCs in Combat don't have a set turn order, instead moving in whatever order makes narrative sense and ensures that everyone gets to act. To add a little more structure to Combat, use the following rules." +
          "\n\nWhen Combat begins, all participating members make an Initiative Roll. Instead of a normal Trait roll, an Initiative Roll always uses 2 dice, and you count up the totals on the dice to get your result instead of counting hits like usual. Certain enemies may have advantage or disadvantage depending on their speed. Combat then follows in order from highest roll to lowest, breaking any ties with follow up rolls, until Combat ends.",
      },
      {
        title: "Investigation",
        content:
          "Whether you're playing as world-class spies, nosy kids, or sad detectives with tragic pasts, investigating the dastardly deeds done in secret falls to you. Planning a good mystery takes a lot of work and prep, though. Use the following rules as a framework to make mysteries a little bit easier." +
          "\n\nThe first step when creating a mystery is to start at the end and work backwards. What is the big secret or mystery being investigated? Is it the location of Mr. Evil's secret lair, or the culprit who burned down Mrs. Rose's shop? Next, come up with 4-6 clues that point to the mystery. Clues can be discovered by making Checks, talking with NPCs, or just asking the right questions during gameplay. Each clue should reveal a different layer to the mystery, not solving the case on their own, but coming together to narrow down possible results." +
          "\n\nEach clue should also have more than one opportunity to be found. If a locked room hides some evidence, there should be an NPC that knows the same thing to talk to instead. As long as there is at least one alternate way to discover a clue, you should be fine." +
          "\n\nIf a clue can't be found and the game begins to stall due to bad rolls, roleplaying, or story reasons, then you can take a Deal with the Devil. A deal should keep the story moving forward by revealing a clue, but it should come at a cost you name up front, like the bad guy making a sudden move or an NPC becoming suspicious of your character.",
      },
      {
        title: "Investigation (Emergent)",
        content:
          "If you want to run a mystery but don't want to plan out an entire plot, then use the following rules for a quick-and-dirty investigation story." +
          "\n\nRead through the prior Investigation rule, but don't plan out clues or even the answer to the mystery. Instead, start with a broad question (where is the base, who is the culprit of the crime) to work on solving. Clues can then be pre-planned or created during gameplay, as long as there is no set answer." +
          "\n\nAt any point in the investigation, you can propose a theory about the final mystery and then make an Investigation Check. This Check has a TN of 6, but each clue that can be worked into the theory reduces the TN by 1. If the Check fails, then the theory is incorrect, and a new complication arises based on the guess. If the Check succeeds, then that theory becomes canon to the game, and you then have to deal with the truth that you created.",
      },
      {
        title: "Leveling Fiction",
        content:
          "Some Traits imply weakness or inexperience, like Novice Gunslinger (1) or Beginner Painter (1). To avoid staying as a beginner forever, use the following rules." +
          "\n\nWhen a Trait hits levels 3 and 5, it may be renamed to better fit the desired fantasy. For example, Novice Gunslinger (1) might change to Precise Gunslinger (3) and then to Dual-Wielding Gunslinger (5). The core idea of a Trait cannot change in this way, but the name change can represent increased skill, a notable new technique, or just a fresh style.",
      },
      {
        title: "Limited Spellcasting",
        content:
          "By default, spellcasters and users of supernatural abilities don't have a set spell list, as the abilities that they can use are simply implied by the Trait. For more magically-focused settings or just a stricter spell system, use the following rules." +
          "\n\nUnderneath their Traits, spellcasting characters should make a list of abilities called a Spell List, where they keep track of their spells. A spell is any defined ability along with its TN, like Fireball (3), Brainwash (2), or Divine Smite (2). Some settings will have a predefined list of spells to choose from, but you can also create or customize your own with defined effects and a fair TN." +
          "\n\nA spellcaster can only have as many spells in their Spell List as they have levels in their spellcasting Trait, and they can swap out a spell by spending one XP during a safe resting period. A character with Wizened Wizard (4) and Demonic Pact (2) could have 4 arcane-type spells and 2 demonic-type spells, for example." +
          "\n\nAdditionally, the level of a spell cannot exceed the level of its spellcasting Trait. A Sorcerer (4) could add the spell Call Lightning (3) to their Spell List, but a Sorcerer (2) could not." +
          "\n\nThe Limited Spellcasting and Mana rules can be used for more than just magic! A Spell List can track a netrunner's collection of pre-programmed daemons, a superhero's named moves, or a badass's arsenal of weapons.",
      },
      {
        title: "Mana",
        content:
          "By default, spellcasters only lose resources if their Spell Check fails. To add more scarcity, strategy, and consistency to spellcasting, use the following rules." +
          "\n\nAll spellcasting characters get a Mana (*) Trait for free that has a level equal to twice their spellcasting Trait's level. A character with Angelic Warlock (4) would have Mana (8), while a character with Telekinetic Kid (2) would have Mana (4). This Mana Trait cannot be used for Trait rolls, and only acts to keep track of how many spells the character can cast." +
          "\n\nWhen casting a spell, instead of rolling to beat a spell's TN, the caster can instead choose to spend Mana equal to the spell's TN. When cast in this way, the spell automatically succeeds, and any targets can roll against the spell's mana cost to avoid its effects." +
          "\n\nWhen a character runs out of mana, they can continue casting spells as normal, but they will always take a point of damage if the spell roll fails or if any targets pass their Resistance Check. Mana can be regained by taking certain consumables like potions or just getting a good night's rest." +
          "\n\nThe Mana Trait can be reflavored as electricity that needs to be routed between different nodes, or ammo that can be recovered from defeated foes.",
      },
      {
        title: "Milestone XP",
        content:
          "It's easy to forget to hand out XP during gameplay, especially if you're used to milestone leveling from other systems. This rule fixes that!" +
          "\n\nInstead of tracking XP while playing the game, award yourself XP in a bulk amount at the end of sessions. Completing missions or storylines should award 5 or 10 XP depending on size, while fun moments, combat encounters, and good roleplaying should each add 1-2 XP on top of that. Depending on the length and story density of a session, this should usually be between 5 and 20 XP.",
      },
      {
        title: "Money",
        content:
          "Money is not something that is tracked in base Viator. It is assumed that your character has enough cash on hand to buy food, lodging, and tools as needed. To add complications and choice in capital-heavy settings, use the following rules." +
          "\n\nIn addition to its normal uses, XP can also act as your character's wealth. Whenever a character would spend money on a resource, there is now an XP cost. This applies to both regular costs, like food and rent, as well as to rarer purchases, like new gear or a guard's bribe. Rather than converting XP to any specific monetary value, there are four tiers of luxury that XP can cover:" +
          "\n\n1 XP - Standard: Food and a night's stay at a cheap tavern or hotel, simple clothes, trinkets, a small bribe, etc." +
          "\n3 XP - Nice: A fancy meal with a contact, a week's worth of simple room and food, a night at a fancy hotel or manor, a simple weapon or armor, etc." +
          "\n10 XP - Luxurious: A priority meeting with a local leader, a month's worth of rent, hiring experienced workers or mercenaries, a complex or notable piece of gear, weapon, or armor, etc." +
          "\n25 XP - Extravagant: A permanent respectable living space, loyalty of a small business, a \"request\" for a leader or official, etc." +
          "\n\nDepending on the setting, these costs might be sparse or optional, or they can be a constant pressure. The looming mortgage of a spaceship, the balance of healthy food for a street rat, or just the daily cost of living in a hyper-capitalist society can all act as plot hooks and economic pressure." +
          "\n\nFor any larger cost, like buying a spaceship, securing a building or business, or funding an army, the cost should be narrative rather than mechanical. Instead of paying XP, massive purchases should require more than just money, like favors, missions, or macguffins gathered over multiple sessions. A character who cannot (or will not) pay an XP cost may still acquire a resource through credit, favors owed, or other narrative strings attached.",
      },
      {
        title: "Perks",
        content:
          "A character's Traits can define a lot about them, but the abilities they represent are inherently inconsistent. A level 6 master can still roll a 0, after all! To give a character abilities that are limited in use but always consistent, use the following rules." +
          "\n\nPerks are a type of Trait with a single, defined use case. Perks are marked with [brackets] rather than (parenthesis), and cannot be used for Trait rolls. Perks can be bought like other Traits during character creation or gameplay, but perks always start at level 2 for the price of level 1, and can then be leveled up from there like normal. A perk's level shows how many times it can be used in a day, with all perk levels recovering after a night's rest." +
          "\n\nRename and reflavor the below effects as desired, or come up with similar custom perks." +
          "\n\nHealth Potion: Heal 1 level in a damaged Trait for yourself or another character." +
          "\n\nHelping Hand: Define a temporary buff effect — like extra speed for a minute, flight for 10 seconds, or advantage on the next Trait roll — and give that effect to a willing ally." +
          "\n\nInsult to Injury: Define a temporary debuff effect — like freezing in place, dropping a weapon, or disadvantage on the next Trait roll — and give that effect to an enemy after a successful attack on them." +
          "\n\nLucky Shot: Give yourself advantage on any one roll." +
          "\n\nPowerful Strike: Deal 2 points of damage instead of 1 on a successful attack." +
          "\n\nQuester: Define an overarching goal for your character. If a Trait roll would directly further that goal, add 1 hit to the roll." +
          "\n\nRevenge: After taking damage from an attack, counterattack to deal a point of damage back to your attacker.",
      },
      {
        title: "Pets",
        content:
          "While Viator can already handle animals as normal Traits, use the following rules to add extra depth for pet-using characters." +
          "\n\nPet Traits are a specific kind of Trait that represents another living being that works for or listens to a character. They can be used for rolls like any other Trait to do things that the pet could reasonably do, like a Messenger Owl (2) making a Check to deliver mail or a Baby Dragon (3) breathing fire in Combat. Unlike normal Traits, however, if a pet ever reaches level 0 due to Combat or other damage, the pet becomes defeated but your character does not. The owner of the pet can continue taking actions and using other Traits (including other pets) until one of their non-pet Traits hits level 0." +
          "\n\nPets will not willingly harm themselves by reaching level 0, however. Once a pet hits level 1, it will refuse to attack or make any action that goes against its survival instinct. The pet's owner can force the pet to make the action anyways, but if the pet hits level 0, then its max Trait level is reduced by 1 as the pet loses trust in its user, and will permanently run away if its max becomes level 0. Pet Traits can have their max level recovered or improved as normal by spending XP equal to 10 times its new max level." +
          "\n\nTo add a new pet Trait during gameplay, a character must first tame an animal or beast to their will. This is done by starting a special Combat encounter with the animal to either train it non-violently or make it submit with force. At any point during this Combat, the character may make a Check with a TN equal to twice the animal's current level, and on a success, they may spend 10 XP to add the Pet Trait.",
      },
      {
        title: "Planning Ahead",
        content:
          "For heist games or pulpy settings, your characters should always be cool and in charge, with backup plans for any scenario. To get the in-game feeling of foresight without actually planning ahead, use the following rules." +
          "\n\nOnce per scene or mission, your character can declare that everything is going according to plan, and explain how they prepared for the current situation or obstacle. Planning could be as simple as bringing the right tools or asking someone for a favor ahead of time, or it can be as elaborate as changing a farmer's schedule so that a truck full of soft hay will be waiting just outside a specific window at the right time." +
          "\n\nDepending on the complexity of the plan, set a TN, with 1 being the most simple. On a success, the plan works out, which may enable further rolls or just surpass the current obstacle. On a failure, however, the plan breaks down somewhere and the situation gets more complicated — perhaps the building's layout isn't what you first anticipated, or an NPC held up a partner who now can't help.",
      },
      {
        title: "Poisons",
        content:
          "Venom from a wicked creature, a cut from a cursed blade, and even the flames of an ordinary campfire all have the potential to keep harming a character long after the initial hit. For any short term damage-over-time effects, including poisons, burning, bleeding, or fast-acting curses, use the following rules." +
          "\n\nWhen a character is afflicted by a poison or similar effect, they gain the Poisoned (*) Trait at a level set by the severity of the source, usually between 1 and 4. The Poisoned Trait cannot be used for Trait rolls, and only acts to track the effect." +
          "\n\nAt a set interval based on the type of poison — usually each round in Combat, or every few minutes out of it — the Poisoned Trait reduces by one level and the character takes one point of damage to a Trait, which might be random or targeted depending on the exact type of poison. When the Poisoned Trait reaches level 0, it is removed and the effect ends." +
          "\n\nThe Poisoned Trait can be reduced or removed early by the right treatment, like an antidote, a spell, or a Check using a healing Trait with a TN based on the poison's level. Multiple poisons can affect a character at the same time, each tracked as its own Poisoned Trait. For slower poisons that progress over days or weeks, consider using the Disease rule instead.",
      },
      {
        title: "Pushing",
        content:
          "By working extra hard and pushing beyond one's limits, a character can achieve incredible things. To simulate the hype and extra power of a character who is willing to risk it all, use the following rules." +
          "\n\nWhen making any Trait roll, a character may choose to push themselves and go ever further beyond. To push, a character gives themselves two stacks of advantage for the roll, but takes a level of damage after the roll, regardless of the result.",
      },
      {
        title: "Radiation",
        content:
          "Whether from nuclear fallout, experimental weaponry, or strange magics, characters may find themselves exposed to deadly radiation. While the Poison or Disease optional rules can also simulate radiation, use the following rules for higher risks and rewards." +
          "\n\nWhenever a character comes into contact with a radioactive substance, they must make a Resistance Check with a TN of 2 if unguarded and a TN of 1 if wearing proper protective gear. On a success, the character suffers no ill effects. On a failure, however, they roll on the Radiation Table." +
          "\n\nRadiation Table:" +
          "\n1, 2. No effect" +
          "\n3, 4, 5. Gain a level of Radiation (*)" +
          "\n6. Roll on the Mutation Table" +
          "\n\nMutation Table:" +
          "\n1. Gain a level of Radiation Sickness (*), which acts like Radiation (*) but cannot ever be healed" +
          "\n2, 3. Gain a level of Radiation (*)" +
          "\n4, 5. Gain a negligible mutation, like bumpy skin, colored eyes, or a slight glow" +
          "\n6. Gain a new Trait representing a small power or mutated body part, starting at level 1" +
          "\n\nLevels of Radiation (*) show how much the radiation is affecting a character's body. An irradiated character has all of their Traits' max levels reduced by the level of their Radiation Trait. If a Trait's level is reduced to 0 in this way, it becomes unusable until healed. If all Trait levels are reduced to 0 in this way, then the irradiated character becomes too sick to act, and may lose their mind or die in extreme cases. Levels of Radiation (*) can only be reduced by consuming certain medicines or otherwise receiving proper care.",
      },
      {
        title: "Refunding Traits",
        content:
          "Sometimes you may choose a Trait that sounds cool, but then doesn't turn out the way you like in practice. To allow re-speccing, use the following rules." +
          "\n\nTraits may be refunded if there is an in-game narrative reason appropriate for the loss of the Trait. To refund a Trait, remove it from the character sheet and gain XP equal to 10 times the Trait's current max level.",
      },
      {
        title: "Reputation",
        content:
          "Your character can have different relationships with various factions, like competing businesses, underground power brokers, romantic options, or high school cliques. Use the following rules to track reputations with different groups." +
          "\n\nEach persistent group that your character meets should get their own Reputation Tracker. This Tracker is similar to a character, and should have the name of the faction, a short list of their goals and values, and a Reputation Level from 1-6 representing how they view your character." +
          "\n\nA faction with a Reputation Level of 1 or 2 sees your character negatively, and will actively work against them. A Reputation Level of 3 or 4 is neutral, and will not help nor hinder them unless influenced by an outside force, like a request from your character or pressure from another faction. Most new factions should start here at level 3. A Reputation Level of 5 or 6 is friendly to your character, and will try to help them if possible, although not usually at risk to themselves." +
          "\n\nA faction's Reputation Level can be increased (to a max of 6) by doing favors for them or openly acting in line with their values, while it can be lowered (to a min of 1) by working against their goals or openly disrespecting their values. Significantly impressive actions can move a faction's Reputation Level by one full level, but most actions will move the level by one-half or one-quarter." +
          "\n\nIf a faction's Reputation Level would increase or decrease a full level past its limit, then they are compelled to action, and will give your character a gift or favor if positive or lash out against your character if negative. This resets the Reputation Level back to its normal limit, which can then continue to loop as needed." +
          "\n\nOptionally, each faction can also have a list of friendly and hostile factions. Whenever your character gains a full Reputation Level with a faction, it will also increase their reputation with all of its friendly factions by half a point, as well as decrease their reputation with all of its hostile factions by half a point. Note that this web effect only applies when your character actively does something to earn Reputation with a faction, and not when they lose it.",
      },
      {
        title: "Resource Gathering",
        content:
          "In some RPGs, you can gather dozens of items and break them down into their base components to craft items or upgrade systems. To simplify this process, use the following rules." +
          "\n\nGeneral, random items that your character collects are considered resources. Resources are abstract measures of loot or items that are tracked together. There are three different types of resources, each of which should be individually counted." +
          "\n\nCommon Resources are the most basic resources, and are needed for most use cases. Depending on the setting, common resources may be raw materials like wood, cloth, or stone, consumables like arrows, rope, or bullets, natural ingredients like herbs or bones, or general needs like food or water." +
          "\n\nRare Resources are more useful items or better quality materials. Depending on the setting, rare resources may be raw materials like scrap metals or plastics, processed goods like screws or duct tape, valuables like jewelry or precious metals, or specific consumables like medicine or rare plants." +
          "\n\nExotic Resources are the least common and most useful type of resources. They are usually relatively high tech or magical, and each exotic resource has its own special property or theme. Depending on the setting, exotic resources may be tech like circuit boards or nanobots, magical supplies like dragon hide or charged crystals, or special consumables like high-end medicine, a specific spell scroll, or a bomb." +
          "\n\nBecause resources are abstract, we don't care about what specific items your character is picking up and carrying around. Instead, just track how many of each resource type you have in your inventory, like \"Common Resources - 7\" or \"Exotic Resources - 2\". The resource isn't defined until it is used, at which point you declare it to be a specific item — \"I'm using a common resource as food,\" or \"I'm using a rare resource as duct tape to upgrade my gun.\"" +
          "\n\nYour characters can gather resources by looting abandoned structures, cleaning out a monster carcass, or just searching in their environment. A Gathering action usually takes 4-6 hours, and has a random chance of finding anything, depending on the environment. If they find resources, which may be the result of a Check, random roll, or narrative, each gathering character should roll a d6. Usually, they find a Common Resource on a 1, 2, or 3, a Rare Resource on a 4 or 5, or an Exotic Resource on a 6." +
          "\n\nResources and other optional rules: If using Armed Combat, damaged arms can be healed by using a Common Resource, upgraded by spending a Rare Resource to reduce the XP cost by 5, or given a spell effect by spending an Exotic Resource along with the leveling cost. If using Scarcity, Common Resources can replace most simple consumables, like food, water, ammo, or torches, while Rare or Exotic Resources can be used for special items. If using either Crafting rule, Rare Resources can reduce the crafting level by 1 for complex crafts, or grant a stack of advantage for simple crafts. If using Disease, Poison, Radiation, or similar rules, Rare or Exotic Resources can be used as certain medications.",
      },
      {
        title: "Revival",
        content:
          "In most games, death means the dramatic end of a character. But for games built around repeated combat encounters or stories involving rogue-like loops, death doesn't have to be final. To let your characters come back from the dead at a price, use the following rules." +
          "\n\nTo enable revival, your characters should create a connection with some being or force called a patron that keeps them tied to life. This could be a godlike being who gives them quests, a quiet save point like a bonfire, or a pool of ooze that keeps recreating their bodies." +
          "\n\nWhen one of your characters dies (which may be immediately after defeat in Combat, or after an extended circumstance like with the Dying optional rule), they can no longer move or take actions. Allies can revive dead characters of the same patron by taking the Revive action at the site of the dead character's body. This action takes three full actions to complete, and can be sped up by having more than one character take the action on the same turn. After three Revive actions have been performed on the same dead character, they are revived, and regain half of their defeated Trait's maximum level, rounded up. If no allies can perform the Revive action, either because they can't reach the body or because they are also dead, then the patron revives their subjects at their leisure, which may be immediately or hours to days later." +
          "\n\nDepending on the patron and the vibe of the game, revival can have various costs. For settings where life is nothing more than a commodity, revival may come at the low low cost of 2 XP per revival. For brutal worlds where death is expected but respawn points are rare, your characters may drop half of their XP on death, and must reach their old body on their next life in order to reclaim it. In games where death isn't the main point, there may not be any price to revive at all, and the only cost is the mental toll that a character accumulates from repeatedly viewing the afterlife.",
      },
      {
        title: "Scarcity",
        content:
          "Some resources, like torches, arrows, or food, are inherently dwindling. In base Viator, these items are hand-waved away, and it is assumed that your characters usually have enough stuff to get by. To keep track of resources and add an element of inventory management to the game, use the following rules." +
          "\n\nInstead of having an endless inventory, your characters get a limited number of inventory slots to hold items. A character has a number of inventory slots equal to their total Trait levels, which starts at 10 for most games. An inventory slot can hold loot, like a fancy painting or a bag of rare gems, or consumables, like ammo or food." +
          "\n\nConsumables come in two kinds. Reusable consumables, like arrows or throwing knives, are tracked individually, where an inventory slot holds up to 6 and one is spent every use (but may be recovered after use). Bulk consumables, like rations, torches, or ammo, are tracked as uses that deplete at intervals. One inventory slot holds up to 6 uses, with one usage depleting at a relevant interval (a ration per day, a torch per few hours, a reload per fight, etc.). Characters can carry more than 6 of either type of consumable by using additional slots." +
          "\n\nThis rule can be tweaked in several ways to fit different game styles. For a tighter inventory, count all of a Trait's implied gear as one slot, like Ranger Gear or Witch Doctor Supplies. If using the Armed Combat or Resource Gathering rules, arms and resources each take up inventory slots, with resources counting as consumables. Certain large items, like a sniper rifle or experimental engine, may take up two or more inventory slots.",
      },
      {
        title: "Settlement Building",
        content:
          "Some of the most rewarding stories come from building something that lasts. This rule focuses on small communities, like frontier outposts, reclaimed villages, or hidden enclaves that your characters want to protect or establish." +
          "\n\nA settlement is any permanent town, structure, or fixture that holds between 6 and 60 working citizens and can be broken down into a collection of Settlement Traits. A Settlement Trait is any resource the whole community shares, like housing, defenses, and landmarks. Any character or NPC at the settlement can use a Settlement Trait for Checks or other actions that fit it." +
          "\n\nTraits for food, water, beds, and defenses are each considered essential to keep people in the settlement safe and healthy. Other Traits, like gym, store, workshop, or hot springs, are considered non-essential, and mostly keep citizens happy, give a settlement a unique identity, and provide narrative benefits." +
          "\n\nEach level of a Settlement Trait requires one citizen to work, and each level can support six people with its output. For example, a settlement with the Natural Well (2) Trait has a source of fresh water that requires two people to tend and maintain it, but provides enough water for 12 people's needs. A Blacksmith (5) requires five artisans, but can reliably handle requests from up to 30 people. Any citizens not assigned to work a Settlement Trait get lumped into one Unassigned (*) Trait. This Trait does not have the usual 6 level cap, and only serves to keep track of citizens." +
          "\n\nIf a Trait does not have enough output to sustain a settlement, then it is considered deficient. Non-essential Settlement Traits carry no set penalty for being deficient. A deficient essential Trait, however, is more of an issue, as it means that a town doesn't have enough food, water, or safety for a cycle. A cycle might be a day, a week, or a season depending on the pace of your game." +
          "\n\nDeficient Traits can be managed in multiple ways. The easiest way is by making a Check using the appropriate Settlement Trait, with a TN equal to the number of levels that the Trait is short. Citizens can also be assigned to a non-essential Scavenger / Hunter / Gatherer Trait that can flex roles as needed to help cover deficient Traits, although they can only support 3 citizens each instead of 6. If using the Resource Gathering optional rule, common resources can support 3 citizens for a given deficient Trait, while rare resources can support 6. Finally, a Settlement Trait can be leveled up (to a max of 6) before the end of a cycle by spending XP equal to 10 times its new max level and assigning a citizen to the Trait." +
          "\n\nIf, at the end of a cycle, all of these methods fail and one or more essential Traits are still deficient, then roll on the table below for each deficient Settlement Trait:" +
          "\n\n1. Catastrophe! 1d6 random citizens die, and the settlement may fall apart if the need is unmet for another cycle." +
          "\n2. Mutiny! 1d6 random citizens leave the settlement for another." +
          "\n3. Rationing is stretching people too thin. All Settlement Traits roll at disadvantage for this cycle." +
          "\n4. People don't feel safe enough to truly rest. No character may recover Traits here for this cycle." +
          "\n5. There isn't enough to go around. The settlement cannot help your characters in any way this cycle." +
          "\n6. Citizens are unhappy, but they manage. No effect.",
      },
      {
        title: "Stealth",
        content:
          "While some Traits, like rogue, spy, or ghost, already imply the ability to sneak around unseen, there are times where a whole group needs to use stealth. Whether infiltrating an enemy base, hiding from authorities, or disguised as others, use the following rules to track awareness of the group." +
          "\n\nWhen multiple characters are hiding or otherwise undercover, keep track of an Alert (*) Level. The Alert level begins at 0, and represents how aware an entity or group is of your characters. For large scenes, there may be multiple Alert Levels — different wings of a building may have different Alert Levels, or Guards and Nobles might have their own." +
          "\n\nLevel 0 means that nobody is aware of your characters, while level 2 means that they are suspicious but still unsure. An Alert Level of 4 or above means that the entity knows for sure that someone is hiding, even if they do not know exactly where your characters are until level 6, which automatically ends the stealth encounter, usually for the worst." +
          "\n\nThe Alert Level can be raised and lowered by many factors. Being seen, leaving evidence, or failing actions can all raise the Alert Level by one or more, while eliminating witnesses, creating distractions, or just waiting out the heat can lower it." +
          "\n\nAny action that a character does while remaining stealthy has a TN equal to the current Alert Level (or 1, if the Alert Level is 0), although the results of the action may increase the Alert Level depending on how much attention it brings. Certain Traits or actions may have disadvantage if they would draw attention. Any attack actions made in this way deal 3 levels of damage, defeating most goon- or guard-level enemies instantly.",
      },
      {
        title: "Stress",
        content:
          "Traumatic events, horrifying monsters, and tense situations can all, understandably, put strain on the mortal mind. To simulate the mental toll of fear and pressure, use the following rules." +
          "\n\nAt character creation, your character gets a Stress (*) Trait (or Fear, Discomfort, etc. depending on setting) for free that starts at level 0. This Trait cannot be used for Trait rolls, and only serves to track the character's current mood or mental state. Certain actions, like interacting with ghosts, reading the forbidden texts, or standing up to a parental figure, can all raise a character's Stress by one or more levels. You can also choose to raise a character's Stress by one level to gain advantage on a Trait roll, or to avoid damage or other negative outcomes for failed Trait rolls." +
          "\n\nThe Stress Trait does nothing until it hits level 6, at which point the character becomes overwhelmed and has a stress response (or a breakdown, terror response, etc. depending on setting), like freezing in place, fleeing, or panicking. A stress response is temporary, although it usually makes the situation worse and / or causes the character to lose a turn. After the effects of the stress response, the character's Stress drops back to 0 and they gain a level of Scar." +
          "\n\nThe Scar (*) Trait (or Strain, Wear, etc. depending on setting) is a longer-term measure of the mental toll a character has taken, and like Stress, it cannot be used in Trait rolls. A character with a non-zero Scar level has stacks of disadvantage on ALL actions equal to half of their Scar level, rounded up." +
          "\n\nA character can lower their Scar level by 1 or reset their Stress level to 0 by coping somehow between encounters, like meditating, reading, being creative — or, if using the Addiction rule, feeding a vice.",
      },
      {
        title: "Synergizing Traits",
        content:
          "Certain Traits thematically work well together, and some actions could feasibly use either one. For high-powered, long-running games where this is true, use the following rules." +
          "\n\nIf a character takes an action that could fit multiple of their Traits, then they can choose to Synergize those Traits. Synergizing Traits allows you to add dice equal to half of one Trait's level (rounding down) to the roll of the other. For example, a character with both Mage Student (4) and Vegetable Gardener (2) could synergize their Traits to magically grow a specific crop, adding half of the Gardener Trait's level to the Mage Student roll for a total of 5 dice.",
      },
      {
        title: "Timers",
        content:
          "When the watch on the bomb ticks down, the rival racer makes progress around the track, or the fire quickly engulfs the manor, time is of the essence. To track tense scenes where every moment matters, use the following rules." +
          "\n\nWhenever an outside force imposes a time limit on your characters' actions or objective, you may choose to use a timer. A Timer is similar to a Trait, with a name for the situation (Doomsday Clock, Cops Checking Rooms, etc.) and a number, usually 3-8, depending on how urgent the situation is." +
          "\n\nWhenever a period of time has passed, like a round of Combat or 10 in-game minutes (or when your characters' actions up the pressure), the timer goes down by 1. If the objective is completed in time, then the timer may be dismissed early. If the timer hits 0, however, then your characters run out of time and the situation changes — usually for the worse!",
      },
      {
        title: "Traps / Hazards",
        content:
          "The threat of pressure plates, tripwires, or magic eyes can all catch adventurers by surprise, and usually follow up with a nasty gift. For static threats that your characters may or may not trigger, use the following rules." +
          "\n\nA trap is any hidden threat that your characters might come across in their environment, like a covered pitfall, a poisoned dart mechanism, or a can of sleeping gas, placed ahead of time or decided on as you explore. A trap has three parts: a trigger, an effect, and a level." +
          "\n\nThe trigger is the piece that sets off the trap, like a tripwire, an automated camera, or a dull glyph, that activates upon a specific action, like walking down a hallway or climbing a wall. The effect is the damaging or hindering process that jumps into action when the trigger is activated, usually harming the triggerer or the general area. The level is a number, usually from 1-4, that represents how difficult the trap is to notice and avoid." +
          "\n\nWhen a trap is triggered by a character, any affected characters must roll a Contest against the trap's level, falling victim to it if they lose or avoiding the effect if they win." +
          "\n\nA character that is being careful can find a trap without triggering it by either describing their search efforts, or by making a Check with an eligible Trait with a TN equal to the trap's level minus 1. If a trap has been found in this way, it can be disarmed by rolling a Contest against the trap with an eligible Trait, which the trap has disadvantage against." +
          "\n\nA hazard is similar to a trap, but without the trigger or hidden element. A hazard could be a chasm in the ground, visible gas in the next room, or lava on the floor. A hazard cannot be triggered, and must be avoided or disarmed (with an appropriate narrative solution) in the same way as a trap." +
          "\n\nExample trap effects:" +
          "\n\nDamage: The trap deals 1 level of Trait damage." +
          "\n\nDisplacement: The trap moves a character against their will." +
          "\n\nRestraint: The trap holds a character in place against their will. The trapped character must beat the trap in a Contest to get out, or a friend can help them out with advantage on the Contest." +
          "\n\nAffliction: The trap impacts a character's abilities without directly damaging them, like imposing disadvantage for a time. If using the Poisons, Disease, or Radiation optional rules, the trap may apply one of those conditions." +
          "\n\nAlarm: The trap does nothing to the triggering character, but alerts another entity to their presence. If using the Stealth optional rule, the trap may raise the Alert Level.",
      },
      {
        title: "Travel",
        content:
          "Whether crossing a continent, navigating the backstreets of a city, or just out exploring the great unknown, there are times when you will want to map out the world around you. To build and travel a map dynamically, use the following rules." +
          "\n\nTo map out a space of any scale, you need something to write on with repeating shapes and distances. A hexmap is one of the most mathematically consistent ways to do this, but the squares on gridpaper or even the back of wrapping paper work just fine." +
          "\n\nWhen making a map, first establish the scale of the cells. A cell is one hex or square on the map, and each should be the same size as the others. You can set a specific distance per cell in miles or meters if you'd like, but the important part is how long it takes to travel through a cell. In urban environments, a cell may take 1 hour to cross, while larger landscape maps might take 6 hours or 1 day per cell. This measure of a cell is called its interval." +
          "\n\nIf desired, once per interval when traveling, make an Encounter Check: roll a d6, and on a 1, your characters encounter trouble appropriate for the cell, like hostile forces or dangerous terrain." +
          "\n\nWhen traveling on foot, you can move one cell per interval (not counting diagonals, if using squares). When traveling with assistance, like on horseback or carriage, you can move two cells per interval. When traveling with automated assistance, like a train or airship, you can move 3 or 4 cells per interval, depending on the method, and traveling in this way does not make an Encounter Check." +
          "\n\nTraveling through an unmapped cell carefully takes twice as long as normal — roll on the Landscape and Features tables. Traveling through an unmapped cell recklessly takes the normal rate — roll on the Landscape table only, and make two Encounter Checks per interval instead of one." +
          "\n\nFor a sparse map, only roll on the Features table one-half or one-third of the time (rolling a 4+ or 5+ on a d6, respectively), or roll twice per cell for a dense map." +
          "\n\nLandscape Table:" +
          "\n1, 2. Same as the last cell" +
          "\n3. Same as the last cell, but with a natural boundary or obstacle that makes travel difficult — this cell takes twice as long to travel through" +
          "\n4. A gentler, more comfortable environment than the last cell" +
          "\n5. A harsher, more dangerous environment than the last cell" +
          "\n6. An exotic or strange environment" +
          "\n\nFeatures Table:" +
          "\n1, 2. Nothing of note" +
          "\n3. A notable landmark or site of interest, like a dungeon, monument, or special resource" +
          "\n4. A small city or tight-knit community of people" +
          "\n5. A large city or a diverse, bustling place of gathering" +
          "\n6. A hidden or otherwise overlooked feature, site, or structure that goes deeper than expected",
      },
      {
        title: "Vehicles",
        content:
          "Piloting a regular vehicle, like a car or small boat, can be done by anyone who has a Trait implying proficiency with using them. However, some vehicles, like starships, pirate ships, souped up apocalypse cars, or even whole mech suits, can potentially do way more than what a single Trait allows for. To pilot and use a complex vehicle like this, use the following rules." +
          "\n\nNotable vehicles should be tracked like characters, with a name or model, a description, and a collection of Traits (usually 6-10 total levels at first). A vehicle should have a core Trait, like Reinforced Hull, Living Center, or just Core, along with a collection of additional Traits describing the vehicle's attachments and functions, like Giant Cannon, Rocket Shoes, or Shield Systems." +
          "\n\nWhile these additional Traits can be disabled by reaching level 0, the vehicle is only truly destroyed if the Core hits level 0. Any character riding the vehicle can use its Traits as an action, and adds any relevant Trait levels to the roll. Someone with Big Weapons Expert (3) rolls 5 dice when using Plasma Cannons (2), for example. Some vehicles can target specific Traits on other vehicles during Combat, while others can redirect attacks to specific shielding Traits." +
          "\n\nLeveling up or healing a vehicle must be done at a proper mechanic or shop. Healing a vehicle Trait requires half of its XP cost, while leveling up or adding a new Trait requires double the usual cost. Any character may add XP towards this goal.",
      },
      {
        title: "War",
        content:
          "There are some jobs that are too big for a group of adventurers to handle alone. When battles scale high enough and entire armies start getting involved, normal Combat rules start to fall apart. If you want to simulate large battles or wars, use the following rules." +
          "\n\nTo simulate two or more teams in battle, break up the forces on either side into Traits called Units. A Unit is a group of fighters or troops with a name and a level from 1-6 describing their size and / or competency. The exact number of troops per level is not important, but in general, a level 1 Unit is a small or weak force, while a level 6 Unit is an exceptionally large or dangerous group. The name of the Unit describes its specialty, which may give advantage or disadvantage on specific actions." +
          "\n\nTo begin a war, start by creating a map (this rule assumes that you are using the Travel optional rule) and placing Units on it in friendly territory. There is no definite limit on how many Units each side should have or their levels. You may use the entire map at once, or optionally, you can use a fog-of-war, which blocks what can be seen outside of friendly territory, as most Units in enemy territory will see only one cell away." +
          "\n\nNext, define the objective for the war. The objective can be as simple as \"destroy the enemy,\" but it's much more interesting to use more complex goals, like \"take their capital city,\" \"liberate the nation,\" or \"hold a specific resource for X turns.\"" +
          "\n\nA war takes place over several intervals, or turns, which may be hours, days, or weeks each depending on the scale of your war. Each Unit gets to move and make one action per interval, going in whichever order makes sense, and can only act again once all Units have done so. Most Units move one cell per interval, but some, like Scout or Mobilized Infantry, may move two cells per interval." +
          "\n\nUnit actions:" +
          "\n\nAttack: Roll a Contest against an adjacent Unit to break their spirit, numbers, or strategies. On a success, either reduce the defending Unit's level by 1 OR push it back into an adjacent empty cell and advance into their location." +
          "\n\nHold the Line: On this Unit's next turn, as long as it doesn't move, it has advantage against all Attack actions made against it. This action can be taken successively to stay Holding the Line." +
          "\n\nPrepare: This Unit prepares special tactics or otherwise hypes their troops up. It has advantage on its next Attack action, as long as it doesn't move first." +
          "\n\nRequisition: This Unit draws resources from a city, community, or other landmark on this cell, either with or without its consent. The Unit may recover one lost level OR gain advantage on its next Attack action. A cell cannot be Requisitioned twice, and Requisitioning from certain hostile or friendly cells may have narrative consequences." +
          "\n\nAssist: This Unit may, for one interval, give advantage to all adjacent allies for and against Attack actions OR give an extra movement to all adjacent allies, but has disadvantage against Attack actions from enemies for the rest of the interval." +
          "\n\nThe type of Unit, landscape, and notable characters can all affect how a war goes. Different Units may have special properties, advantage or disadvantage on different actions, or limited abilities. A Helicopter Unit might be able to see two cells away instead of one, a Sniper Unit might be able to Attack from two cells away but have disadvantage when defending against Attacks, and a Medic Unit might be mostly immune to enemy Attacks but can only take the Assist action." +
          "\n\nDifferent features and Unit locations on the map can also have an impact in battle. Moving through a cell with a natural boundary takes twice as long as usual, but a Unit in that cell may have advantage against Attack actions. Likewise, certain environments may allow for double speed or further vision. Optionally, you may allow for flanking, where a Unit defending against an Attack has stacks of disadvantage for each additional Unit adjacent to it, not including the attacker." +
          "\n\nFinally, your characters or other notable NPCs may join a Unit as its champion. A champion gives its Unit a stack of advantage for and against all Attack actions while it is part of the Unit. Other named characters may be part of a Unit, but a Unit can only have one champion. Champions can also be used to zoom in on one front of the battle in order to play out how they help their side, or even to achieve a secondary objective within it." +
          "\n\nUnits may be added or leveled up for double the usual XP cost, and also require a narrative reason for where the extra hands and supplies came from. Any character may add XP towards this goal." +
          "\n\nA war ends when one side's objective is complete or when one side can no longer functionally contest the battlefield. This rule is meant to keep wars snappy and constantly moving along, so if the drama is done and a winner is mostly decided, feel free to cut it off when you like.",
      },
    ],
  },
  {
    title: "In Tenebris",
    content:
      "Viator In Tenebris (meaning \"Travelers in the Dark\") is an alternate rule system for Viator based on the Forged in the Dark engine from games like Blades in the Dark or Grimwild. It is a fiction-first resolution engine that intends to speed gameplay up, organically progress the story during play, and cut down on your bookkeeping — you never roll for the opposition with these rules!" +
      "\n\nIn Tenebris is a large change that fundamentally alters the gameplay experience, so it should be decided on before a game begins rather than swapped in mid-story." +
      "\n\nCharacter Creation, Gear, and Progression all work the same In Tenebris as in base Viator, but rolling dice and resolving conflict works completely differently." +
      "\n\nWhenever your character does something risky, competes against an NPC, casts a spell, or otherwise makes an action that is not guaranteed to succeed, you make a Trait roll using a Trait appropriate to the action. To do so, divide your character's Trait level in half (rounding up) and roll that many dice (plus or minus any stacks of advantage). Only the highest die matters:" +
      "\n\n1, 2, or 3 — Failure: your character does not do what they want, and there is usually some penalty, like future disadvantage, taking Trait damage, or worsening the situation." +
      "\n4 or 5 — Partial Success: your character gets what they want, but it doesn't come freely. A complication may be introduced, the action may not be as successful as they like, or your character may take a penalty along with the success." +
      "\n6 — Full Success: your character generally gets what they want (within reason) without issue." +
      "\nTwo or more 6s — Critical Success: the action goes above and beyond to give your character some extra bonus." +
      "\n\nIf you would ever roll 0 or fewer dice due to stacks of disadvantage, you can still attempt the action, but you make the roll at a hindrance: roll two dice and take the lower of the two to resolve the action. You can never roll more than 4 dice for a Trait roll, no matter how many stacks of advantage or other mechanics apply." +
      "\n\nIn Combat, enemies do not roll dice. They simply make actions that make sense for the scene, and your character reacts, taking a penalty on failure and avoiding (or blocking, or dispelling) the attack on a success. When your character attacks, failures impose some penalty, partial successes reduce enemy Trait levels by 1, and full successes reduce enemy Trait levels by 2. Certain powerful enemies may have Resistances that impose disadvantage on certain actions against them (like resisting fire or slashing attacks), while others may have Weaknesses that grant advantage on certain actions against them (like having a glowing weak spot)." +
      "\n\nThe multi-step resolution system is partially designed to make solo play smoother, since a single roll answers both whether you succeed and what it costs you.",
    subsections: [
      {
        title: "Optional Rules In Tenebris",
        content:
          "Most optional rules work as written In Tenebris, but some require tweaking, reframing, or fully dropping." +
          "\n\nRules that count hits or make temporary trackers, like Health or Goals, go up or down by 1 level on a partial success and by 2 levels on a full success." +
          "\n\nRules that set a TN, like Crafting or Investigation, get converted into a Goal, with the TN becoming the level of the Goal. For the Hacking, Traps, and Stealth rules, ignore the TN related to making actions, but convert the TN for tracking progress into a Goal." +
          "\n\nFor rules that require Resistance Checks, like Disease or Radiation, a failure applies it as written, a partial success avoids the effect, and a full success grants advantage on future Resistance Checks." +
          "\n\nSpell levels no longer act as casting TNs for the Limited Spellcasting and Mana rules, but their other restrictions still apply." +
          "\n\nSynergizing Traits grants a stack of advantage, as does Helping after any successful roll." +
          "\n\nWar, Brutal Combat, and Failing Forward are all incompatible.",
      },
    ],
  },
];

// ─── RichText ─────────────────────────────────────────────────────────────────
//
// Renders a content string with support for:
//   • Paragraph breaks — separate paragraphs with a blank line (\n\n)
//   • Inline hyperlinks — [link text](https://example.com)
//
// Example:
//   "First paragraph with a [link](https://example.com) inline.\n\nSecond paragraph."

const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

function RichText({ text, scheme }: { text: string; scheme: Scheme }) {
  const paragraphs = text.split("\n\n");

  return (
    <>
      {paragraphs.map((para, pi) => {
        // Split paragraph into plain-text and link segments
        const segments: {
          type: "text" | "link";
          value: string;
          url?: string;
        }[] = [];
        let last = 0;
        let match: RegExpExecArray | null;
        LINK_PATTERN.lastIndex = 0;
        while ((match = LINK_PATTERN.exec(para)) !== null) {
          if (match.index > last) {
            segments.push({
              type: "text",
              value: para.slice(last, match.index),
            });
          }
          segments.push({ type: "link", value: match[1], url: match[2] });
          last = match.index + match[0].length;
        }
        if (last < para.length) {
          segments.push({ type: "text", value: para.slice(last) });
        }

        return (
          <Text
            key={pi}
            style={[
              styles.paragraph,
              { color: scheme.textSecondary },
              pi > 0 && styles.paragraphGap,
            ]}
          >
            {segments.map((seg, si) =>
              seg.type === "link" ? (
                <Text
                  key={si}
                  style={{
                    color: scheme.primary,
                    textDecorationLine: "underline",
                  }}
                  onPress={() => Linking.openURL(seg.url!)}
                >
                  {seg.value}
                </Text>
              ) : (
                <Text key={si}>{seg.value}</Text>
              ),
            )}
          </Text>
        );
      })}
    </>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "solo" | "viator";

// ─── Sub-components ──────────────────────────────────────────────────────────

type Scheme = (typeof COLOR_SCHEMES)[keyof typeof COLOR_SCHEMES];

function SubEntry({
  sub,
  expanded,
  onToggle,
  scheme,
}: {
  sub: RulesSubsection;
  expanded: boolean;
  onToggle: () => void;
  scheme: Scheme;
}) {
  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <GlassCard scheme={scheme} noPadding style={styles.subEntryCard}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        style={styles.subEntryHeader}
      >
        <Text style={[styles.subChevron, { color: scheme.primary }]}>
          {expanded ? "⌄" : "›"}
        </Text>
        <Text style={[styles.subEntryTitle, { color: scheme.text }]}>
          {sub.title}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View
          style={[
            styles.subEntryBody,
            { borderTopColor: scheme.surfaceBorder },
          ]}
        >
          {sub.content.trim() ? (
            <RichText text={sub.content} scheme={scheme} />
          ) : (
            <Text style={[styles.emptyContent, { color: scheme.textMuted }]}>
              Content coming soon.
            </Text>
          )}
        </View>
      )}
    </GlassCard>
  );
}

function RulesEntry({
  section,
  expanded,
  onToggle,
  scheme,
}: {
  section: RulesSection;
  expanded: boolean;
  onToggle: () => void;
  scheme: Scheme;
}) {
  const [subExpanded, setSubExpanded] = useState<Record<number, boolean>>({});

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const toggleSub = (i: number) => {
    setSubExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const content = section.content ?? "";

  return (
    <GlassCard scheme={scheme} noPadding style={styles.entryCard}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        style={styles.entryHeader}
      >
        <Text style={[styles.chevron, { color: scheme.primary }]}>
          {expanded ? "⌄" : "›"}
        </Text>
        <Text style={[styles.entryTitle, { color: scheme.text }]}>
          {section.title}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View
          style={[styles.entryBody, { borderTopColor: scheme.surfaceBorder }]}
        >
          {content.trim() ? (
            <RichText text={content} scheme={scheme} />
          ) : !section.subsections ? (
            <Text style={[styles.emptyContent, { color: scheme.textMuted }]}>
              Content coming soon.
            </Text>
          ) : null}

          {section.subsections && (
            <View style={content.trim() ? styles.subsectionsGap : undefined}>
              {section.subsections.map((sub, i) => (
                <SubEntry
                  key={i}
                  sub={sub}
                  expanded={!!subExpanded[i]}
                  onToggle={() => toggleSub(i)}
                  scheme={scheme}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function RulesReferenceScreen() {
  const { characters, campaigns, activeCharacterId, activeCampaignId } = useAppStore();
  const activeChar = activeCharacterId ? characters[activeCharacterId] : null;
  const activeCamp = activeCampaignId
    ? campaigns[activeCampaignId]
    : activeChar?.campaignId
    ? campaigns[activeChar.campaignId]
    : null;
  const schemeId = activeChar?.colorScheme ?? activeCamp?.colorScheme ?? DEFAULT_SCHEME;
  const scheme = COLOR_SCHEMES[schemeId] ?? COLOR_SCHEMES[DEFAULT_SCHEME];

  const [activeTab, setActiveTab] = useState<Tab>("solo");
  // Track which entries are expanded; keyed by "tab-index"
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleEntry = (tab: Tab, index: number) => {
    const key = `${tab}-${index}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isExpanded = (tab: Tab, index: number) => !!expanded[`${tab}-${index}`];

  const sections = activeTab === "solo" ? SOLO_SECTIONS : VIATOR_SECTIONS;

  return (
    <>
      <Stack.Screen
        options={{ gestureEnabled: true, animation: "slide_from_bottom" }}
      />
      <LinearGradient
        colors={[scheme.backgroundGradientStart, scheme.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBtn}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={scheme.textSecondary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: scheme.text }]}>
            Rules Reference
          </Text>
          <View style={styles.headerBtn} />
        </View>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <View
          style={[styles.tabBar, { borderBottomColor: scheme.surfaceBorder }]}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("solo")}
            style={[
              styles.tab,
              activeTab === "solo" && {
                borderBottomColor: scheme.primary,
                borderBottomWidth: 2,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === "solo" ? scheme.primary : scheme.textMuted,
                },
              ]}
            >
              Solo Roleplaying
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("viator")}
            style={[
              styles.tab,
              activeTab === "viator" && {
                borderBottomColor: scheme.primary,
                borderBottomWidth: 2,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTab === "viator" ? scheme.primary : scheme.textMuted,
                },
              ]}
            >
              Viator
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Section list ─────────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, i) => (
            <RulesEntry
              key={`${activeTab}-${i}`}
              section={section}
              expanded={isExpanded(activeTab, i)}
              onToggle={() => toggleEntry(activeTab, i)}
              scheme={scheme}
            />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  entryCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "700",
    width: 16,
    textAlign: "center",
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
    flex: 1,
  },
  entryBody: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  paragraphGap: {
    marginTop: 12,
  },
  emptyContent: {
    fontSize: 13,
    fontStyle: "italic",
  },
  subEntryCard: {
    marginBottom: 6,
    borderRadius: 10,
  },
  subEntryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  subChevron: {
    fontSize: 16,
    fontWeight: "700",
    width: 14,
    textAlign: "center",
  },
  subEntryTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
    flex: 1,
  },
  subEntryBody: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subsectionsGap: {
    marginTop: 12,
  },
});
