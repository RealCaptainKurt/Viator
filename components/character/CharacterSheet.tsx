import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { TRAIT_LEVELS } from '../../constants/traits';
import { Character, AdditionalListComponent, AdditionalNumberComponent, AdditionalTextComponent, CollapsedSections } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import GlassHighlight from '../ui/GlassHighlight';
import CollapsibleSection from '../ui/CollapsibleSection';
import TraitRow from './TraitRow';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import TextContentRow from '../ui/TextContentRow';
import ModalOverlay from '../ui/ModalOverlay';
import NumberEditModal from '../ui/NumberEditModal';
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
    reorderCharacterTraits,
    updateCharacterComponentText,
    updateCharacterComponentNumber,
    addCharacterComponentListItem,
    updateCharacterComponentListItem,
    removeCharacterComponentListItem,
    reorderCharacterComponentListItems,
    reorderCharacterSection,
    removeCharacterSection,
    addCharacterComponent,
    isEditMode,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    description: false,
    traits: true,
  });

  const [showXpModal, setShowXpModal] = useState(false);
  const [draftXp, setDraftXp] = useState(String(character.xp));

  const [showAddTrait, setShowAddTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitLevel, setNewTraitLevel] = useState(1);

  const [addingItemCompId, setAddingItemCompId] = useState<string | null>(null);

  const [editingNumber, setEditingNumber] = useState<AdditionalNumberComponent | null>(null);

  const [addingComp, setAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<'text' | 'list'>('text');

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

  const [confirmSectionId, setConfirmSectionId] = useState<string | null>(null);

  const handleRemoveSection = (sectionId: string) => {
    if (confirmSectionId === sectionId) {
      removeCharacterSection(character.id, sectionId);
      setConfirmSectionId(null);
    } else {
      setConfirmSectionId(sectionId);
    }
  };

  const resetAddComp = () => {
    setAddingComp(false);
    setNewCompName('');
    setNewCompType('text');
  };

  const handleAddComp = () => {
    if (!newCompName.trim()) return;
    addCharacterComponent(character.id, newCompType, newCompName.trim());
    resetAddComp();
  };

  const COMP_TYPE_LABEL: Record<string, string> = { text: 'Text', list: 'List' };

  const renderAddSectionModal = () => (
    <Modal
      visible={addingComp}
      transparent
      animationType="fade"
      onRequestClose={resetAddComp}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={resetAddComp}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <GlassCard scheme={scheme} style={styles.modalCard}>
                <Text style={[styles.modalTitle, { color: scheme.text }]}>New Section</Text>
                <TextInput
                  value={newCompName}
                  onChangeText={setNewCompName}
                  placeholder="Section name (e.g. Equipment, Notes)"
                  placeholderTextColor={scheme.textMuted}
                  style={[
                    styles.modalInput,
                    {
                      color: scheme.text,
                      borderColor: scheme.surfaceBorder,
                      backgroundColor: scheme.primaryMuted,
                    },
                  ]}
                  autoFocus
                  selectionColor={scheme.primary}
                />
                <View style={styles.typeRow}>
                  {(['text', 'list'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewCompType(t)}
                      style={[
                        styles.typeBtn,
                        {
                          backgroundColor: newCompType === t ? scheme.primaryMuted : scheme.surface,
                          borderColor: newCompType === t ? scheme.primary : scheme.surfaceBorder,
                        },
                      ]}
                    >
                      <GlassHighlight borderRadius={8} />
                      <Text
                        style={[
                          styles.typeBtnText,
                          { color: newCompType === t ? scheme.primary : scheme.textSecondary },
                        ]}
                      >
                        {COMP_TYPE_LABEL[t]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <GlassButton label="Cancel" onPress={resetAddComp} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
                  <GlassButton label="Add" onPress={handleAddComp} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!newCompName.trim()} />
                </View>
              </GlassCard>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  const sectionOrder = character.sectionOrder ?? [
    '__description', '__traits',
    ...character.additionalComponents.map((c) => c.id),
  ];

  // Hide the whole card when no sections remain and not editing
  if (sectionOrder.length === 0 && !isEditMode) return null;

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
            <Text style={[styles.xpValue, { color: scheme.primary }]}>{character.xp}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── XP Modal ──────────────────────────────── */}
      <ModalOverlay visible={showXpModal} onClose={() => setShowXpModal(false)} scheme={scheme} title="Experience Points">
        <View style={styles.xpModalRow}>
          <TouchableOpacity onPress={() => adjustXp(-1)} style={[styles.xpAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]} activeOpacity={0.7}>
            <Text style={[styles.xpAdjustText, { color: scheme.destructive }]}>−</Text>
          </TouchableOpacity>
          <TextInput
            value={draftXp}
            onChangeText={(v) => { if (v === '' || /^\d+$/.test(v)) setDraftXp(v); }}
            keyboardType="number-pad"
            style={[styles.xpModalInput, { color: scheme.primary, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
            selectionColor={scheme.primary}
            selectTextOnFocus
            autoFocus
          />
          <TouchableOpacity onPress={() => adjustXp(1)} style={[styles.xpAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]} activeOpacity={0.7}>
            <Text style={[styles.xpAdjustText, { color: scheme.primary }]}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => setShowXpModal(false)} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Save" onPress={handleXpSave} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
        </View>
      </ModalOverlay>

      {/* ── Unified Section Rendering ─────────────── */}
      {sectionOrder.map((sectionId, idx) => {
        const totalSections = sectionOrder.length;
        const editControls = isEditMode ? (
          <View style={styles.editControls}>
            <TouchableOpacity
              onPress={() => reorderCharacterSection(character.id, idx, idx - 1)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              disabled={idx === 0}
            >
              <Text style={[styles.reorderArrow, { color: idx === 0 ? scheme.textMuted : scheme.primary }]}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => reorderCharacterSection(character.id, idx, idx + 1)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              disabled={idx === totalSections - 1}
            >
              <Text style={[styles.reorderArrow, { color: idx === totalSections - 1 ? scheme.textMuted : scheme.primary }]}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveSection(sectionId)}
              onBlur={() => setConfirmSectionId(null)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              {confirmSectionId === sectionId ? (
                <Text style={[styles.reorderArrow, { color: scheme.destructive, fontSize: 10 }]}>✓?</Text>
              ) : (
                <Ionicons name="close-circle" size={18} color={scheme.destructive} />
              )}
            </TouchableOpacity>
          </View>
        ) : null;

        // ── Description ──
        if (sectionId === '__description') {
          return (
            <CollapsibleSection
              key="__description"
              title="Description"
              scheme={scheme}
              collapsed={collapsed.description ?? false}
              onToggle={() => toggle('description')}
              rightContent={editControls}
            >
              <TextContentRow
                content={character.description}
                scheme={scheme}
                placeholder="Tap to add description..."
                title="Description"
                onSave={(v) => updateCharacterField(character.id, 'description', v)}
              />
            </CollapsibleSection>
          );
        }

        // ── Traits ──
        if (sectionId === '__traits') {
          return (
            <CollapsibleSection
              key="__traits"
              title="Traits"
              scheme={scheme}
              collapsed={collapsed.traits ?? true}
              onToggle={() => toggle('traits')}
              rightContent={
                isEditMode ? editControls : (
                  <TouchableOpacity
                    onPress={() => { setNewTraitName(''); setNewTraitLevel(1); setShowAddTrait(true); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                )
              }
            >
              {character.traits.length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>No traits yet. Tap + to add one.</Text>
              ) : null}
              {character.traits.map((trait, tIdx) => (
                <TraitRow
                  key={trait.id}
                  trait={trait}
                  scheme={scheme}
                  onUpdate={(name, level) => updateTrait(character.id, trait.id, name, level)}
                  onRemove={() => removeTrait(character.id, trait.id)}
                  onMoveUp={tIdx > 0 ? () => reorderCharacterTraits(character.id, tIdx, tIdx - 1) : undefined}
                  onMoveDown={tIdx < character.traits.length - 1 ? () => reorderCharacterTraits(character.id, tIdx, tIdx + 1) : undefined}
                />
              ))}
            </CollapsibleSection>
          );
        }

        // ── Custom Components ──
        const comp = character.additionalComponents.find((c) => c.id === sectionId);
        if (!comp) return null;

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
                isEditMode ? editControls : (
                  <TouchableOpacity
                    onPress={() => setAddingItemCompId(comp.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                )
              }
            >
              {listComp.items.length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>
              ) : null}
              {listComp.items.map((item, itemIdx) => (
                <NamedItemRow
                  key={item.id}
                  item={item}
                  scheme={scheme}
                  onUpdate={(name, desc) => updateCharacterComponentListItem(character.id, comp.id, item.id, name, desc)}
                  onRemove={() => removeCharacterComponentListItem(character.id, comp.id, item.id)}
                  onMoveUp={itemIdx > 0 ? () => reorderCharacterComponentListItems(character.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                  onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCharacterComponentListItems(character.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                />
              ))}
              <AddItemRow
                visible={addingItemCompId === comp.id}
                scheme={scheme}
                title={`Add ${comp.name}`}
                onAdd={(name, desc) => { addCharacterComponentListItem(character.id, comp.id, name, desc); setAddingItemCompId(null); }}
                onCancel={() => setAddingItemCompId(null)}
              />
            </CollapsibleSection>
          );
        }

        if (comp.type === 'number') {
          const numComp = comp as AdditionalNumberComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={editControls}
            >
              <TouchableOpacity onPress={() => setEditingNumber(numComp)} activeOpacity={0.7} style={styles.numBox}>
                <Text style={[styles.numValue, { color: scheme.primary }]}>{numComp.value}</Text>
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
            rightContent={editControls}
          >
            <TextContentRow
              content={(comp as AdditionalTextComponent).content}
              scheme={scheme}
              placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
              title={comp.name}
              onSave={(v) => updateCharacterComponentText(character.id, comp.id, comp.name, v)}
            />
          </CollapsibleSection>
        );
      })}

      {/* ── Add Trait Modal ─────────────────────────── */}
      <ModalOverlay visible={showAddTrait} onClose={() => setShowAddTrait(false)} scheme={scheme} title="New Trait">
        <GlassInput
          scheme={scheme}
          label="Trait Name"
          value={newTraitName}
          onChangeText={setNewTraitName}
          placeholder="e.g. Swordsmanship"
          containerStyle={{ marginBottom: 16 }}
        />
        <Text style={[styles.levelLabel, { color: scheme.textSecondary }]}>Level</Text>
        <View style={styles.levelRow}>
          {TRAIT_LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setNewTraitLevel(l)}
              style={[
                styles.levelPip,
                {
                  backgroundColor: l <= newTraitLevel ? scheme.levelColors[newTraitLevel - 1] : scheme.surface,
                  borderColor: l <= newTraitLevel ? scheme.primary : scheme.surfaceBorder,
                },
              ]}
            >
              <Text style={{ color: l <= newTraitLevel ? scheme.text : scheme.textMuted, fontSize: 11, fontWeight: '700' }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => setShowAddTrait(false)} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Add Trait" onPress={handleAddTrait} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!newTraitName.trim()} />
        </View>
      </ModalOverlay>

      {/* ── Add Section button (Edit Mode) ──────────── */}
      {isEditMode && (
        <TouchableOpacity
          onPress={() => setAddingComp(true)}
          style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <Text style={[styles.addSectionText, { color: scheme.textSecondary }]}>+ Add Section</Text>
        </TouchableOpacity>
      )}

      {/* ── Number Component Edit Modal ─────────────── */}
      <NumberEditModal
        visible={editingNumber !== null}
        title={editingNumber?.name ?? ''}
        initialValue={editingNumber?.value ?? 0}
        scheme={scheme}
        onSave={(n) => { if (editingNumber) updateCharacterComponentNumber(character.id, editingNumber.id, n); }}
        onClose={() => setEditingNumber(null)}
      />

      {/* ── Add Section Modal ───────────────────────── */}
      {renderAddSectionModal()}
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
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reorderArrow: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  addSectionBtn: {
    marginTop: 4,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addSectionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
