import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { COLOR_SCHEMES, ColorScheme, DEFAULT_SCHEME } from '../../constants/colorSchemes';
import { ColorSchemeId } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import TextContentRow from '../ui/TextContentRow';
import ModalOverlay from '../modals/ModalOverlay';
import ColorSchemeModal from '../modals/ColorSchemeModal';
import NumberEditModal from '../modals/NumberEditModal';
import NPCEditModal from '../modals/NPCEditModal';
import NPCRow from '../ui/NPCRow';
import NumberListItemRow from '../ui/NumberListItemRow';
import ExpandableTextRow from '../ui/ExpandableTextRow';
import AddItemRow from '../ui/AddItemRow';
import AddSectionModal, { ComponentType } from '../modals/AddSectionModal';
import StandaloneNPC from '../ui/StandaloneNPC';
import EditControls from '../ui/EditControls';

// ── Shared section prop types ────────────────────────────────────────────────

interface SectionProps {
  characterId: string;
  scheme: ColorScheme;
  idx: number;
  total: number;
}

// ── CharacterNameHeader ──────────────────────────────────────────────────────

const CharacterNameHeader = memo(function CharacterNameHeader({
  characterId,
  scheme,
}: {
  characterId: string;
  scheme: ColorScheme;
}) {
  const name = useAppStore((s) => s.characters[characterId]?.name ?? '');
  const xp = useAppStore((s) => s.characters[characterId]?.xp ?? 0);
  const colorScheme = useAppStore((s) => s.characters[characterId]?.colorScheme);
  const campaignId = useAppStore((s) => s.characters[characterId]?.campaignId ?? null);
  const isEditMode = useAppStore((s) => s.isEditMode);
  const updateCharacterField = useAppStore((s) => s.updateCharacterField);
  const updateCampaignField = useAppStore((s) => s.updateCampaignField);
  const removeCharacter = useAppStore((s) => s.removeCharacter);

  const [showXpModal, setShowXpModal] = useState(false);
  const [draftXp, setDraftXp] = useState('0');
  const [showColorModal, setShowColorModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const openXpModal = () => { setDraftXp(String(xp)); setShowXpModal(true); };
  const adjustXp = (delta: number) => {
    const n = parseInt(draftXp, 10) || 0;
    setDraftXp(String(Math.max(0, n + delta)));
  };
  const handleXpSave = () => {
    const n = parseInt(draftXp, 10);
    if (!isNaN(n) && n >= 0) updateCharacterField(characterId, 'xp', n);
    setShowXpModal(false);
  };

  const handleColorChange = (id: ColorSchemeId) => {
    updateCharacterField(characterId, 'colorScheme', id);
    if (campaignId) updateCampaignField(campaignId, 'colorScheme', id);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      removeCharacter(characterId);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <>
      <View style={styles.nameRow}>
        {isEditMode && colorScheme && (
          <TouchableOpacity
            onPress={() => setShowColorModal(true)}
            activeOpacity={0.8}
            style={[styles.colorBtn, { backgroundColor: scheme.primary, borderColor: scheme.surfaceBorder }]}
          />
        )}
        <TextInput
          value={name}
          onChangeText={(v) => updateCharacterField(characterId, 'name', v)}
          style={[styles.nameInput, { color: scheme.text }]}
          placeholder="Character Name"
          placeholderTextColor={scheme.textMuted}
          selectionColor={scheme.primary}
        />
        <TouchableOpacity onPress={openXpModal} style={styles.xpBox} activeOpacity={0.7}>
          <View style={[styles.xpDisplay, { borderColor: scheme.surfaceBorder }]}>
            <Text style={[styles.xpValue, { color: scheme.primary }]}>{xp}</Text>
          </View>
        </TouchableOpacity>
        {isEditMode && (
          <GlassButton
            label={confirmDelete ? 'Confirm?' : 'Delete'}
            onPress={handleDelete}
            scheme={scheme}
            variant={confirmDelete ? 'destructive' : 'ghost'}
            small
          />
        )}
      </View>

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

      {colorScheme && (
        <ColorSchemeModal
          visible={showColorModal}
          onClose={() => setShowColorModal(false)}
          current={colorScheme}
          onChange={handleColorChange}
          scheme={scheme}
        />
      )}
    </>
  );
});

// ── DescriptionSection ───────────────────────────────────────────────────────

const DescriptionSection = memo(function DescriptionSection({ characterId, scheme, idx, total }: SectionProps) {
  const description = useAppStore((s) => s.characters[characterId]?.description ?? '');
  const isEditMode = useAppStore((s) => s.isEditMode);
  const updateCharacterField = useAppStore((s) => s.updateCharacterField);
  const reorderCharacterSection = useAppStore((s) => s.reorderCharacterSection);
  const removeCharacterSection = useAppStore((s) => s.removeCharacterSection);

  const [collapsed, setCollapsed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCharacterSection(characterId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCharacterSection(characterId, idx, idx + 1) : undefined}
      onRemove={() => {
        if (confirmRemove) { removeCharacterSection(characterId, '__description'); }
        else setConfirmRemove(true);
      }}
      confirmRemove={confirmRemove}
    />
  ) : null;

  return (
    <CollapsibleSection
      title="Description"
      scheme={scheme}
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      rightContent={editControls}
    >
      <TextContentRow
        content={description}
        scheme={scheme}
        placeholder="Tap to add description..."
        title="Description"
        onSave={(v) => updateCharacterField(characterId, 'description', v)}
      />
    </CollapsibleSection>
  );
});

// ── TraitsSection ────────────────────────────────────────────────────────────

const TraitsSection = memo(function TraitsSection({ characterId, scheme, idx, total }: SectionProps) {
  const traits = useAppStore(useShallow((s) => s.characters[characterId]?.traits ?? []));
  const isEditMode = useAppStore((s) => s.isEditMode);
  const addTrait = useAppStore((s) => s.addTrait);
  const updateTrait = useAppStore((s) => s.updateTrait);
  const removeTrait = useAppStore((s) => s.removeTrait);
  const reorderCharacterTraits = useAppStore((s) => s.reorderCharacterTraits);
  const reorderCharacterSection = useAppStore((s) => s.reorderCharacterSection);
  const removeCharacterSection = useAppStore((s) => s.removeCharacterSection);

  const [collapsed, setCollapsed] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showAddTrait, setShowAddTrait] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');

  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    addTrait(characterId, newTraitName.trim());
    setNewTraitName('');
    setShowAddTrait(false);
  };

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCharacterSection(characterId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCharacterSection(characterId, idx, idx + 1) : undefined}
      onRemove={() => {
        if (confirmRemove) { removeCharacterSection(characterId, '__traits'); }
        else setConfirmRemove(true);
      }}
      confirmRemove={confirmRemove}
    />
  ) : null;

  return (
    <>
      <CollapsibleSection
        title="Traits"
        scheme={scheme}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        rightContent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => { setNewTraitName(''); setShowAddTrait(true); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
            </TouchableOpacity>
            {isEditMode && editControls}
          </View>
        }
      >
        {traits.length === 0 && (
          <Text style={[styles.empty, { color: scheme.textMuted }]}>No traits yet. Tap + to add one.</Text>
        )}
        <View style={{ gap: 8 }}>
          {traits.map((trait, tIdx) => (
            <NumberListItemRow
              key={trait.id}
              item={trait}
              scheme={scheme}
              onUpdateValue={(value, name) => updateTrait(characterId, trait.id, name ?? trait.name, value)}
              onRemove={() => removeTrait(characterId, trait.id)}
              onMoveUp={tIdx > 0 ? () => reorderCharacterTraits(characterId, tIdx, tIdx - 1) : undefined}
              onMoveDown={tIdx < traits.length - 1 ? () => reorderCharacterTraits(characterId, tIdx, tIdx + 1) : undefined}
            />
          ))}
        </View>
      </CollapsibleSection>

      <ModalOverlay visible={showAddTrait} onClose={() => setShowAddTrait(false)} scheme={scheme} title="New Trait">
        <GlassInput
          scheme={scheme}
          label="Trait Name"
          value={newTraitName}
          onChangeText={setNewTraitName}
          placeholder="e.g. Swordsmanship"
          containerStyle={{ marginBottom: 20 }}
          autoFocus
        />
        <View style={styles.modalActions}>
          <GlassButton label="Cancel" onPress={() => setShowAddTrait(false)} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Add" onPress={handleAddTrait} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!newTraitName.trim()} />
        </View>
      </ModalOverlay>
    </>
  );
});

// ── CharComponentSection ─────────────────────────────────────────────────────

const CharComponentSection = memo(function CharComponentSection({
  characterId,
  componentId,
  scheme,
  idx,
  total,
}: SectionProps & { componentId: string }) {
  const comp = useAppStore((s) =>
    s.characters[characterId]?.additionalComponents.find((c) => c.id === componentId)
  );
  const isEditMode = useAppStore((s) => s.isEditMode);
  const reorderCharacterSection = useAppStore((s) => s.reorderCharacterSection);
  const removeCharacterSection = useAppStore((s) => s.removeCharacterSection);
  const updateCharacterComponentText = useAppStore((s) => s.updateCharacterComponentText);
  const updateCharacterComponentNumber = useAppStore((s) => s.updateCharacterComponentNumber);
  const updateCharacterNPCComponent = useAppStore((s) => s.updateCharacterNPCComponent);
  const addCharacterNPCTrait = useAppStore((s) => s.addCharacterNPCTrait);
  const updateCharacterNPCTrait = useAppStore((s) => s.updateCharacterNPCTrait);
  const removeCharacterNPCTrait = useAppStore((s) => s.removeCharacterNPCTrait);
  const addCharacterTextListItem = useAppStore((s) => s.addCharacterTextListItem);
  const updateCharacterTextListItem = useAppStore((s) => s.updateCharacterTextListItem);
  const removeCharacterTextListItem = useAppStore((s) => s.removeCharacterTextListItem);
  const reorderCharacterTextListItems = useAppStore((s) => s.reorderCharacterTextListItems);
  const addCharacterNumberListItem = useAppStore((s) => s.addCharacterNumberListItem);
  const updateCharacterNumberListItemValue = useAppStore((s) => s.updateCharacterNumberListItemValue);
  const removeCharacterNumberListItem = useAppStore((s) => s.removeCharacterNumberListItem);
  const reorderCharacterNumberListItems = useAppStore((s) => s.reorderCharacterNumberListItems);
  const addCharacterNPCListItem = useAppStore((s) => s.addCharacterNPCListItem);
  const updateCharacterNPCListItem = useAppStore((s) => s.updateCharacterNPCListItem);
  const removeCharacterNPCListItem = useAppStore((s) => s.removeCharacterNPCListItem);
  const reorderCharacterNPCListItems = useAppStore((s) => s.reorderCharacterNPCListItems);
  const addCharacterNPCListItemTrait = useAppStore((s) => s.addCharacterNPCListItemTrait);
  const updateCharacterNPCListItemTrait = useAppStore((s) => s.updateCharacterNPCListItemTrait);
  const removeCharacterNPCListItemTrait = useAppStore((s) => s.removeCharacterNPCListItemTrait);

  const [collapsed, setCollapsed] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  if (!comp) return null;

  const handleRemoveSection = () => {
    if (confirmRemove) { removeCharacterSection(characterId, componentId); }
    else setConfirmRemove(true);
  };

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCharacterSection(characterId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCharacterSection(characterId, idx, idx + 1) : undefined}
      onRemove={handleRemoveSection}
      confirmRemove={confirmRemove}
    />
  ) : null;

  // ── Number (no collapse) ──
  if (comp.type === 'number') {
    return (
      <View style={{ marginTop: 12, marginBottom: 4 }}>
        <NumberListItemRow
          item={{ id: comp.id, name: comp.name, value: comp.value }}
          scheme={scheme}
          onUpdateValue={(val, name) => updateCharacterComponentNumber(characterId, comp.id, val, name ?? comp.name)}
          onRemove={handleRemoveSection}
          confirmRemove={confirmRemove}
          onMoveUp={idx > 0 ? () => reorderCharacterSection(characterId, idx, idx - 1) : undefined}
          onMoveDown={idx < total - 1 ? () => reorderCharacterSection(characterId, idx, idx + 1) : undefined}
        />
      </View>
    );
  }

  // ── NPC (standalone) ──
  if (comp.type === 'npc') {
    return (
      <StandaloneNPC
        comp={comp}
        scheme={scheme}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        editControls={editControls}
        onUpdate={(name, desc) => updateCharacterNPCComponent(characterId, comp.id, name, desc)}
        onAddTrait={(name) => addCharacterNPCTrait(characterId, comp.id, name)}
        onUpdateTrait={(traitId, name, val) => updateCharacterNPCTrait(characterId, comp.id, traitId, name, val)}
        onRemoveTrait={(traitId) => removeCharacterNPCTrait(characterId, comp.id, traitId)}
      />
    );
  }

  // ── Text List ──
  if (comp.type === 'text-list') {
    return (
      <CollapsibleSection
        title={comp.name}
        scheme={scheme}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        rightContent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setAddingItem(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
            </TouchableOpacity>
            {isEditMode && editControls}
          </View>
        }
      >
        {comp.items.length === 0 && (
          <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>
        )}
        <View style={{ gap: 8 }}>
          {comp.items.map((item, itemIdx) => (
            <ExpandableTextRow
              key={item.id}
              name={item.name}
              content={item.content}
              scheme={scheme}
              onUpdate={(name, content) => updateCharacterTextListItem(characterId, comp.id, item.id, name, content)}
              onRemove={() => removeCharacterTextListItem(characterId, comp.id, item.id)}
              onMoveUp={itemIdx > 0 ? () => reorderCharacterTextListItems(characterId, comp.id, itemIdx, itemIdx - 1) : undefined}
              onMoveDown={itemIdx < comp.items.length - 1 ? () => reorderCharacterTextListItems(characterId, comp.id, itemIdx, itemIdx + 1) : undefined}
            />
          ))}
        </View>
        <AddItemRow
          visible={addingItem}
          scheme={scheme}
          title={`Add to ${comp.name}`}
          namePlaceholder="Item Name"
          descPlaceholder="Content (optional)"
          onAdd={(name, content) => { addCharacterTextListItem(characterId, comp.id, name, content); setAddingItem(false); }}
          onCancel={() => setAddingItem(false)}
        />
      </CollapsibleSection>
    );
  }

  // ── Number List ──
  if (comp.type === 'number-list') {
    return (
      <>
        <CollapsibleSection
          title={comp.name}
          scheme={scheme}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          rightContent={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => setAddingItem(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
              </TouchableOpacity>
              {isEditMode && editControls}
            </View>
          }
        >
          {comp.items.length === 0 && (
            <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>
          )}
          <View style={{ gap: 8 }}>
            {comp.items.map((item, itemIdx) => (
              <NumberListItemRow
                key={item.id}
                item={item}
                scheme={scheme}
                onUpdateValue={(n, name) => updateCharacterNumberListItemValue(characterId, comp.id, item.id, n, name ?? item.name)}
                onRemove={() => removeCharacterNumberListItem(characterId, comp.id, item.id)}
                onMoveUp={itemIdx > 0 ? () => reorderCharacterNumberListItems(characterId, comp.id, itemIdx, itemIdx - 1) : undefined}
                onMoveDown={itemIdx < comp.items.length - 1 ? () => reorderCharacterNumberListItems(characterId, comp.id, itemIdx, itemIdx + 1) : undefined}
              />
            ))}
          </View>
        </CollapsibleSection>

        <NumberEditModal
          visible={addingItem}
          title="Add Item"
          initialValue={0}
          initialName=""
          allowNameEdit
          scheme={scheme}
          onSave={(value, name) => {
            if (name?.trim()) {
              addCharacterNumberListItem(characterId, comp.id, name.trim(), value);
              setAddingItem(false);
            }
          }}
          onClose={() => setAddingItem(false)}
        />
      </>
    );
  }

  // ── NPC List ──
  if (comp.type === 'npc-list') {
    return (
      <>
        <CollapsibleSection
          title={comp.name}
          scheme={scheme}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          rightContent={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => setAddingItem(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
              </TouchableOpacity>
              {isEditMode && editControls}
            </View>
          }
        >
          {comp.items.length === 0 && (
            <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>
          )}
          <View style={{ gap: 8 }}>
            {comp.items.map((item, itemIdx) => (
              <NPCRow
                key={item.id}
                item={item}
                scheme={scheme}
                onUpdate={(name, desc) => updateCharacterNPCListItem(characterId, comp.id, item.id, name, desc)}
                onRemove={() => removeCharacterNPCListItem(characterId, comp.id, item.id)}
                onAddTrait={(name) => addCharacterNPCListItemTrait(characterId, comp.id, item.id, name)}
                onUpdateTrait={(traitId, name, value) => updateCharacterNPCListItemTrait(characterId, comp.id, item.id, traitId, name, value)}
                onRemoveTrait={(traitId) => removeCharacterNPCListItemTrait(characterId, comp.id, item.id, traitId)}
                onMoveUp={itemIdx > 0 ? () => reorderCharacterNPCListItems(characterId, comp.id, itemIdx, itemIdx - 1) : undefined}
                onMoveDown={itemIdx < comp.items.length - 1 ? () => reorderCharacterNPCListItems(characterId, comp.id, itemIdx, itemIdx + 1) : undefined}
              />
            ))}
          </View>
        </CollapsibleSection>

        <NPCEditModal
          visible={addingItem}
          scheme={scheme}
          title={`Add to ${comp.name}`}
          isAdding
          onConfirm={(name, desc, traits) => {
            addCharacterNPCListItem(characterId, comp.id, name, desc, traits);
            setAddingItem(false);
          }}
          onCancel={() => setAddingItem(false)}
          onAddTrait={() => {}}
          onUpdateTrait={() => {}}
          onRemoveTrait={() => {}}
        />
      </>
    );
  }

  // ── Text (default) ──
  return (
    <CollapsibleSection
      title={comp.name}
      scheme={scheme}
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      rightContent={editControls}
    >
      <TextContentRow
        content={comp.content}
        scheme={scheme}
        placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
        title={comp.name}
        allowNameEdit
        initialName={comp.name}
        onSave={(v, newName) => updateCharacterComponentText(characterId, comp.id, newName || comp.name, v)}
      />
    </CollapsibleSection>
  );
});

// ── CharacterSheet ───────────────────────────────────────────────────────────

interface Props {
  characterId: string;
}

export default function CharacterSheet({ characterId }: Props) {
  const { colorScheme, sectionOrder } = useAppStore(
    useShallow((s) => {
      const char = s.characters[characterId];
      return {
        colorScheme: (char?.colorScheme ?? DEFAULT_SCHEME) as ColorSchemeId,
        sectionOrder: char?.sectionOrder ?? (char
          ? ['__description', '__traits', ...char.additionalComponents.map((c) => c.id)]
          : []),
      };
    })
  );
  const isEditMode = useAppStore((s) => s.isEditMode);
  const addCharacterComponent = useAppStore((s) => s.addCharacterComponent);

  const scheme = COLOR_SCHEMES[colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
  const total = sectionOrder.length;

  const [addingComp, setAddingComp] = useState(false);

  if (sectionOrder.length === 0 && !isEditMode) return null;

  return (
    <GlassCard scheme={scheme} style={styles.card}>
      <CharacterNameHeader characterId={characterId} scheme={scheme} />

      {sectionOrder.map((sectionId, idx) => {
        if (sectionId === '__description') {
          return (
            <DescriptionSection
              key="__description"
              characterId={characterId}
              scheme={scheme}
              idx={idx}
              total={total}
            />
          );
        }
        if (sectionId === '__traits') {
          return (
            <TraitsSection
              key="__traits"
              characterId={characterId}
              scheme={scheme}
              idx={idx}
              total={total}
            />
          );
        }
        return (
          <CharComponentSection
            key={sectionId}
            characterId={characterId}
            componentId={sectionId}
            scheme={scheme}
            idx={idx}
            total={total}
          />
        );
      })}

      {isEditMode && (
        <TouchableOpacity
          onPress={() => setAddingComp(true)}
          style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <Text style={[styles.addSectionText, { color: scheme.textSecondary }]}>+ Add Section</Text>
        </TouchableOpacity>
      )}

      <AddSectionModal
        visible={addingComp}
        onClose={() => setAddingComp(false)}
        onAdd={(type: ComponentType, name: string) => addCharacterComponent(characterId, type, name)}
        scheme={scheme}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  colorBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, flexShrink: 0 },
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
  addSectionBtn: { marginTop: 4, paddingVertical: 9, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', alignItems: 'center' },
  addSectionText: { fontSize: 13, fontWeight: '500' },
});
