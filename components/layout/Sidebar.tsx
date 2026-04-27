import React, { useRef, useEffect, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppStore } from '../../store/appStore';
import { COLOR_SCHEMES, ColorScheme, DEFAULT_SCHEME } from '../../constants/colorSchemes';
import { Character, Campaign } from '../../types';

const SIDEBAR_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);
const SLIDE_DURATION = 230;
const FADE_DURATION = 200;

interface Props {
  visible: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onRules: () => void;
  onImportExport: () => void;
  scheme: ColorScheme;
}

export default function Sidebar({
  visible,
  onClose,
  onNewGame,
  onRules,
  onImportExport,
  scheme,
}: Props) {
  // Use individual selectors for fine-grained reactivity
  const characters = useAppStore((s) => s.characters);
  const campaigns = useAppStore((s) => s.campaigns);
  const setActive = useAppStore((s) => s.setActive);
  const activeCharacterId = useAppStore((s) => s.activeCharacterId);
  const activeCampaignId = useAppStore((s) => s.activeCampaignId);

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Recompute sorted lists whenever characters or campaigns data changes
  const { standaloneChars, standaloneCamps, pairedEntries } = useMemo(() => {
    const charList = Object.values(characters)
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const campList = Object.values(campaigns)
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      standaloneChars: charList.filter((c) => !c.campaignId),
      standaloneCamps: campList.filter((c) => !c.characterId),
      pairedEntries: Object.values(characters)
        .filter((c) => c.campaignId)
        .map((c) => ({ char: c, camp: campaigns[c.campaignId!] }))
        .filter((e): e is { char: Character; camp: Campaign } => !!e.camp)
        .sort((a, b) => Math.max(b.char.updatedAt, b.camp.updatedAt) - Math.max(a.char.updatedAt, a.camp.updatedAt)),
    };
  }, [characters, campaigns]);

  const handleSelectChar = (charId: string, campId: string | null = null) => {
    setActive(charId, campId);
    onClose();
  };

  const handleSelectCamp = (campId: string) => {
    setActive(null, campId);
    onClose();
  };

  const renderDot = (active: boolean, color: string) => (
    <View
      style={[
        styles.activeDot,
        { backgroundColor: active ? color : 'transparent' },
      ]}
    />
  );

  // Derived colors for sidebar chrome
  const sidebarBg = scheme.background + 'd2'; // ~82% opacity
  const borderColor = scheme.surfaceBorder;
  const dividerColor = scheme.surfaceBorder;
  const navIconColor = scheme.textSecondary;
  const hintColor = scheme.textMuted;

  return (
    <Animated.View
      style={[styles.root, { opacity: backdropOpacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Backdrop tap-to-close */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Sliding panel */}
      <Animated.View
        style={[styles.sidebar, { width: SIDEBAR_WIDTH, borderRightColor: borderColor, transform: [{ translateX }] }]}
      >
        <BlurView intensity={40} tint={scheme.blurTint} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.sidebarInner, { backgroundColor: sidebarBg }]}>
          {/* App Name */}
          <View style={styles.appHeader}>
            <Text style={[styles.appName, { color: scheme.text }]}>Viator</Text>
            <Text style={[styles.appSubtitle, { color: scheme.textSecondary }]}>Character Builder</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Nav Buttons */}
          <NavItem icon={<MaterialCommunityIcons name="star-four-points" size={16} color={scheme.textSecondary} />} label="New Game" onPress={onNewGame} scheme={scheme} />
          <NavItem icon={<MaterialCommunityIcons name="book-open-variant" size={16} color={scheme.textSecondary} />} label="Rules Reference" onPress={onRules} scheme={scheme} />
          <NavItem icon={<MaterialCommunityIcons name="swap-vertical" size={16} color={scheme.textSecondary} />} label="Import / Export" onPress={onImportExport} scheme={scheme} />

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <ScrollView style={styles.entryList} showsVerticalScrollIndicator={false}>
            {/* Paired */}
            {pairedEntries.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: scheme.textMuted }]}>Characters & Campaigns</Text>
                {pairedEntries.map(({ char, camp }) => {
                  const cs = COLOR_SCHEMES[char.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
                  const isActive =
                    activeCharacterId === char.id && activeCampaignId === camp.id;
                  return (
                    <TouchableOpacity
                      key={char.id}
                      onPress={() => handleSelectChar(char.id, camp.id)}
                      style={[
                        styles.entryItem,
                        isActive && { backgroundColor: cs.primaryMuted },
                      ]}
                      activeOpacity={0.7}
                    >
                      {renderDot(isActive, cs.primary)}
                      <Text style={[styles.entryName, { color: scheme.text, flex: 1 }]}>{char.name}</Text>
                      <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Standalone Characters */}
            {standaloneChars.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: scheme.textMuted }]}>Characters</Text>
                {standaloneChars.map((char) => {
                  const cs = COLOR_SCHEMES[char.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
                  const isActive = activeCharacterId === char.id;
                  return (
                    <TouchableOpacity
                      key={char.id}
                      onPress={() => handleSelectChar(char.id)}
                      style={[
                        styles.entryItem,
                        isActive && { backgroundColor: cs.primaryMuted },
                      ]}
                      activeOpacity={0.7}
                    >
                      {renderDot(isActive, cs.primary)}
                      <Text style={[styles.entryName, { color: scheme.text, flex: 1 }]}>{char.name}</Text>
                      <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Standalone Campaigns */}
            {standaloneCamps.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: scheme.textMuted }]}>Campaigns</Text>
                {standaloneCamps.map((camp) => {
                  const cs = COLOR_SCHEMES[camp.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
                  const isActive = activeCampaignId === camp.id;
                  return (
                    <TouchableOpacity
                      key={camp.id}
                      onPress={() => handleSelectCamp(camp.id)}
                      style={[
                        styles.entryItem,
                        isActive && { backgroundColor: cs.primaryMuted },
                      ]}
                      activeOpacity={0.7}
                    >
                      {renderDot(isActive, cs.primary)}
                      <Text style={[styles.entryName, { color: scheme.text, flex: 1 }]}>{camp.name}</Text>
                      <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {standaloneChars.length === 0 && standaloneCamps.length === 0 && pairedEntries.length === 0 && (
              <Text style={[styles.emptyHint, { color: hintColor }]}>Tap New Game to get started.</Text>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function NavItem({
  icon,
  label,
  onPress,
  scheme,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  scheme: ColorScheme;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.navItem} activeOpacity={0.7}>
      <View style={styles.navIcon}>{icon}</View>
      <Text style={[styles.navLabel, { color: scheme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRightWidth: 1,
  },
  sidebarInner: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  appHeader: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  navIcon: {
    width: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  entryList: {
    flex: 1,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  entrySub: {
    fontSize: 11,
    marginTop: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyHint: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 12,
  },
});
