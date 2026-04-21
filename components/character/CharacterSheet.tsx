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
import {
  Character,
  AdditionalNumberComponent,
  AdditionalTextComponent,
  AdditionalNPCComponent,
  AdditionalTextListComponent,
  AdditionalNumberListComponent,
  AdditionalNPCListComponent,
  CollapsedSections,
  NPCTrait,
  TextListItem,
  NumberListItem,
} from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import TextContentRow from '../ui/TextContentRow';
import ModalOverlay from '../ui/ModalOverlay';
import NumberEditModal from '../ui/NumberEditModal';
import NPCRow from '../ui/NPCRow';
import NumberListItemRow from '../ui/NumberListItemRow';
import TextListItemRow from '../ui/TextListItemRow';
import AddItemRow from '../ui/AddItemRow';

import EditControls from '../ui/EditControls';

type ComponentType = 'text' | 'number' | 'npc' | 'text-list' | 'number-list' | 'npc-list';

const COMP_TYPES: { type: ComponentType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'number', label: 'Number' },
  { type: 'npc', label: 'NPC' },
  { type: 'text-list', label: 'Text List' },
  { type: 'number-list', label: 'Number List' },
  { type: 'npc-list', label: 'NPC List' },
];

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
    updateCharacterNPCComponent,
    addCharacterNPCTrait,
    updateCharacterNPCTrait,
    removeCharacterNPCTrait,
    addCharacterTextListItem,
    updateCharacterTextListItem,
    removeCharacterTextListItem,
    reorderCharacterTextListItems,
    addCharacterNumberListItem,
    updateCharacterNumberListItemValue,
    removeCharacterNumberListItem,
    reorderCharacterNumberListItems,
    addCharacterNPCListItem,
    updateCharacterNPCListItem,
    removeCharacterNPCListItem,
    reorderCharacterNPCListItems,
    addCharacterNPCListItemTrait,
    updateCharacterNPCListItemTrait,
    removeCharacterNPCListItemTrait,
    reorderCharacterSection,
    removeCharacterSection,
    addCharacterComponent,
    isEditMode,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedSections>({ description: false, traits: true });
  const toggle = (key: string) => setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  // XP
  const [showXpModal, setShowXpModal] = useState(false);
  const [draftXp, setDraftXp] = useState(String(character.xp));
  const openXpModal = () => { setDraftXp(String(character.xp)); setShowXpModal(true); };
  const adjustXp = (delta: number) => { const n = parseInt(draftXp, 10) || 0; setDraftXp(String(Math.max(0, n + delta))); };
  const handleXpSave = () => {
    const n = parseInt(draftXp, 10);
    if (!isNaN(n) && n >= 0) updateCharacterField(character.id, 'xp', n);
    setShowXpModal(false);
  };

  // Add Trait
  const [showAddTrait, setShowAddTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [editingTrait, setEditingTrait] = useState<NumberListItem | null>(null);
  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    addTrait(character.id, newTraitName.trim());
    setNewTraitName(''); setShowAddTrait(false);
  };

  // Section remove confirm
  const [confirmSectionId, setConfirmSectionId] = useState<string | null>(null);
  const handleRemoveSection = (sectionId: string) => {
    if (confirmSectionId === sectionId) { removeCharacterSection(character.id, sectionId); setConfirmSectionId(null); }
    else setConfirmSectionId(sectionId);
  };

  // Add Section modal
  const [addingComp, setAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<ComponentType>('text');
  const resetAddComp = () => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); };
  const handleAddComp = () => {
    if (!newCompName.trim()) return;
    addCharacterComponent(character.id, newCompType, newCompName.trim());
    resetAddComp();
  };

  // Number component editing
  const [editingNumber, setEditingNumber] = useState<AdditionalNumberComponent | null>(null);

  // NPC standalone trait state
  const [addingNPCTraitCompId, setAddingNPCTraitCompId] = useState<string | null>(null);
  const [addingNPCTraitName, setAddingNPCTraitName] = useState('');
  const [editingNPCTrait, setEditingNPCTrait] = useState<{ compId: string; trait: NPCTrait } | null>(null);

  // Text-list add/edit state
  const [addingTextListCompId, setAddingTextListCompId] = useState<string | null>(null);
  const [editingTextListItem, setEditingTextListItem] = useState<{ compId: string; item: TextListItem } | null>(null);
  const [editTextItemName, setEditTextItemName] = useState('');
  const [editTextItemContent, setEditTextItemContent] = useState('');

  // Number-list add/edit state
  const [addingNumListCompId, setAddingNumListCompId] = useState<string | null>(null);
  const [addingNumListName, setAddingNumListName] = useState('');
  const [editingNumListItem, setEditingNumListItem] = useState<{ compId: string; item: NumberListItem } | null>(null);

  // NPC-list add state
  const [addingNPCListCompId, setAddingNPCListCompId] = useState<string | null>(null);

  const sectionOrder = character.sectionOrder ?? [
    '__description', '__traits',
    ...character.additionalComponents.map((c) => c.id),
  ];

  if (sectionOrder.length === 0 && !isEditMode) return null;

  const renderAddSectionModal = () => (
    <Modal visible={addingComp} transparent animationType="fade" onRequestClose={resetAddComp}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={resetAddComp}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                // @ts-ignore
                onClick={(e: any) => e.stopPropagation()}
              >
                <GlassCard scheme={scheme} style={styles.modalCard}>
                  <Text style={[styles.modalTitle, { color: scheme.text }]}>New Section</Text>
                  <TextInput
                    value={newCompName}
                    onChangeText={setNewCompName}
                    placeholder="Section name (e.g. Equipment, Notes)"
                    placeholderTextColor={scheme.textMuted}
                    style={[styles.modalInput, { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
                    autoFocus
                    selectionColor={scheme.primary}
                  />
                  <View style={styles.typeGrid}>
                    {COMP_TYPES.map(({ type, label }) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setNewCompType(type)}
                        style={[
                          styles.typeBtn,
                          {
                            backgroundColor: newCompType === type ? scheme.primaryMuted : scheme.surface,
                            borderColor: newCompType === type ? scheme.primary : scheme.surfaceBorder,
                          },
                        ]}
                      >
                        <Text style={[styles.typeBtnText, { color: newCompType === type ? scheme.primary : scheme.textSecondary }]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.modalActions}>
                    <GlassButton label="Cancel" onPress={resetAddComp} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
                    <GlassButton label="Add" onPress={handleAddComp} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!newCompName.trim()} />
                  </View>
                </GlassCard>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

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
          <EditControls
            scheme={scheme}
            onMoveUp={idx > 0 ? () => reorderCharacterSection(character.id, idx, idx - 1) : undefined}
            onMoveDown={idx < totalSections - 1 ? () => reorderCharacterSection(character.id, idx, idx + 1) : undefined}
            onRemove={() => handleRemoveSection(sectionId)}
            confirmRemove={confirmSectionId === sectionId}
          />
        ) : null;

        // ── Description ──
        if (sectionId === '__description') {
          return (
            <CollapsibleSection key="__description" title="Description" scheme={scheme} collapsed={collapsed.description ?? false} onToggle={() => toggle('description')} rightContent={editControls}>
              <TextContentRow content={character.description} scheme={scheme} placeholder="Tap to add description..." title="Description" onSave={(v) => updateCharacterField(character.id, 'description', v)} />
            </CollapsibleSection>
          );
        }

        // ── Traits (number-list style) ──
        if (sectionId === '__traits') {
          return (
            <CollapsibleSection
              key="__traits"
              title="Traits"
              scheme={scheme}
              collapsed={collapsed.traits ?? true}
              onToggle={() => toggle('traits')}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => { setNewTraitName(''); setShowAddTrait(true); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {character.traits.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No traits yet. Tap + to add one.</Text>}
              <View style={{ gap: 8 }}>
                {character.traits.map((trait, tIdx) => (
                  <NumberListItemRow
                    key={trait.id}
                    item={trait}
                    scheme={scheme}
                    onUpdateValue={(value) => updateTrait(character.id, trait.id, trait.name, value)}
                    onRemove={() => removeTrait(character.id, trait.id)}
                    onMoveUp={tIdx > 0 ? () => reorderCharacterTraits(character.id, tIdx, tIdx - 1) : undefined}
                    onMoveDown={tIdx < character.traits.length - 1 ? () => reorderCharacterTraits(character.id, tIdx, tIdx + 1) : undefined}
                  />
                ))}
              </View>
            </CollapsibleSection>
          );
        }

        // ── Custom Components ──
        const comp = character.additionalComponents.find((c) => c.id === sectionId);
        if (!comp) return null;

        // ── Number (inline, no collapse) ──
        if (comp.type === 'number') {
          const numComp = comp as AdditionalNumberComponent;
          return (
            <View key={comp.id} style={[styles.inlineNumRow, { borderColor: scheme.surfaceBorder }]}>
              <View style={[styles.inlineNumTitlePill, { borderColor: scheme.surfaceBorder }]}>
                <Text style={[styles.inlineNumTitle, { color: scheme.textSecondary }]} numberOfLines={1}>{comp.name}</Text>
              </View>
              {isEditMode && editControls}
              <TouchableOpacity onPress={() => setEditingNumber(numComp)} activeOpacity={0.7} style={[styles.inlineNumValueBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}>
                <Text style={[styles.inlineNumValue, { color: scheme.primary }]}>{numComp.value}</Text>
              </TouchableOpacity>
            </View>
          );
        }

        // ── NPC (standalone) ──
        if (comp.type === 'npc') {
          const npcComp = comp as AdditionalNPCComponent;
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
                content={npcComp.description}
                scheme={scheme}
                placeholder="Tap to add description..."
                title={comp.name}
                onSave={(v) => updateCharacterNPCComponent(character.id, comp.id, comp.name, v)}
              />
              {npcComp.traits.length > 0 && (
                <View style={styles.npcTraitsContainer}>
                  {npcComp.traits.map((trait) => (
                    <View key={trait.id} style={styles.npcTraitRow}>
                      <Text style={[styles.npcTraitName, { color: scheme.textSecondary }]}>{trait.name}</Text>
                      <TouchableOpacity
                        onPress={() => setEditingNPCTrait({ compId: comp.id, trait })}
                        style={[styles.npcTraitValueBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
                      >
                        <Text style={[styles.npcTraitValue, { color: scheme.primary }]}>{trait.value}</Text>
                      </TouchableOpacity>
                      {isEditMode && (
                        <EditControls
                          scheme={scheme}
                          onRemove={() => removeCharacterNPCTrait(character.id, comp.id, trait.id)}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity onPress={() => { setAddingNPCTraitName(''); setAddingNPCTraitCompId(comp.id); }} style={styles.addTraitBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={[styles.addTraitText, { color: scheme.primary }]}>+ Add Trait</Text>
              </TouchableOpacity>
            </CollapsibleSection>
          );
        }

        // ── Text List ──
        if (comp.type === 'text-list') {
          const listComp = comp as AdditionalTextListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setAddingTextListCompId(comp.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {listComp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {listComp.items.map((item, itemIdx) => (
                  <TextListItemRow
                    key={item.id}
                    item={item}
                    scheme={scheme}
                    onUpdate={(name, content) => updateCharacterTextListItem(character.id, comp.id, item.id, name, content)}
                    onRemove={() => removeCharacterTextListItem(character.id, comp.id, item.id)}
                    onMoveUp={itemIdx > 0 ? () => reorderCharacterTextListItems(character.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCharacterTextListItems(character.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
              <AddItemRow
                visible={addingTextListCompId === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                namePlaceholder="Item Name"
                descPlaceholder="Content (optional)"
                onAdd={(name, content) => { addCharacterTextListItem(character.id, comp.id, name, content); setAddingTextListCompId(null); }}
                onCancel={() => setAddingTextListCompId(null)}
              />
            </CollapsibleSection>
          );
        }

        // ── Number List ──
        if (comp.type === 'number-list') {
          const listComp = comp as AdditionalNumberListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => { setAddingNumListName(''); setAddingNumListCompId(comp.id); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {listComp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {listComp.items.map((item, itemIdx) => (
                  <NumberListItemRow
                    key={item.id}
                    item={item}
                    scheme={scheme}
                    onUpdateValue={(n) => updateCharacterNumberListItemValue(character.id, comp.id, item.id, n)}
                    onRemove={() => removeCharacterNumberListItem(character.id, comp.id, item.id)}
                    onMoveUp={itemIdx > 0 ? () => reorderCharacterNumberListItems(character.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCharacterNumberListItems(character.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
            </CollapsibleSection>
          );
        }

        // ── NPC List ──
        if (comp.type === 'npc-list') {
          const listComp = comp as AdditionalNPCListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? true}
              onToggle={() => toggle(comp.id)}
              rightContent={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity onPress={() => setAddingNPCListCompId(comp.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                  {isEditMode && editControls}
                </View>
              }
            >
              {listComp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
              <View style={{ gap: 8 }}>
                {listComp.items.map((item, itemIdx) => (
                  <NPCRow
                    key={item.id}
                    item={item}
                    scheme={scheme}
                    onUpdate={(name, desc) => updateCharacterNPCListItem(character.id, comp.id, item.id, name, desc)}
                    onRemove={() => removeCharacterNPCListItem(character.id, comp.id, item.id)}
                    onAddTrait={(name) => addCharacterNPCListItemTrait(character.id, comp.id, item.id, name)}
                    onUpdateTrait={(traitId, name, value) => updateCharacterNPCListItemTrait(character.id, comp.id, item.id, traitId, name, value)}
                    onRemoveTrait={(traitId) => removeCharacterNPCListItemTrait(character.id, comp.id, item.id, traitId)}
                    onMoveUp={itemIdx > 0 ? () => reorderCharacterNPCListItems(character.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                    onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCharacterNPCListItems(character.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                  />
                ))}
              </View>
              <AddItemRow
                visible={addingNPCListCompId === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                onAdd={(name, desc) => { addCharacterNPCListItem(character.id, comp.id, name, desc); setAddingNPCListCompId(null); }}
                onCancel={() => setAddingNPCListCompId(null)}
              />
            </CollapsibleSection>
          );
        }

        // ── Text (default) ──
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
        <GlassInput scheme={scheme} label="Trait Name" value={newTraitName} onChangeText={setNewTraitName} placeholder="e.g. Swordsmanship" containerStyle={{ marginBottom: 20 }} autoFocus />
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => setShowAddTrait(false)} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Add" onPress={handleAddTrait} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!newTraitName.trim()} />
        </View>
      </ModalOverlay>

      {/* ── Edit Trait Value Modal ───────────────────── */}
      <NumberEditModal
        visible={editingTrait !== null}
        title={editingTrait?.name ?? ''}
        initialValue={editingTrait?.value ?? 0}
        scheme={scheme}
        onSave={(value) => { if (editingTrait) updateTrait(character.id, editingTrait.id, editingTrait.name, value); }}
        onClose={() => setEditingTrait(null)}
      />

      {/* ── Add Section button (Edit Mode) ──────────── */}
      {isEditMode && (
        <TouchableOpacity onPress={() => setAddingComp(true)} style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}>
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

      {/* ── Number List Item Edit Modal ─────────────── */}
      <NumberEditModal
        visible={editingNumListItem !== null}
        title={editingNumListItem?.item.name ?? ''}
        initialValue={editingNumListItem?.item.value ?? 0}
        scheme={scheme}
        onSave={(n) => { if (editingNumListItem) updateCharacterNumberListItemValue(character.id, editingNumListItem.compId, editingNumListItem.item.id, n); }}
        onClose={() => setEditingNumListItem(null)}
      />

      {/* ── Add Number List Item Modal ───────────────── */}
      <ModalOverlay visible={addingNumListCompId !== null} onClose={() => setAddingNumListCompId(null)} scheme={scheme} title="Add Item">
        <GlassInput scheme={scheme} label="Name" value={addingNumListName} onChangeText={setAddingNumListName} placeholder="e.g. Gold" containerStyle={{ marginBottom: 20 }} autoFocus />
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => { setAddingNumListCompId(null); setAddingNumListName(''); }} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton
            label="Add"
            onPress={() => {
              if (addingNumListCompId && addingNumListName.trim()) {
                addCharacterNumberListItem(character.id, addingNumListCompId, addingNumListName.trim());
                setAddingNumListCompId(null);
                setAddingNumListName('');
              }
            }}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
            disabled={!addingNumListName.trim()}
          />
        </View>
      </ModalOverlay>

      {/* ── NPC Standalone: Add Trait Modal ─────────── */}
      <ModalOverlay visible={addingNPCTraitCompId !== null} onClose={() => setAddingNPCTraitCompId(null)} scheme={scheme} title="Add Trait">
        <GlassInput scheme={scheme} label="Trait Name" value={addingNPCTraitName} onChangeText={setAddingNPCTraitName} placeholder="e.g. Strength" containerStyle={{ marginBottom: 20 }} autoFocus />
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => { setAddingNPCTraitCompId(null); setAddingNPCTraitName(''); }} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton
            label="Add"
            onPress={() => {
              if (addingNPCTraitCompId && addingNPCTraitName.trim()) {
                addCharacterNPCTrait(character.id, addingNPCTraitCompId, addingNPCTraitName.trim());
                setAddingNPCTraitCompId(null);
                setAddingNPCTraitName('');
              }
            }}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
            disabled={!addingNPCTraitName.trim()}
          />
        </View>
      </ModalOverlay>

      {/* ── NPC Standalone: Edit Trait Modal ────────── */}
      {editingNPCTrait && (
        <NumberEditModal
          visible={!!editingNPCTrait}
          title={editingNPCTrait.trait.name}
          initialValue={editingNPCTrait.trait.value}
          scheme={scheme}
          onSave={(value) => {
            updateCharacterNPCTrait(character.id, editingNPCTrait.compId, editingNPCTrait.trait.id, editingNPCTrait.trait.name, value);
            setEditingNPCTrait(null);
          }}
          onClose={() => setEditingNPCTrait(null)}
        />
      )}

      {/* ── Add Section Modal ───────────────────────── */}
      {renderAddSectionModal()}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  nameInput: { flex: 1, minWidth: 0, fontSize: 22, fontWeight: '700', letterSpacing: 0.3, paddingVertical: 4 },
  xpBox: { alignItems: 'center', width: 72, flexShrink: 0 },
  xpLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  xpDisplay: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, width: 72, alignItems: 'center' },
  xpValue: { fontSize: 18, fontWeight: '700' },
  xpModalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  xpAdjustBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  xpAdjustText: { fontSize: 24, fontWeight: '700', lineHeight: 28 },
  xpModalInput: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  empty: { fontStyle: 'italic', fontSize: 13, paddingVertical: 8 },
  addBtn: { fontSize: 20, fontWeight: '700', lineHeight: 24, paddingHorizontal: 4 },
  modalActions: { flexDirection: 'row', gap: 8 },
  editControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reorderArrow: { fontSize: 16, fontWeight: '700', lineHeight: 20 },
  addSectionBtn: { marginTop: 4, paddingVertical: 9, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', alignItems: 'center' },
  addSectionText: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { maxWidth: 400, alignSelf: 'center', width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { width: '30%', flexGrow: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  typeBtnText: { fontSize: 12, fontWeight: '600' },
  // Inline number row
  inlineNumRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 0 },
  inlineNumTitlePill: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, justifyContent: 'center' },
  inlineNumTitle: { fontSize: 14, fontWeight: '500' },
  inlineNumValueBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  inlineNumValue: { fontSize: 16, fontWeight: '700' },
  // NPC standalone traits
  npcTraitsContainer: { marginTop: 8, gap: 6 },
  npcTraitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  npcTraitName: { flex: 1, fontSize: 13 },
  npcTraitValueBtn: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1, minWidth: 36, alignItems: 'center' },
  npcTraitValue: { fontSize: 13, fontWeight: '700' },
  addTraitBtn: { marginTop: 8, alignSelf: 'flex-start' },
  addTraitText: { fontSize: 12, fontWeight: '600' },
  // Text list items
  textListItem: { marginBottom: 4 },
  textListItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  textListItemName: { flex: 1, fontSize: 13, fontWeight: '600' },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moveArrow: { fontSize: 13, fontWeight: '700', lineHeight: 16 },
  // Number list items
  numListItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  traitRow: { borderBottomWidth: 0, paddingVertical: 4 },
  numListItemName: { flex: 1, fontSize: 13, fontWeight: '600' },
  numListItemEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
