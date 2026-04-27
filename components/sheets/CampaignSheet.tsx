import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import NumberEditModal from '../modals/NumberEditModal';
import ColorSchemeModal from '../modals/ColorSchemeModal';
import GlassButton from '../ui/GlassButton';
import NPCEditModal from '../modals/NPCEditModal';
import { COLOR_SCHEMES, ColorScheme, DEFAULT_SCHEME } from '../../constants/colorSchemes';
import { ColorSchemeId, NamedItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import TextContentRow from '../ui/TextContentRow';
import ExpandableTextRow from '../ui/ExpandableTextRow';
import AddItemRow from '../ui/AddItemRow';
import NPCRow from '../ui/NPCRow';
import NumberListItemRow from '../ui/NumberListItemRow';
import AddSectionModal, { ComponentType } from '../modals/AddSectionModal';
import StandaloneNPC from '../ui/StandaloneNPC';
import EditControls from '../ui/EditControls';

type NamedListKey = 'locations' | 'scenes';

// ── Shared section prop types ────────────────────────────────────────────────

interface SectionProps {
  campaignId: string;
  scheme: ColorScheme;
  idx: number;
  total: number;
}

// ── CampaignNameHeader ───────────────────────────────────────────────────────

const CampaignNameHeader = memo(function CampaignNameHeader({
  campaignId,
  scheme,
}: {
  campaignId: string;
  scheme: ColorScheme;
}) {
  const name = useAppStore((s) => s.campaigns[campaignId]?.name ?? '');
  const colorScheme = useAppStore((s) => s.campaigns[campaignId]?.colorScheme);
  const isEditMode = useAppStore((s) => s.isEditMode);
  const updateCampaignField = useAppStore((s) => s.updateCampaignField);
  const removeCampaign = useAppStore((s) => s.removeCampaign);

  const [showColorModal, setShowColorModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      removeCampaign(campaignId);
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
          onChangeText={(v) => updateCampaignField(campaignId, 'name', v)}
          style={[styles.nameInput, { color: scheme.text }]}
          placeholder="Campaign Name"
          placeholderTextColor={scheme.textMuted}
          selectionColor={scheme.primary}
        />
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

      {colorScheme && (
        <ColorSchemeModal
          visible={showColorModal}
          onClose={() => setShowColorModal(false)}
          current={colorScheme}
          onChange={(id) => updateCampaignField(campaignId, 'colorScheme', id)}
          scheme={scheme}
        />
      )}
    </>
  );
});

// ── CurrentSceneSection ──────────────────────────────────────────────────────

const CurrentSceneSection = memo(function CurrentSceneSection({ campaignId, scheme, idx, total }: SectionProps) {
  const currentScene = useAppStore((s) => s.campaigns[campaignId]?.currentScene ?? '');
  const isEditMode = useAppStore((s) => s.isEditMode);
  const updateCampaignField = useAppStore((s) => s.updateCampaignField);
  const reorderCampaignSection = useAppStore((s) => s.reorderCampaignSection);
  const removeCampaignSection = useAppStore((s) => s.removeCampaignSection);

  const [collapsed, setCollapsed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCampaignSection(campaignId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCampaignSection(campaignId, idx, idx + 1) : undefined}
      onRemove={() => {
        if (confirmRemove) { removeCampaignSection(campaignId, '__currentScene'); }
        else setConfirmRemove(true);
      }}
      confirmRemove={confirmRemove}
    />
  ) : null;

  return (
    <CollapsibleSection
      title="Current Scene"
      scheme={scheme}
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      rightContent={editControls}
    >
      <TextContentRow
        content={currentScene}
        scheme={scheme}
        placeholder="Tap to describe the current scene..."
        title="Current Scene"
        onSave={(v) => updateCampaignField(campaignId, 'currentScene', v)}
      />
    </CollapsibleSection>
  );
});

// ── BuiltinNPCSection ────────────────────────────────────────────────────────

const BuiltinNPCSection = memo(function BuiltinNPCSection({ campaignId, scheme, idx, total }: SectionProps) {
  const npcs = useAppStore(useShallow((s) => s.campaigns[campaignId]?.npcs ?? []));
  const isEditMode = useAppStore((s) => s.isEditMode);
  const addCampaignBuiltinNPC = useAppStore((s) => s.addCampaignBuiltinNPC);
  const updateCampaignBuiltinNPC = useAppStore((s) => s.updateCampaignBuiltinNPC);
  const removeCampaignBuiltinNPC = useAppStore((s) => s.removeCampaignBuiltinNPC);
  const reorderCampaignBuiltinNPCs = useAppStore((s) => s.reorderCampaignBuiltinNPCs);
  const addCampaignBuiltinNPCTrait = useAppStore((s) => s.addCampaignBuiltinNPCTrait);
  const updateCampaignBuiltinNPCTrait = useAppStore((s) => s.updateCampaignBuiltinNPCTrait);
  const removeCampaignBuiltinNPCTrait = useAppStore((s) => s.removeCampaignBuiltinNPCTrait);
  const reorderCampaignSection = useAppStore((s) => s.reorderCampaignSection);
  const removeCampaignSection = useAppStore((s) => s.removeCampaignSection);

  const [collapsed, setCollapsed] = useState(true);
  const [addingNPC, setAddingNPC] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCampaignSection(campaignId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCampaignSection(campaignId, idx, idx + 1) : undefined}
      onRemove={() => {
        if (confirmRemove) { removeCampaignSection(campaignId, '__npcs'); }
        else setConfirmRemove(true);
      }}
      confirmRemove={confirmRemove}
    />
  ) : null;

  return (
    <>
      <CollapsibleSection
        title="Characters"
        scheme={scheme}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        rightContent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setAddingNPC(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
            </TouchableOpacity>
            {isEditMode && editControls}
          </View>
        }
      >
        {npcs.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet. Tap + to add.</Text>}
        <View style={{ gap: 8 }}>
          {npcs.map((npc, npcIdx) => (
            <NPCRow
              key={npc.id}
              item={npc}
              scheme={scheme}
              onUpdate={(name, desc) => updateCampaignBuiltinNPC(campaignId, npc.id, name, desc)}
              onRemove={() => removeCampaignBuiltinNPC(campaignId, npc.id)}
              onAddTrait={(name) => addCampaignBuiltinNPCTrait(campaignId, npc.id, name)}
              onUpdateTrait={(traitId, name, value) => updateCampaignBuiltinNPCTrait(campaignId, npc.id, traitId, name, value)}
              onRemoveTrait={(traitId) => removeCampaignBuiltinNPCTrait(campaignId, npc.id, traitId)}
              onMoveUp={npcIdx > 0 ? () => reorderCampaignBuiltinNPCs(campaignId, npcIdx, npcIdx - 1) : undefined}
              onMoveDown={npcIdx < npcs.length - 1 ? () => reorderCampaignBuiltinNPCs(campaignId, npcIdx, npcIdx + 1) : undefined}
            />
          ))}
        </View>
      </CollapsibleSection>

      <NPCEditModal
        visible={addingNPC}
        scheme={scheme}
        title="Add Character"
        isAdding
        onConfirm={(name, description, traits) => {
          addCampaignBuiltinNPC(campaignId, name, description, traits);
          setAddingNPC(false);
        }}
        onCancel={() => setAddingNPC(false)}
        onAddTrait={() => {}}
        onUpdateTrait={() => {}}
        onRemoveTrait={() => {}}
      />
    </>
  );
});

// ── BuiltinListSection ───────────────────────────────────────────────────────

interface BuiltinListProps extends SectionProps {
  listKey: NamedListKey;
  sectionId: string;
  label: string;
  accentColor: string;
}

const BuiltinListSection = memo(function BuiltinListSection({
  campaignId, scheme, idx, total, listKey, sectionId, label, accentColor,
}: BuiltinListProps) {
  const items = useAppStore(useShallow((s) => (s.campaigns[campaignId]?.[listKey] ?? []) as NamedItem[]));
  const isEditMode = useAppStore((s) => s.isEditMode);
  const addCampaignListItem = useAppStore((s) => s.addCampaignListItem);
  const updateCampaignListItem = useAppStore((s) => s.updateCampaignListItem);
  const removeCampaignListItem = useAppStore((s) => s.removeCampaignListItem);
  const reorderCampaignListItems = useAppStore((s) => s.reorderCampaignListItems);
  const reorderCampaignSection = useAppStore((s) => s.reorderCampaignSection);
  const removeCampaignSection = useAppStore((s) => s.removeCampaignSection);

  const [collapsed, setCollapsed] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCampaignSection(campaignId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCampaignSection(campaignId, idx, idx + 1) : undefined}
      onRemove={() => {
        if (confirmRemove) { removeCampaignSection(campaignId, sectionId); }
        else setConfirmRemove(true);
      }}
      confirmRemove={confirmRemove}
    />
  ) : null;

  return (
    <CollapsibleSection
      title={label}
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
      {items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet. Tap + to add.</Text>}
      <View style={{ gap: 8 }}>
        {items.map((item, itemIdx) => (
          <ExpandableTextRow
            key={item.id}
            name={item.name}
            content={item.description}
            scheme={scheme}
            accentColor={accentColor}
            onUpdate={(name, description) => updateCampaignListItem(campaignId, listKey, item.id, name, description)}
            onRemove={() => removeCampaignListItem(campaignId, listKey, item.id)}
            onMoveUp={itemIdx > 0 ? () => reorderCampaignListItems(campaignId, listKey, itemIdx, itemIdx - 1) : undefined}
            onMoveDown={itemIdx < items.length - 1 ? () => reorderCampaignListItems(campaignId, listKey, itemIdx, itemIdx + 1) : undefined}
          />
        ))}
      </View>
      <AddItemRow
        visible={addingItem}
        scheme={scheme}
        title={`Add to ${label}`}
        onAdd={(name, description) => { addCampaignListItem(campaignId, listKey, name, description); setAddingItem(false); }}
        onCancel={() => setAddingItem(false)}
      />
    </CollapsibleSection>
  );
});

// ── CampComponentSection ─────────────────────────────────────────────────────

const CampComponentSection = memo(function CampComponentSection({
  campaignId,
  componentId,
  scheme,
  idx,
  total,
}: SectionProps & { componentId: string }) {
  const comp = useAppStore((s) =>
    s.campaigns[campaignId]?.additionalComponents.find((c) => c.id === componentId)
  );
  const isEditMode = useAppStore((s) => s.isEditMode);
  const reorderCampaignSection = useAppStore((s) => s.reorderCampaignSection);
  const removeCampaignSection = useAppStore((s) => s.removeCampaignSection);
  const updateCampaignComponentText = useAppStore((s) => s.updateCampaignComponentText);
  const updateCampaignComponentNumber = useAppStore((s) => s.updateCampaignComponentNumber);
  const updateCampaignNPCComponent = useAppStore((s) => s.updateCampaignNPCComponent);
  const addCampaignNPCTrait = useAppStore((s) => s.addCampaignNPCTrait);
  const updateCampaignNPCTrait = useAppStore((s) => s.updateCampaignNPCTrait);
  const removeCampaignNPCTrait = useAppStore((s) => s.removeCampaignNPCTrait);
  const addCampaignTextListItem = useAppStore((s) => s.addCampaignTextListItem);
  const updateCampaignTextListItem = useAppStore((s) => s.updateCampaignTextListItem);
  const removeCampaignTextListItem = useAppStore((s) => s.removeCampaignTextListItem);
  const reorderCampaignTextListItems = useAppStore((s) => s.reorderCampaignTextListItems);
  const addCampaignNumberListItem = useAppStore((s) => s.addCampaignNumberListItem);
  const updateCampaignNumberListItemValue = useAppStore((s) => s.updateCampaignNumberListItemValue);
  const removeCampaignNumberListItem = useAppStore((s) => s.removeCampaignNumberListItem);
  const reorderCampaignNumberListItems = useAppStore((s) => s.reorderCampaignNumberListItems);
  const addCampaignNPCListItem = useAppStore((s) => s.addCampaignNPCListItem);
  const updateCampaignNPCListItem = useAppStore((s) => s.updateCampaignNPCListItem);
  const removeCampaignNPCListItem = useAppStore((s) => s.removeCampaignNPCListItem);
  const reorderCampaignNPCListItems = useAppStore((s) => s.reorderCampaignNPCListItems);
  const addCampaignNPCListItemTrait = useAppStore((s) => s.addCampaignNPCListItemTrait);
  const updateCampaignNPCListItemTrait = useAppStore((s) => s.updateCampaignNPCListItemTrait);
  const removeCampaignNPCListItemTrait = useAppStore((s) => s.removeCampaignNPCListItemTrait);

  const [collapsed, setCollapsed] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  if (!comp) return null;

  const handleRemoveSection = () => {
    if (confirmRemove) { removeCampaignSection(campaignId, componentId); }
    else setConfirmRemove(true);
  };

  const editControls = isEditMode ? (
    <EditControls
      scheme={scheme}
      onMoveUp={idx > 0 ? () => reorderCampaignSection(campaignId, idx, idx - 1) : undefined}
      onMoveDown={idx < total - 1 ? () => reorderCampaignSection(campaignId, idx, idx + 1) : undefined}
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
          onUpdateValue={(val, name) => updateCampaignComponentNumber(campaignId, comp.id, val, name ?? comp.name)}
          onRemove={handleRemoveSection}
          confirmRemove={confirmRemove}
          onMoveUp={idx > 0 ? () => reorderCampaignSection(campaignId, idx, idx - 1) : undefined}
          onMoveDown={idx < total - 1 ? () => reorderCampaignSection(campaignId, idx, idx + 1) : undefined}
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
        onUpdate={(name, desc) => updateCampaignNPCComponent(campaignId, comp.id, name, desc)}
        onAddTrait={(name) => addCampaignNPCTrait(campaignId, comp.id, name)}
        onUpdateTrait={(traitId, name, val) => updateCampaignNPCTrait(campaignId, comp.id, traitId, name, val)}
        onRemoveTrait={(traitId) => removeCampaignNPCTrait(campaignId, comp.id, traitId)}
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
        {comp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
        <View style={{ gap: 8 }}>
          {comp.items.map((item, itemIdx) => (
            <ExpandableTextRow
              key={item.id}
              name={item.name}
              content={item.content}
              scheme={scheme}
              onUpdate={(name, content) => updateCampaignTextListItem(campaignId, comp.id, item.id, name, content)}
              onRemove={() => removeCampaignTextListItem(campaignId, comp.id, item.id)}
              onMoveUp={itemIdx > 0 ? () => reorderCampaignTextListItems(campaignId, comp.id, itemIdx, itemIdx - 1) : undefined}
              onMoveDown={itemIdx < comp.items.length - 1 ? () => reorderCampaignTextListItems(campaignId, comp.id, itemIdx, itemIdx + 1) : undefined}
            />
          ))}
        </View>
        <AddItemRow
          visible={addingItem}
          scheme={scheme}
          title={`Add to ${comp.name}`}
          namePlaceholder="Item Name"
          descPlaceholder="Content (optional)"
          onAdd={(name, content) => { addCampaignTextListItem(campaignId, comp.id, name, content); setAddingItem(false); }}
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
          {comp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
          <View style={{ gap: 8 }}>
            {comp.items.map((item, itemIdx) => (
              <NumberListItemRow
                key={item.id}
                item={item}
                scheme={scheme}
                onUpdateValue={(n, name) => updateCampaignNumberListItemValue(campaignId, comp.id, item.id, n, name ?? item.name)}
                onRemove={() => removeCampaignNumberListItem(campaignId, comp.id, item.id)}
                onMoveUp={itemIdx > 0 ? () => reorderCampaignNumberListItems(campaignId, comp.id, itemIdx, itemIdx - 1) : undefined}
                onMoveDown={itemIdx < comp.items.length - 1 ? () => reorderCampaignNumberListItems(campaignId, comp.id, itemIdx, itemIdx + 1) : undefined}
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
              addCampaignNumberListItem(campaignId, comp.id, name.trim(), value);
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
          {comp.items.length === 0 && <Text style={[styles.empty, { color: scheme.textMuted }]}>No items yet. Tap + to add.</Text>}
          <View style={{ gap: 8 }}>
            {comp.items.map((item, itemIdx) => (
              <NPCRow
                key={item.id}
                item={item}
                scheme={scheme}
                onUpdate={(name, desc) => updateCampaignNPCListItem(campaignId, comp.id, item.id, name, desc)}
                onRemove={() => removeCampaignNPCListItem(campaignId, comp.id, item.id)}
                onAddTrait={(name) => addCampaignNPCListItemTrait(campaignId, comp.id, item.id, name)}
                onUpdateTrait={(traitId, name, value) => updateCampaignNPCListItemTrait(campaignId, comp.id, item.id, traitId, name, value)}
                onRemoveTrait={(traitId) => removeCampaignNPCListItemTrait(campaignId, comp.id, item.id, traitId)}
                onMoveUp={itemIdx > 0 ? () => reorderCampaignNPCListItems(campaignId, comp.id, itemIdx, itemIdx - 1) : undefined}
                onMoveDown={itemIdx < comp.items.length - 1 ? () => reorderCampaignNPCListItems(campaignId, comp.id, itemIdx, itemIdx + 1) : undefined}
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
            addCampaignNPCListItem(campaignId, comp.id, name, desc, traits);
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
        onSave={(v, newName) => updateCampaignComponentText(campaignId, comp.id, newName || comp.name, v)}
      />
    </CollapsibleSection>
  );
});

// ── CampaignSheet ────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
  isStandalone?: boolean;
  schemeOverride?: ColorScheme;
}

const LIST_CONFIG: Record<string, { key: NamedListKey; label: string; accentColorIdx: number }> = {
  __locations: { key: 'locations', label: 'Locations', accentColorIdx: 1 },
  __scenes: { key: 'scenes', label: 'Scenes', accentColorIdx: 4 },
};

export default function CampaignSheet({ campaignId, isStandalone, schemeOverride }: Props) {
  const { colorScheme, sectionOrder } = useAppStore(
    useShallow((s) => {
      const camp = s.campaigns[campaignId];
      return {
        colorScheme: (camp?.colorScheme ?? DEFAULT_SCHEME) as ColorSchemeId,
        sectionOrder: camp?.sectionOrder ?? (camp
          ? ['__currentScene', '__npcs', '__locations', '__scenes', ...camp.additionalComponents.map((c) => c.id)]
          : []),
      };
    })
  );
  const isEditMode = useAppStore((s) => s.isEditMode);
  const addCampaignComponent = useAppStore((s) => s.addCampaignComponent);

  const scheme = schemeOverride ?? COLOR_SCHEMES[colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
  const total = sectionOrder.length;

  const [addingComp, setAddingComp] = useState(false);

  if (sectionOrder.length === 0 && !isEditMode) return null;

  return (
    <GlassCard scheme={scheme} style={styles.card}>
      {isStandalone && <CampaignNameHeader campaignId={campaignId} scheme={scheme} />}

      {sectionOrder.map((sectionId, idx) => {
        if (sectionId === '__currentScene') {
          return (
            <CurrentSceneSection
              key="__currentScene"
              campaignId={campaignId}
              scheme={scheme}
              idx={idx}
              total={total}
            />
          );
        }

        if (sectionId === '__npcs') {
          return (
            <BuiltinNPCSection
              key="__npcs"
              campaignId={campaignId}
              scheme={scheme}
              idx={idx}
              total={total}
            />
          );
        }

        const listDef = LIST_CONFIG[sectionId];
        if (listDef) {
          return (
            <BuiltinListSection
              key={sectionId}
              campaignId={campaignId}
              scheme={scheme}
              idx={idx}
              total={total}
              listKey={listDef.key}
              sectionId={sectionId}
              label={listDef.label}
              accentColor={scheme.levelColors[listDef.accentColorIdx]}
            />
          );
        }

        return (
          <CampComponentSection
            key={sectionId}
            campaignId={campaignId}
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
        onAdd={(type: ComponentType, name: string) => addCampaignComponent(campaignId, type, name)}
        scheme={scheme}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  nameInput: { flex: 1, minWidth: 0, fontSize: 22, fontWeight: '700', letterSpacing: 0.3, paddingVertical: 4 },
  colorBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, flexShrink: 0 },
  empty: { fontStyle: 'italic', fontSize: 13, paddingVertical: 8 },
  addBtn: { fontSize: 20, fontWeight: '700', lineHeight: 24, paddingHorizontal: 4 },
  addSectionBtn: { marginTop: 4, paddingVertical: 9, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', alignItems: 'center' },
  addSectionText: { fontSize: 13, fontWeight: '500' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
});
