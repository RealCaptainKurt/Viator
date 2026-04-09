import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { Character, AdditionalListComponent, AdditionalNumberComponent, CollapsedSections } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import TraitRow from './TraitRow';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import TextContentRow from '../ui/TextContentRow';
import ModalOverlay from '../ui/ModalOverlay';
import NamedItemRow from '../campaign/NamedItemRow';
import AddItemRow from '../campaign/AddItemRow';

interface Props {
  character: Character;
}

export default function CharacterSheet({ character }: Props) {
  const scheme = COLOR_SCHEMES[character.colorScheme];
  const {
    updateCharacterField,
    addTrait,
    updateTrait,
    removeTrait,
    updateCharacterComponentText,
    updateCharacterComponentNumber,
    addCharacterComponentListItem,
    updateCharacterComponentListItem,
    removeCharacterComponentListItem,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    description: false,
    traits: true,
  });

  // XP modal state
  const [showXpModal, setShowXpModal] = useState(false);
  const [draftXp, setDraftXp] = useState(String(character.xp));

  // Add-trait modal state
  const [showAddTrait, setShowAddTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitLevel, setNewTraitLevel] = useState(1);

  // Add-item state for list components
  const [addingItemCompId, setAddingItemCompId] = useState<string | null>(null);

  // Number component edit state
  const [editingNumberId, setEditingNumberId] = useState<string | null>(null);
  const [draftNumber, setDraftNumber] = useState('0');

  const openNumberModal = (comp: AdditionalNumberComponent) => {
    setEditingNumberId(comp.id);
    setDraftNumber(String(comp.value));
  };
  const adjustNumber = (delta: number) =>
    setDraftNumber((v) => String((parseInt(v, 10) || 0) + delta));
  const handleNumberSave = () => {
    if (!editingNumberId) return;
    const n = parseInt(draftNumber, 10);
    if (!isNaN(n)) updateCharacterComponentNumber(character.id, editingNumberId, n);
    setEditingNumberId(null);
  };

  const toggle = (key: string) =>
    setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const openXpModal = () => {
    setDraftXp(String(character.xp));
    setShowXpModal(true);
  };

  const handleXpSave = () => {
    const n = parseInt(draftXp, 10);
    if (!isNaN(n) && n >= 0) {
      updateCharacterField(character.id, 'xp', n);
    }
    setShowXpModal(false);
  };

  const adjustXp = (delta: number) => {
    const n = parseInt(draftXp, 10) || 0;
    const next = Math.max(0, n + delta);
    setDraftXp(String(next));
  };

  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    addTrait(character.id, newTraitName.trim(), newTraitLevel);
    setNewTraitName('');
    setNewTraitLevel(1);
    setShowAddTrait(false);
  };

  return (
    <GlassCard scheme={scheme} style={styles.card}>
      {/* ── Name & XP ─────────────────────────────── */}
      <View style={styles.nameRow}>
        <TextInput
          value={character.name}
          onChangeText={(v) => updateCharacterField(character.id, 'name', v)}
          style={[styles.nameInput, { color: scheme.text }]}
          placeholder="Character Name"
          placeholderTextColor={scheme.textMuted}
          selectionColor={scheme.primary}
        />
        <TouchableOpacity onPress={openXpModal} style={styles.xpBox} activeOpacity={0.7}>
          <Text style={[styles.xpLabel, { color: scheme.textSecondary }]}>XP</Text>
          <View style={[styles.xpDisplay, { borderColor: scheme.surfaceBorder }]}>
            <Text style={[styles.xpValue, { color: scheme.primary }]}>
              {character.xp}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── XP Modal ──────────────────────────────── */}
      <ModalOverlay
        visible={showXpModal}
        onClose={() => setShowXpModal(false)}
        scheme={scheme}
        title="Experience Points"
      >
        <View style={styles.xpModalRow}>
          <TouchableOpacity
            onPress={() => adjustXp(-1)}
            style={[styles.xpAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.xpAdjustText, { color: scheme.destructive }]}>−</Text>
          </TouchableOpacity>

          <TextInput
            value={draftXp}
            onChangeText={(v) => {
              if (v === '' || /^\d+$/.test(v)) setDraftXp(v);
            }}
            keyboardType="number-pad"
            style={[
              styles.xpModalInput,
              {
                color: scheme.primary,
                borderColor: scheme.surfaceBorder,
                backgroundColor: scheme.primaryMuted,
              },
            ]}
            selectionColor={scheme.primary}
            selectTextOnFocus
            autoFocus
          />

          <TouchableOpacity
            onPress={() => adjustXp(1)}
            style={[styles.xpAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.xpAdjustText, { color: scheme.primary }]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalActions}>
          <GlassButton
            label="Cancel"
            onPress={() => setShowXpModal(false)}
            scheme={scheme}
            variant="ghost"
            small
            style={{ flex: 1 }}
          />
          <GlassButton
            label="Save"
            onPress={handleXpSave}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
          />
        </View>
      </ModalOverlay>

      {/* ── Description ───────────────────────────── */}
      <CollapsibleSection
        title="Description"
        scheme={scheme}
        collapsed={collapsed.description}
        onToggle={() => toggle('description')}
      >
        <TextContentRow
          content={character.description}
          scheme={scheme}
          placeholder="Tap to add description..."
          title="Description"
          onSave={(v) => updateCharacterField(character.id, 'description', v)}
        />
      </CollapsibleSection>

      {/* ── Traits ────────────────────────────────── */}
      <CollapsibleSection
        title="Traits"
        scheme={scheme}
        collapsed={collapsed.traits}
        onToggle={() => toggle('traits')}
        rightContent={
          <TouchableOpacity
            onPress={() => {
              setNewTraitName('');
              setNewTraitLevel(1);
              setShowAddTrait(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
          </TouchableOpacity>
        }
      >
        {character.traits.length === 0 ? (
          <Text style={[styles.empty, { color: scheme.textMuted }]}>
            No traits yet. Tap + to add one.
          </Text>
        ) : null}

        {character.traits.map((trait) => (
          <TraitRow
            key={trait.id}
            trait={trait}
            scheme={scheme}
            onUpdate={(name, level) => updateTrait(character.id, trait.id, name, level)}
            onRemove={() => removeTrait(character.id, trait.id)}
          />
        ))}
      </CollapsibleSection>

      {/* ── Add Trait Modal ─────────────────────────── */}
      <ModalOverlay
        visible={showAddTrait}
        onClose={() => setShowAddTrait(false)}
        scheme={scheme}
        title="New Trait"
      >
        <GlassInput
          scheme={scheme}
          label="Trait Name"
          value={newTraitName}
          onChangeText={setNewTraitName}
          placeholder="e.g. Swordsmanship"
          containerStyle={{ marginBottom: 16 }}
        />

        <Text style={[styles.levelLabel, { color: scheme.textSecondary }]}>
          Level
        </Text>
        <View style={styles.levelRow}>
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setNewTraitLevel(l)}
              style={[
                styles.levelPip,
                {
                  backgroundColor:
                    l <= newTraitLevel
                      ? scheme.levelColors[newTraitLevel - 1]
                      : scheme.surface,
                  borderColor:
                    l <= newTraitLevel ? scheme.primary : scheme.surfaceBorder,
                },
              ]}
            >
              <Text
                style={{
                  color: l <= newTraitLevel ? scheme.text : scheme.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalActions}>
          <GlassButton
            label="Cancel"
            onPress={() => setShowAddTrait(false)}
            scheme={scheme}
            variant="ghost"
            small
            style={{ flex: 1 }}
          />
          <GlassButton
            label="Add Trait"
            onPress={handleAddTrait}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
            disabled={!newTraitName.trim()}
          />
        </View>
      </ModalOverlay>

      {/* ── Additional Components ──────────────────── */}
      {character.additionalComponents.map((comp) => {
        if (comp.type === 'list') {
          const listComp = comp as AdditionalListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <TouchableOpacity
                  onPress={() => setAddingItemCompId(comp.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                </TouchableOpacity>
              }
            >
              {listComp.items.length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>
                  No items yet. Tap + to add.
                </Text>
              ) : null}
              {listComp.items.map((item) => (
                <NamedItemRow
                  key={item.id}
                  item={item}
                  scheme={scheme}
                  onUpdate={(name, desc) =>
                    updateCharacterComponentListItem(
                      character.id,
                      comp.id,
                      item.id,
                      name,
                      desc
                    )
                  }
                  onRemove={() =>
                    removeCharacterComponentListItem(character.id, comp.id, item.id)
                  }
                />
              ))}
              <AddItemRow
                visible={addingItemCompId === comp.id}
                scheme={scheme}
                title={`Add ${comp.name}`}
                onAdd={(name, desc) => {
                  addCharacterComponentListItem(character.id, comp.id, name, desc);
                  setAddingItemCompId(null);
                }}
                onCancel={() => setAddingItemCompId(null)}
              />
            </CollapsibleSection>
          );
        }

        // Number component
        if (comp.type === 'number') {
          const numComp = comp as AdditionalNumberComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
            >
              <TouchableOpacity
                onPress={() => openNumberModal(numComp)}
                activeOpacity={0.7}
                style={styles.numBox}
              >
                <Text style={[styles.numValue, { color: scheme.primary }]}>
                  {numComp.value}
                </Text>
              </TouchableOpacity>
            </CollapsibleSection>
          );
        }

        // Text component
        return (
          <CollapsibleSection
            key={comp.id}
            title={comp.name}
            scheme={scheme}
            collapsed={collapsed[comp.id] ?? true}
            onToggle={() => toggle(comp.id)}
          >
            <TextContentRow
              content={(comp as { content: string }).content}
              scheme={scheme}
              placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
              title={comp.name}
              onSave={(v) =>
                updateCharacterComponentText(character.id, comp.id, comp.name, v)
              }
            />
          </CollapsibleSection>
        );
      })}

      {/* ── Number Component Edit Modal ─────────────── */}
      <ModalOverlay
        visible={editingNumberId !== null}
        onClose={() => setEditingNumberId(null)}
        scheme={scheme}
        title={
          character.additionalComponents.find((c) => c.id === editingNumberId)?.name ?? ''
        }
      >
        <View style={styles.xpModalRow}>
          <TouchableOpacity
            onPress={() => adjustNumber(-1)}
            style={[styles.xpAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.xpAdjustText, { color: scheme.destructive }]}>−</Text>
          </TouchableOpacity>
          <TextInput
            value={draftNumber}
            onChangeText={(v) => { if (v === '' || /^-?\d+$/.test(v)) setDraftNumber(v); }}
            keyboardType="number-pad"
            style={[styles.xpModalInput, { color: scheme.primary, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
            selectionColor={scheme.primary}
            selectTextOnFocus
            autoFocus
          />
          <TouchableOpacity
            onPress={() => adjustNumber(1)}
            style={[styles.xpAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.xpAdjustText, { color: scheme.primary }]}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => setEditingNumberId(null)} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Save" onPress={handleNumberSave} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
        </View>
      </ModalOverlay>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingVertical: 4,
  },
  xpBox: {
    alignItems: 'center',
    width: 72,
    flexShrink: 0,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  xpDisplay: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 72,
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  xpModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  xpAdjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpAdjustText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  xpModalInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  empty: {
    fontStyle: 'italic',
    fontSize: 13,
    paddingVertical: 8,
  },
  addBtn: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  levelPip: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  numBox: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 4,
  },
  numValue: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
});
