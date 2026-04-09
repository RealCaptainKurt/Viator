import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import ModalOverlay from '../ui/ModalOverlay';
import GlassButton from '../ui/GlassButton';
import { COLOR_SCHEMES } from '../../constants/colorSchemes';
import { Campaign, AdditionalListComponent, AdditionalNumberComponent, CollapsedSections } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';
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

export default function CampaignSheet({ campaign, isStandalone, schemeOverride }: Props) {
  const scheme = schemeOverride ?? COLOR_SCHEMES[campaign.colorScheme];
  const {
    updateCampaignField,
    addCampaignListItem,
    updateCampaignListItem,
    removeCampaignListItem,
    updateCampaignComponentText,
    updateCampaignComponentNumber,
    addCampaignComponentListItem,
    updateCampaignComponentListItem,
    removeCampaignComponentListItem,
  } = useAppStore();

  const [collapsed, setCollapsed] = useState<CollapsedSections>({
    currentScene: false,
    npcs: true,
    locations: true,
    scenes: true,
  });
  const [adding, setAdding] = useState<AddingState>({ key: null });

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
    if (!isNaN(n)) updateCampaignComponentNumber(campaign.id, editingNumberId, n);
    setEditingNumberId(null);
  };

  const toggle = (key: string) =>
    setCollapsed((s) => ({ ...s, [key]: !s[key] }));

  const startAdding = (key: ListKey | string, isCustomList = false) => {
    setAdding({ key, isCustomList });
  };

  const stopAdding = () => setAdding({ key: null });

  const LISTS: { key: ListKey; label: string; accentColor?: string }[] = [
    { key: 'npcs', label: 'Characters', accentColor: scheme.levelColors[3] },
    { key: 'locations', label: 'Locations', accentColor: scheme.levelColors[1] },
    { key: 'scenes', label: 'Scenes', accentColor: scheme.levelColors[4] },
  ];

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

      {/* ── Current Scene (text) ────────────────── */}
      <CollapsibleSection
        title="Current Scene"
        scheme={scheme}
        collapsed={collapsed.currentScene ?? false}
        onToggle={() => toggle('currentScene')}
      >
        <TextContentRow
          content={campaign.currentScene}
          scheme={scheme}
          placeholder="Tap to describe the current scene..."
          title="Current Scene"
          onSave={(v) => updateCampaignField(campaign.id, 'currentScene', v)}
        />
      </CollapsibleSection>

      {/* ── Standard lists ──────────────────────── */}
      {LISTS.map(({ key, label, accentColor }) => (
        <CollapsibleSection
          key={key}
          title={label}
          scheme={scheme}
          collapsed={collapsed[key] ?? false}
          onToggle={() => toggle(key)}
          rightContent={
            <TouchableOpacity
              onPress={() =>
                adding.key === key ? stopAdding() : startAdding(key)
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
            </TouchableOpacity>
          }
        >
          {campaign[key].length === 0 ? (
            <Text style={[styles.empty, { color: scheme.textMuted }]}>
              Nothing here yet. Tap + to add.
            </Text>
          ) : null}

          {campaign[key].map((item) => (
            <NamedItemRow
              key={item.id}
              item={item}
              scheme={scheme}
              accentColor={accentColor}
              onUpdate={(name, description) =>
                updateCampaignListItem(campaign.id, key, item.id, name, description)
              }
              onRemove={() => removeCampaignListItem(campaign.id, key, item.id)}
            />
          ))}

          <AddItemRow
            visible={adding.key === key && !adding.isCustomList}
            scheme={scheme}
            title={`Add to ${label}`}
            onAdd={(name, description) => {
              addCampaignListItem(campaign.id, key, name, description);
              stopAdding();
            }}
            onCancel={stopAdding}
          />
        </CollapsibleSection>
      ))}

      {/* ── Additional Components ──────────────── */}
      {campaign.additionalComponents.map((comp) => {
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
                <TouchableOpacity
                  onPress={() =>
                    adding.key === comp.id ? stopAdding() : startAdding(comp.id, true)
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.addBtn, { color: scheme.primary }]}>+</Text>
                </TouchableOpacity>
              }
            >
              {listComp.items.length === 0 ? (
                <Text style={[styles.empty, { color: scheme.textMuted }]}>
                  Nothing here yet. Tap + to add.
                </Text>
              ) : null}
              {listComp.items.map((item) => (
                <NamedItemRow
                  key={item.id}
                  item={item}
                  scheme={scheme}
                  onUpdate={(name, description) =>
                    updateCampaignComponentListItem(campaign.id, comp.id, item.id, name, description)
                  }
                  onRemove={() => removeCampaignComponentListItem(campaign.id, comp.id, item.id)}
                />
              ))}
              <AddItemRow
                visible={adding.key === comp.id}
                scheme={scheme}
                title={`Add to ${comp.name}`}
                onAdd={(name, description) => {
                  addCampaignComponentListItem(campaign.id, comp.id, name, description);
                  stopAdding();
                }}
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
          >
            <TextContentRow
              content={(comp as { content: string }).content}
              scheme={scheme}
              placeholder={`Tap to add ${comp.name.toLowerCase()}...`}
              title={comp.name}
              onSave={(v) => updateCampaignComponentText(campaign.id, comp.id, comp.name, v)}
            />
          </CollapsibleSection>
        );
      })}

      {/* ── Number Component Edit Modal ─────────── */}
      <ModalOverlay
        visible={editingNumberId !== null}
        onClose={() => setEditingNumberId(null)}
        scheme={scheme}
        title={campaign.additionalComponents.find((c) => c.id === editingNumberId)?.name ?? ''}
      >
        <View style={styles.numModalRow}>
          <TouchableOpacity
            onPress={() => adjustNumber(-1)}
            style={[styles.numAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.numAdjustText, { color: scheme.destructive }]}>−</Text>
          </TouchableOpacity>
          <TextInput
            value={draftNumber}
            onChangeText={(v) => { if (v === '' || /^-?\d+$/.test(v)) setDraftNumber(v); }}
            keyboardType="number-pad"
            style={[styles.numModalInput, { color: scheme.primary, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
            selectionColor={scheme.primary}
            selectTextOnFocus
            autoFocus
          />
          <TouchableOpacity
            onPress={() => adjustNumber(1)}
            style={[styles.numAdjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.numAdjustText, { color: scheme.primary }]}>+</Text>
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
  numModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  numAdjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numAdjustText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  numModalInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
