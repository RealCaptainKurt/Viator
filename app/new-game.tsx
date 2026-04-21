import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';
import { ColorSchemeId } from '../types';
import { useAppStore } from '../store/appStore';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import ColorSchemePicker from '../components/ui/ColorSchemePicker';
import { generateId } from '../utils/id';

type Step = 'choose_type' | 'character_info' | 'ask_campaign';

interface TraitDraft {
  id: string;
  name: string;
  value: number;
}

export default function NewGameScreen() {
  const { createCharacter, createCampaign, setActive, linkCharacterToCampaign } =
    useAppStore();

  const [step, setStep] = useState<Step>('choose_type');
  const [colorScheme, setColorScheme] = useState<ColorSchemeId>(DEFAULT_SCHEME);
  const scheme = COLOR_SCHEMES[colorScheme];

  const [charName, setCharName] = useState('');
  const [charDesc, setCharDesc] = useState('');
  const [traits, setTraits] = useState<TraitDraft[]>([]);
  const [addingTrait, setAddingTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('0');

  const hasUnsavedData = step !== 'choose_type' || charName.length > 0 || traits.length > 0;

  const [showDiscardWarning, setShowDiscardWarning] = useState(false);

  const confirmClose = useCallback(() => {
    if (hasUnsavedData) {
      setShowDiscardWarning(true);
    } else {
      router.back();
    }
  }, [hasUnsavedData]);

  // Intercept Android hardware back button
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmClose();
      return true;
    });
    return () => sub.remove();
  }, [confirmClose]);

  const handleNewCampaignOnly = () => {
    const camp = createCampaign('New Campaign', colorScheme);
    setActive(null, camp.id);
    router.back();
  };

  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    setTraits((t) => [
      ...t,
      { id: generateId(), name: newTraitName.trim(), value: parseInt(newTraitValue, 10) || 0 },
    ]);
    setNewTraitName('');
    setNewTraitValue('0');
    setAddingTrait(false);
  };

  const handleConfirmCharacter = () => {
    if (!charName.trim()) return;
    setStep('ask_campaign');
  };

  const finalize = (withCampaign: boolean) => {
    const char = createCharacter(
      charName.trim(),
      charDesc.trim(),
      traits.map((t) => ({ name: t.name, value: t.value })),
      colorScheme
    );
    if (withCampaign) {
      const camp = createCampaign(`${charName.trim()}'s Campaign`, colorScheme);
      linkCharacterToCampaign(char.id, camp.id);
      setActive(char.id, camp.id);
    } else {
      setActive(char.id, null);
    }
    router.back();
  };

  const stepTitle =
    step === 'choose_type' ? 'New Game' :
    step === 'character_info' ? 'New Character' :
    'Start a Campaign?';

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
      <LinearGradient
        colors={[scheme.backgroundGradientStart, scheme.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>

        {/* ── Header ─────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={confirmClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBtn}
          >
            <Ionicons name="close" size={22} color={scheme.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: scheme.text }]}>{stepTitle}</Text>
          <View style={styles.headerBtn} />
        </View>

        {/* ── Discard Warning ─────────────────────── */}
        {showDiscardWarning && (
          <View style={[styles.discardBanner, { backgroundColor: scheme.primaryMuted, borderColor: scheme.destructive + '55' }]}>
            <Text style={[styles.discardText, { color: scheme.text }]}>
              Discard unsaved progress?
            </Text>
            <View style={styles.discardActions}>
              <TouchableOpacity
                onPress={() => setShowDiscardWarning(false)}
                style={[styles.discardBtn, { borderColor: scheme.surfaceBorder }]}
              >
                <Text style={[styles.discardBtnText, { color: scheme.textSecondary }]}>Keep editing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.discardBtn, { borderColor: scheme.destructive + '55', backgroundColor: scheme.destructive + '22' }]}
              >
                <Text style={[styles.discardBtnText, { color: scheme.destructive }]}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Content ────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Step: Choose Type */}
          {step === 'choose_type' && (
            <>
              <Text style={[styles.subtitle, { color: scheme.textSecondary }]}>
                What would you like to create?
              </Text>

              <ColorSchemePicker
                current={colorScheme}
                onChange={setColorScheme}
                scheme={scheme}
              />

              <View style={styles.cards}>
                <TouchableOpacity
                  onPress={() => setStep('character_info')}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    { borderColor: scheme.primary + '55', backgroundColor: scheme.primaryMuted },
                  ]}
                >
                  <MaterialCommunityIcons name="sword-cross" size={24} color={scheme.text} style={{ marginBottom: 4 }} />
                  <Text style={[styles.cardTitle, { color: scheme.text }]}>New Character</Text>
                  <Text style={[styles.cardDesc, { color: scheme.textSecondary }]}>
                    Create a Viator character. Optionally start a campaign too.
                  </Text>
                  <Text style={[styles.cardBadge, { color: scheme.textMuted }]}>Default</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNewCampaignOnly}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface },
                  ]}
                >
                  <MaterialCommunityIcons name="script-text" size={24} color={scheme.text} style={{ marginBottom: 4 }} />
                  <Text style={[styles.cardTitle, { color: scheme.text }]}>Campaign Only</Text>
                  <Text style={[styles.cardDesc, { color: scheme.textSecondary }]}>
                    Track a campaign with a non-Viator character.
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step: Character Info */}
          {step === 'character_info' && (
            <>
              <GlassInput
                scheme={scheme}
                label="Name"
                value={charName}
                onChangeText={setCharName}
                placeholder="Character name"
                containerStyle={styles.field}
                autoFocus
              />
              <GlassInput
                scheme={scheme}
                label="Description"
                value={charDesc}
                onChangeText={setCharDesc}
                placeholder="Backstory, appearance, personality..."
                multiline
                minHeight={90}
                containerStyle={styles.field}
              />

              <Text style={[styles.sectionLabel, { color: scheme.textSecondary }]}>Traits</Text>

              {traits.map((t) => (
                <View
                  key={t.id}
                  style={[
                    styles.traitChip,
                    { backgroundColor: scheme.primaryMuted, borderColor: scheme.surfaceBorder },
                  ]}
                >
                  <Text style={[styles.traitChipName, { color: scheme.text }]}>{t.name}</Text>
                  <Text style={[styles.traitChipValue, { color: scheme.primary }]}>{t.value}</Text>
                  <TouchableOpacity
                    onPress={() => setTraits((prev) => prev.filter((x) => x.id !== t.id))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={16} color={scheme.destructive} />
                  </TouchableOpacity>
                </View>
              ))}

              {addingTrait ? (
                <View
                  style={[
                    styles.addTraitForm,
                    { backgroundColor: scheme.primaryMuted, borderColor: scheme.surfaceBorder },
                  ]}
                >
                  <View style={styles.addTraitInputRow}>
                    <TextInput
                      value={newTraitName}
                      onChangeText={setNewTraitName}
                      placeholder="Trait name"
                      placeholderTextColor={scheme.textMuted}
                      style={[
                        styles.addTraitNameInput,
                        { color: scheme.text, borderColor: scheme.surfaceBorder },
                      ]}
                      autoFocus
                      selectionColor={scheme.primary}
                    />
                    <TextInput
                      value={newTraitValue}
                      onChangeText={(v) => { if (v === '' || /^-?\d*$/.test(v)) setNewTraitValue(v); }}
                      placeholder="0"
                      placeholderTextColor={scheme.textMuted}
                      keyboardType="number-pad"
                      style={[
                        styles.addTraitValueInput,
                        { color: scheme.primary, borderColor: scheme.surfaceBorder },
                      ]}
                      selectionColor={scheme.primary}
                      selectTextOnFocus
                    />
                  </View>
                  <View style={styles.addTraitActions}>
                    <GlassButton
                      label="Cancel"
                      onPress={() => { setAddingTrait(false); setNewTraitName(''); setNewTraitValue('0'); }}
                      scheme={scheme}
                      variant="ghost"
                      small
                      style={{ flex: 1 }}
                    />
                    <GlassButton
                      label="Add"
                      onPress={handleAddTrait}
                      scheme={scheme}
                      variant="primary"
                      small
                      style={{ flex: 1 }}
                      disabled={!newTraitName.trim()}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setAddingTrait(true)}
                  style={[styles.addTraitBtn, { borderColor: scheme.surfaceBorder }]}
                >
                  <Text style={[styles.addTraitBtnText, { color: scheme.textSecondary }]}>
                    + Add Trait
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.rowActions}>
                <GlassButton
                  label="Back"
                  onPress={() => setStep('choose_type')}
                  scheme={scheme}
                  variant="ghost"
                  style={{ flex: 1 }}
                />
                <GlassButton
                  label="Confirm"
                  onPress={handleConfirmCharacter}
                  scheme={scheme}
                  variant="primary"
                  style={{ flex: 1 }}
                  disabled={!charName.trim()}
                />
              </View>
            </>
          )}

          {/* Step: Ask Campaign */}
          {step === 'ask_campaign' && (
            <>
              <Text style={[styles.subtitle, { color: scheme.textSecondary }]}>
                Would you like to start a campaign alongside{' '}
                <Text style={{ color: scheme.primary, fontWeight: '700' }}>{charName}</Text>?
              </Text>

              <View style={styles.cards}>
                <TouchableOpacity
                  onPress={() => finalize(true)}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    { borderColor: scheme.primary + '55', backgroundColor: scheme.primaryMuted },
                  ]}
                >
                  <MaterialCommunityIcons name="map-outline" size={24} color={scheme.text} style={{ marginBottom: 4 }} />
                  <Text style={[styles.cardTitle, { color: scheme.text }]}>Yes, Start Campaign</Text>
                  <Text style={[styles.cardDesc, { color: scheme.textSecondary }]}>
                    Create character + campaign tracker together.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => finalize(false)}
                  activeOpacity={0.8}
                  style={[
                    styles.card,
                    { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface },
                  ]}
                >
                  <MaterialCommunityIcons name="sword-cross" size={24} color={scheme.text} style={{ marginBottom: 4 }} />
                  <Text style={[styles.cardTitle, { color: scheme.text }]}>Character Only</Text>
                  <Text style={[styles.cardDesc, { color: scheme.textSecondary }]}>
                    Just the character sheet for now.
                  </Text>
                </TouchableOpacity>
              </View>

              <GlassButton
                label="Back"
                onPress={() => setStep('character_info')}
                scheme={scheme}
                variant="ghost"
                style={{ marginTop: 8 }}
              />
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  cards: {
    gap: 12,
    marginTop: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 6,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardBadge: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  field: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  traitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  traitChipName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  traitChipValue: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'right',
  },
  addTraitForm: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  addTraitInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addTraitNameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addTraitValueInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  addTraitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addTraitBtn: {
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  addTraitBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  discardBanner: {
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  discardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  discardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  discardBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  discardBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
