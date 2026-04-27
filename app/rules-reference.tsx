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
    content: "",
  },
  {
    title: "The Oracle",
    content: "",
  },
  {
    title: "Scene Management",
    content: "",
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
      "Characters in Viator are designed to be simple, lightweight, and powered by imagination. See the sections below for the different parts of a Player Character (PC).",
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
          "A character's Traits are freeform titles that epresent different aspects about an individual. A character’s Traits work together to show who they are, what they have, and what they can do." +
          '\n\nTraits each have a name and a level. The name of a Trait implies what you can use it for, and the level defines how good you are at that thing, from a scale of 1 to 6. A character with the Trait "Dutiful Paladin (4)" could use it to swing a sword, recite scripture, smite heretics, and heal an ally. A character with the Trait "Stage Magician (2)" is probably good at sleight of hand, trickery, and spectacle.' +
          "\n\nTraits can be temporarily lowered by failing rolls or taking risks. This is called taking Trait damage, or just taking damage. A damaged Trait performs worse, since you use a Trait's current level for rolls." +
          "\n\nIf a Trait ever reaches level 0, then that character is considered defeated, and can no longer use any of their Traits until healed. Depending on the type of damage, Traits might heal back immediately after an encounter, after a good night's rest, or after professional help, for example. A Trait's maximum level can be increased by spending XP (see Progression and XP)." +
          "\n\nPlayer characters typically start with 10 levels to split between their Traits, with no Trait beginning above level 4. Unused levels could be converted to 10 experience points (XP) for use later in the game, if desired.",
      },
      {
        title: "Gear",
        content:
          'Like skills, gear is mostly implied by the Trait. A character with "Dutiful Paladin (4)" probably has a holy book, armor, and some kind of weapon. A character with "Tomb Raider (4)" probably has rope, lockpicks, torches, and other tools that would help with raiding tombs. You can choose to have any mundane gear at any time that logically fits with a Trait.' +
          "\n\nAnything that you acquire along the way can go in a character's inventory. An inventory can be used to store and track money, treasure, magic items, notes, specialized gear or anything else that a PC could reasonably carry. Items can supplement a Trait roll (usually granting advantage) or be used on their own as a simple action to produce an appropriate narrative effect." +
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
      "As you go on adventures, you will gain XP, which is tracked in the top right of the chracter sheet. Depending on the scene, you should earn 5-25 XP for overcoming challenges, completing combat, or just fulfilling roleplaying. You can spend XP in several ways:" +
      "\n\n- You can spend 2 XP before a Trait roll to gain advantage." +
      "\n- You can level up a Trait (to a max of level 6) at any time by spending 10 times the Trait’s current level." +
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
          "Checks are player-vs-environment rolls, and should be made whenever an action has a set risk. Before rolling, give the action a Target Number (TN) based on how hard the action is for the chosen Trait. Use the below list to pick the right TN, although most TNs should fall between 1 and 3." +
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
          "Contests are player-vs-NPC rolls, and should be made whenever you (or another NPC) comes head-to-head with another character. Select the Traits used by both competing sides and then make a Trait Roll for each one. The higher roll wins, and gets their desired outcome. If the rolls are a tie, then the initiator (usually the player) wins.",
      },
      {
        title: "Combat",
        content:
          "Combat is the name for any extended fight, challenge, or obstacle that can’t be overcome with a single roll. To initiate Combat, give each opponent (or objective) a Trait level and mark them down somewhere. Once all members of a Combat encounter are accounted for, Combat begins. Each member takes turns moving and making actions, going in whatever order makes narrative sense and keeps the action moving, until one side is defeated." +
          "\n\nMovement in Combat is loose, and mostly constrained by your visualization of the arena and logical movement speed." +
          "\n\nActions are anything that requires a roll or uses an item. An attack is any action intended to directly harm an opponent or worsen their immediate position. To attack, roll a Contest against the target, dealing one level of damage to them on a success, or taking one level of damage on a failure." +
          "\n\nActions that intend to hinder an enemy or manipulate the environment in more complex ways are considered spells (see Spellcasting below)." +
          "\n\nOnce all member of a team are defeated, then Combat is over, and the winners decide the outcome (within reason).",
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
    subsections: [
      // ── Add optional rules sub-entries here ──────────────────────────
      // Example:
      // { title: 'Rule Name', content: 'Description of the rule.' },
      {
        title: "Example Optional Rule",
        content: "",
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
            onPress={() => router.dismiss()}
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
