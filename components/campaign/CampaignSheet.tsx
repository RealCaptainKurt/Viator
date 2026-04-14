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
import NumberEditModal from '../ui/NumberEditModal';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { Campaign, AdditionalListComponent, AdditionalNumberComponent, AdditionalTextComponent, CollapsedSections, NamedItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
import GlassHighlight from '../ui/GlassHighlight';
import GlassButton from '../ui/GlassButton';
import CollapsibleSection from '../ui/CollapsibleSection';
import TextContentRow from '../ui/TextContentRow';
import NamedItemRow from './NamedItemRow';
import AddItemRow from './AddItemRow';

type ListKey = 'npcs' | 'locations' | 'scenes';

interface Props {
  campaign: Campaign;
  isStandalone?: boolean;
  schemeOverride?: import('../../constants/colorSchemes').ColorScheme;
}

type AddingState = {
  key: ListKey | string | null;
  isCustomList?: boolean;
};

const LIST_CONFIG: Record<string, { key: ListKey; label: string; accentColorIdx: number }> = {
  __npcs:      { key: 'npcs',      label: 'Characters', accentColorIdx: 3 },
  __locations: { key: 'locations', label: 'Locations',  accentColorIdx: 1 },
  __scenes:    { key: 'scenes',    label: 'Scenes',     accentColorIdx: 4 },
};

export default function CampaignSheet({ campaign, isStandalone, schemeOverride }: Props) {
  const scheme = schemeOverride ?? COLOR_SCHEMES[campaign.colorScheme];
  const {
    updateCampaignField,
    addCampaignListItem,
    updateCampaignListItem,
    removeCampaignListItem,
    reorderCampaignListItems,
    updateCampaignComponentText,
    updateCampaignComponentNumber,
    addCampaignComponentListItem,
    updateCampaignComponentListItem,
    removeCampaignComponentListItem,
    reorderCampaignComponentListItems,
    reorderCampaignSection,
    removeCampaignSection,
    addCampaignComponent,
    isEditMode,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    currentScene: false,
    __npcs: true,
    __locations: true,
    __scenes: true,
  });
  const [adding, setAdding] = useState<AddingState>({ key: null });

  const [editingNumber, setEditingNumber] = useState<AdditionalNumberComponent | null>(null);

  const [addingComp, setAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<'text' | 'list'>('text');

  const toggle = (key: string) =>
    setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const startAdding = (key: ListKey | string, isCustomList = false) => {
    setAdding({ key, isCustomList });
  };

  const stopAdding = () => setAdding({ key: null });

  const [confirmSectionId, setConfirmSectionId] = useState<string | null>(null);

  const handleRemoveSection = (sectionId: string) => {
    if (confirmSectionId === sectionId) {
      removeCampaignSection(campaign.id, sectionId);
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
    addCampaignComponent(campaign.id, newCompType, newCompName.trim());
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
                  placeholder="Section name (e.g. Factions, Notes)"
                  placeholderTextColor={scheme.textMuted}
                  style={[
                    styles.modalInput,
                    { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted },
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
                      <Text style={[styles.typeBtnText, { color: newCompType === t ? scheme.primary : scheme.textSecondary }]}>
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

  const sectionOrder = campaign.sectionOrder ?? [
    '__currentScene', '__npcs', '__locations', '__scenes',
    ...campaign.additionalComponents.map((c) => c.id),
  ];

  // Hide the whole card when no sections remain and not editing
  if (sectionOrder.length === 0 && !isEditMode) return null;

  return (
    <GlassCard scheme={scheme} style={styles.card}>
      {/* Campaign name (standalone only) */}
      {isStandalone && (
        <View style={styles.nameRow}>
          <TextInput
            value={campaign.name}
            onChangeText={(v) => updateCampaignField(campaign.id, 'name', v)}
            style={[styles.nameInput, { color: scheme.text }]}
            placeholder="Campaign Name"
            placeholderTextColor={scheme.textMuted}
            selectionColor={scheme.primary}
          />
        </View>
      )}

      {/* ── Unified Section Rendering ─────────────── */}
      {sectionOrder.map((sectionId, idx) => {
        const totalSections = sectionOrder.length;
        const editControls = isEditMode ? (
          <View style={styles.editControls}>
            <TouchableOpacity
              onPress={() => reorderCampaignSection(campaign.id, idx, idx - 1)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              disabled={idx === 0}
            >
              <Text style={[styles.reorderArrow, { color: idx === 0 ? scheme.textMuted : scheme.primary }]}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => reorderCampaignSection(campaign.id, idx, idx + 1)}
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

        // ── Current Scene ──
        if (sectionId === '__currentScene') {
          return (
            <CollapsibleSection
              key="__currentScene"
              title="Current Scene"
              scheme={scheme}
              collapsed={collapsed.currentScene ?? false}
              onToggle={() => toggle('currentScene')}
              rightContent={editControls}
            >
              <TextContentRow
                content={campaign.currentScene}
                scheme={scheme}
                placeholder="Tap to describe the current scene..."
                title="Current Scene"
                onSave={(v) => updateCampaignField(campaign.id, 'currentScene', v)}
              />
            </CollapsibleSection>
          );
        }

        // ── Standard Lists (npcs / locations / scenes) ──
        const listDef = LIST_CONFIG[sectionId];
        if (listDef) {
          const { key, label, accentColorIdx } = listDef;
          const accentColor = scheme.levelColors[accentColorIdx];
          return (
            <CollapsibleSection
              key={sectionId}
              title={label}
              scheme={scheme}
              collapsed={collapsed[sectionId] ?? true}
              onToggle={() => toggle(sectionId)}
              rightContent={
                isEditMode ? editControls : (
                  <TouchableOpacity
                    onPress={() => adding.key === key ? stopAdding() : startAdding(key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                )
              }
            >
              {campaign[key].length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet. Tap + to add.</Text>
              ) : null}
              {campaign[key].map((item: NamedItem, itemIdx: number) => (
                <NamedItemRow
                  key={item.id}
                  item={item}
                  scheme={scheme}
                  accentColor={accentColor}
                  onUpdate={(name, description) => updateCampaignListItem(campaign.id, key, item.id, name, description)}
                  onRemove={() => removeCampaignListItem(campaign.id, key, item.id)}
                  onMoveUp={itemIdx > 0 ? () => reorderCampaignListItems(campaign.id, key, itemIdx, itemIdx - 1) : undefined}
                  onMoveDown={itemIdx < campaign[key].length - 1 ? () => reorderCampaignListItems(campaign.id, key, itemIdx, itemIdx + 1) : undefined}
                />
              ))}
              <AddItemRow
                visible={adding.key === key && !adding.isCustomList}
                scheme={scheme}
                title={`Add to ${label}`}
                onAdd={(name, description) => { addCampaignListItem(campaign.id, key, name, description); stopAdding(); }}
                onCancel={stopAdding}
              />
            </CollapsibleSection>
          );
        }

        // ── Custom Components ──
        const comp = campaign.additionalComponents.find((c) => c.id === sectionId);
        if (!comp) return null;

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

        if (comp.type === 'list') {
          const listComp = comp as AdditionalListComponent;
          return (
            <CollapsibleSection
              key={comp.id}
              title={comp.name}
              scheme={scheme}
              collapsed={collapsed[comp.id] ?? false}
              onToggle={() => toggle(comp.id)}
              rightContent={
                isEditMode ? editControls : (
                  <TouchableOpacity
                    onPress={() => adding.key === comp.id ? stopAdding() : startAdding(comp.id, true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                  </TouchableOpacity>
                )
              }
            >
              {listComp.items.length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet. Tap + to add.</Text>
              ) : null}
              {listComp.items.map((item, itemIdx) => (
                <NamedItemRow
                  key={item.id}
                  item={item}
                  scheme={scheme}
                  onUpdate={(name, description) => updateCampaignComponentListItem(campaign.id, comp.id, item.id, name, description)}
                  onRemove={() => removeCampaignComponentListItem(campaign.id, comp.id, item.id)}
                  onMoveUp={itemIdx > 0 ? () => reorderCampaignComponentListItems(campaign.id, comp.id, itemIdx, itemIdx - 1) : undefined}
                  onMoveDown={itemIdx < listComp.items.length - 1 ? () => reorderCampaignComponentListItems(campaign.id, comp.id, itemIdx, itemIdx + 1) : undefined}
                />
              ))}
              <AddItemRow
                visible={adding.key === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                onAdd={(name, description) => { addCampaignComponentListItem(campaign.id, comp.id, name, description); stopAdding(); }}
                onCancel={stopAdding}
              />
            </CollapsibleSection>
          );
        }

        // Text component
        return (
          <CollapsibleSection
            key={comp.id}
            title={comp.name}
            scheme={scheme}
            collapsed={collapsed[comp.id] ?? false}
            onToggle={() => toggle(comp.id)}
            rightContent={editControls}
          >
            <TextContentRow
              content={(comp as AdditionalTextComponent).content}
              scheme={scheme}
              placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
              title={comp.name}
              onSave={(v) => updateCampaignComponentText(campaign.id, comp.id, comp.name, v)}
            />
          </CollapsibleSection>
        );
      })}

      {/* ── Add Section button (Edit Mode) ──────────── */}
      {isEditMode && (
        <TouchableOpacity
          onPress={() => setAddingComp(true)}
          style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <Text style={[styles.addSectionText, { color: scheme.textSecondary }]}>+ Add Section</Text>
        </TouchableOpacity>
      )}

      {/* ── Number Component Edit Modal ─────────── */}
      <NumberEditModal
        visible={editingNumber !== null}
        title={editingNumber?.name ?? ''}
        initialValue={editingNumber?.value ?? 0}
        scheme={scheme}
        onSave={(n) => { if (editingNumber) updateCampaignComponentNumber(campaign.id, editingNumber.id, n); }}
        onClose={() => setEditingNumber(null)}
      />

      {/* ── Add Section Modal ───────────────────── */}
      {renderAddSectionModal()}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  nameRow: {
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingVertical: 4,
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
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
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
