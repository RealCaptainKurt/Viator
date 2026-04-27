import React, { useState, useRef } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '../store/appStore';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';
import CharacterSheet from '../components/sheets/CharacterSheet';
import CampaignSheet from '../components/sheets/CampaignSheet';
import Sidebar from '../components/layout/Sidebar';
import DiceModal from '../components/modals/DiceModal';
import OracleModal from '../components/modals/OracleModal';
import FloatingToolbar from '../components/layout/FloatingToolbar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

export default function MainScreen() {
  const {
    isLoaded,
    characters,
    campaigns,
    activeCharacterId,
    activeCampaignId,
    isSidebarOpen,
    isEditMode,
    toggleEditMode,
    openSidebar,
    closeSidebar,
  } = useAppStore();

  const [showDice, setShowDice] = useState(false);
  const [showOracle, setShowOracle] = useState(false);

  // Derive active data
  const activeChar = activeCharacterId ? characters[activeCharacterId] : null;
  const activeCamp = activeCampaignId
    ? campaigns[activeCampaignId]
    : activeChar?.campaignId
    ? campaigns[activeChar.campaignId]
    : null;

  // Color scheme: prefer character's, then campaign's, then default
  const schemeId =
    activeChar?.colorScheme ?? activeCamp?.colorScheme ?? DEFAULT_SCHEME;
  const scheme = COLOR_SCHEMES[schemeId] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
  const defaultScheme = COLOR_SCHEMES[DEFAULT_SCHEME];

  // Track whether a modal is open via a ref so the PanResponder
  // (which captures its closure once) can read the current value.
  const modalOpenRef = useRef(false);
  modalOpenRef.current = showDice || showOracle;

  // Swipe-to-open gesture for sidebar (disabled when a modal is open)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        !modalOpenRef.current &&
        Math.abs(gs.dx) > 8 && Math.abs(gs.dy) < 40 && gs.dx > 0,
      onPanResponderRelease: (_, gs) => {
        if (!modalOpenRef.current && gs.dx > SWIPE_THRESHOLD) {
          openSidebar();
        }
      },
    })
  ).current;

  if (!isLoaded) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: defaultScheme.background }]}>
        <Text style={[styles.loadingText, { color: defaultScheme.text }]}>Viator</Text>
      </View>
    );
  }

  const hasContent = !!activeChar || !!activeCamp;
  const campaignIsLinked = !!(activeChar && activeCamp);
  // When linked, campaign inherits character's color scheme
  const campaignSchemeOverride =
    campaignIsLinked ? (COLOR_SCHEMES[activeChar!.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME]) : undefined;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle={scheme.blurTint === 'light' ? 'dark-content' : 'light-content'} />
      <LinearGradient
        colors={[scheme.backgroundGradientStart, scheme.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* ── Top Bar ──────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={openSidebar}
            style={styles.menuBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.menuLine, { backgroundColor: scheme.text }]} />
            <View
              style={[
                styles.menuLine,
                styles.menuLineMid,
                { backgroundColor: scheme.text },
              ]}
            />
            <View style={[styles.menuLine, { backgroundColor: scheme.text }]} />
          </TouchableOpacity>

          {hasContent && (
            <TouchableOpacity
              onPress={toggleEditMode}
              style={styles.settingsBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isEditMode ? 'settings' : 'settings-outline'}
                size={22}
                color={isEditMode ? scheme.primary : scheme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Main Content ─────────────────────────── */}
        {!hasContent ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sword-cross" size={48} color={scheme.textMuted} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: scheme.text }]}>
              Viator
            </Text>
            <Text style={[styles.emptySubtitle, { color: scheme.textSecondary }]}>
              Character Builder & Solo Engine
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/new-game')}
              style={[
                styles.emptyNewBtn,
                {
                  backgroundColor: scheme.primaryMuted,
                  borderColor: scheme.primary + '66',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="star-four-points" size={17} color={scheme.primary} />
                <Text style={[styles.emptyNewBtnText, { color: scheme.primary }]}>New Game</Text>
              </View>
            </TouchableOpacity>
            <Text
              style={[styles.emptyHint, { color: scheme.textMuted }]}
            >
              or swipe right to open the menu
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Add Character prompt (above campaign, edit mode only) */}
            {!activeChar && activeCamp && isEditMode && (
              <TouchableOpacity
                onPress={openSidebar}
                style={[styles.addEntityBtn, { borderColor: scheme.surfaceBorder }]}
              >
                <Text style={[styles.addEntityText, { color: scheme.textSecondary }]}>+ Add Character</Text>
              </TouchableOpacity>
            )}

            {/* Character sheet */}
            {activeCharacterId && <CharacterSheet characterId={activeCharacterId} />}

            {/* Campaign sheet — seamless below character if linked */}
            {activeCamp && (
              <CampaignSheet
                campaignId={activeCampaignId ?? activeChar?.campaignId ?? ''}
                isStandalone={!campaignIsLinked}
                schemeOverride={campaignSchemeOverride}
              />
            )}

            {/* Add Campaign prompt (below character, edit mode only) */}
            {activeChar && !activeCamp && isEditMode && (
              <TouchableOpacity
                onPress={openSidebar}
                style={[styles.addEntityBtn, { borderColor: scheme.surfaceBorder }]}
              >
                <Text style={[styles.addEntityText, { color: scheme.textSecondary }]}>+ Add Campaign</Text>
              </TouchableOpacity>
            )}

            {/* Extra bottom padding to clear the floating toolbar */}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>

      {/* ── Floating Toolbar (above content, below modals) ── */}
      {hasContent && (
        <FloatingToolbar
          scheme={scheme}
          onDicePress={() => setShowDice(true)}
          onOraclePress={() => setShowOracle(true)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────── */}
      <Sidebar
        visible={isSidebarOpen}
        onClose={closeSidebar}
        scheme={scheme}
        onNewGame={() => {
          closeSidebar();
          router.push('/new-game');
        }}
        onRules={() => {
          closeSidebar();
          router.push('/rules-reference');
        }}
        onImportExport={() => {
          closeSidebar();
          router.push('/import-export');
        }}
      />

      {/* ── Modals ─────────────────────────────────── */}
      <DiceModal visible={showDice} onClose={() => setShowDice(false)} scheme={scheme} />
      <OracleModal visible={showOracle} onClose={() => setShowOracle(false)} scheme={scheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuBtn: {
    width: 28,
    height: 22,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    borderRadius: 1,
    width: '100%',
  },
  menuLineMid: {
    width: '70%',
  },
  topTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnText: {
    fontSize: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyNewBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  emptyNewBtnText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyHint: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 4,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  addEntityBtn: {
    marginBottom: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addEntityText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
