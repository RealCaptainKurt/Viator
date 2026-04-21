import React, { useState, useEffect } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NPCItem, NPCTrait } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassInput from './GlassInput';
import GlassButton from './GlassButton';
import ModalOverlay from './ModalOverlay';
import NumberEditModal from './NumberEditModal';
import EditControls from './EditControls';

interface Props {
  item: NPCItem;
  scheme: ColorScheme;
  onUpdate: (name: string, description: string) => void;
  onRemove: () => void;
  onAddTrait: (name: string) => void;
  onUpdateTrait: (traitId: string, name: string, value: number) => void;
  onRemoveTrait: (traitId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function NPCRow({
  item,
  scheme,
  onUpdate,
  onRemove,
  onAddTrait,
  onUpdateTrait,
  onRemoveTrait,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { isEditMode } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDesc, setEditDesc] = useState(item.description);

  // New trait being added inside the edit modal
  const [newTraitName, setNewTraitName] = useState('');

  // Editing a trait value (number stepper modal)
  const [editingTrait, setEditingTrait] = useState<NPCTrait | null>(null);

  // Sync local edit state when the item changes (e.g. after trait add/remove)
  useEffect(() => {
    if (editing) {
      setEditName(item.name);
      setEditDesc(item.description);
    }
  }, [item.name, item.description]);

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate(editName.trim(), editDesc.trim());
    setEditing(false);
    setNewTraitName('');
  };

  const openEdit = () => {
    setEditName(item.name);
    setEditDesc(item.description);
    setNewTraitName('');
    setEditing(true);
  };

  const closeEdit = () => {
    setEditing(false);
    setNewTraitName('');
  };

  const handleAddTraitInModal = () => {
    if (!newTraitName.trim()) return;
    onAddTrait(newTraitName.trim());
    setNewTraitName('');
  };

  return (
    <>
      {/* NPC container with border for visual distinction */}
      <View style={[styles.npcContainer, { borderColor: scheme.surfaceBorder }]}>
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          onLongPress={openEdit}
          activeOpacity={0.75}
          style={styles.headerRow}
        >
          <Text style={[styles.arrow, { color: scheme.primary }]}>
            {expanded ? '⌄' : '›'}
          </Text>
          <View style={styles.headerContent}>
            <Text style={[styles.name, { color: scheme.text }]}>{item.name}</Text>
          </View>
          
          {isEditMode && (
            <EditControls
              scheme={scheme}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRemove={onRemove}
            />
          )}
        </TouchableOpacity>

        {expanded && (
          <View style={styles.expandedBody}>
            {/* Description + edit icon */}
            <View style={styles.descRow}>
              <Text style={[
                styles.desc,
                { flex: 1, color: item.description ? scheme.textSecondary : scheme.textMuted,
                  fontStyle: item.description ? 'normal' : 'italic' },
              ]}>
                {item.description || 'No description — tap to edit.'}
              </Text>
              <TouchableOpacity onPress={openEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.descEditBtn}>
                <Feather name="edit-2" size={13} color={scheme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Traits section with divider */}
            {item.traits.length > 0 && (
              <>
                <View style={[styles.sectionDivider, { backgroundColor: scheme.surfaceBorder }]} />
                <View style={styles.traitsContainer}>
                  {item.traits.map((trait) => (
                    <View key={trait.id} style={styles.traitRow}>
                      <Text style={[styles.traitName, { color: scheme.textSecondary }]}>{trait.name}</Text>
                      <View style={styles.traitActions}>
                        <TouchableOpacity
                          onPress={() => setEditingTrait(trait)}
                          hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
                          style={[styles.traitValueBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
                        >
                          <Text style={[styles.traitValue, { color: scheme.primary }]}>{trait.value}</Text>
                        </TouchableOpacity>
                        {isEditMode && (
                          <EditControls
                            scheme={scheme}
                            onRemove={() => onRemoveTrait(trait.id)}
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* ── NPC Edit Modal ──────────────────────────── */}
      <ModalOverlay
        visible={editing}
        onClose={closeEdit}
        scheme={scheme}
        maxWidth={460}
      >
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name + Description */}
          <GlassInput
            scheme={scheme}
            label="Name"
            value={editName}
            onChangeText={setEditName}
            containerStyle={{ marginBottom: 12 }}
          />
          <GlassInput
            scheme={scheme}
            label="Description"
            value={editDesc}
            onChangeText={setEditDesc}
            multiline
            minHeight={80}
            containerStyle={{ marginBottom: 16 }}
          />

          {/* Traits Section */}
          <View style={[styles.modalDivider, { backgroundColor: scheme.surfaceBorder }]} />
          <Text style={[styles.modalSectionLabel, { color: scheme.textSecondary }]}>TRAITS</Text>

          {item.traits.length > 0 && (
            <View style={styles.modalTraitsList}>
              {item.traits.map((trait) => (
                <View key={trait.id} style={[styles.modalTraitRow, { borderColor: scheme.surfaceBorder }]}>
                  <Text style={[styles.modalTraitName, { color: scheme.text }]}>{trait.name}</Text>
                  <TouchableOpacity
                    onPress={() => setEditingTrait(trait)}
                    style={[styles.modalTraitValueBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
                    hitSlop={{ top: 4, bottom: 4, left: 6, right: 6 }}
                  >
                    <Text style={[styles.modalTraitValue, { color: scheme.primary }]}>{trait.value}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onRemoveTrait(trait.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close-circle" size={18} color={scheme.destructive} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Trait inline */}
          <View style={styles.addTraitRow}>
            <TextInput
              value={newTraitName}
              onChangeText={setNewTraitName}
              placeholder="New trait name..."
              placeholderTextColor={scheme.textMuted}
              style={[styles.addTraitInput, { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
              onSubmitEditing={handleAddTraitInModal}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddTraitInModal}
              disabled={!newTraitName.trim()}
              style={[
                styles.addTraitConfirmBtn,
                { backgroundColor: newTraitName.trim() ? scheme.primary : scheme.surfaceBorder },
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="add" size={18} color={newTraitName.trim() ? '#fff' : scheme.textMuted} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <GlassButton label="Cancel" onPress={closeEdit} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Save" onPress={handleSave} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!editName.trim()} />
        </View>
      </ModalOverlay>

      {/* Edit trait value */}
      {editingTrait && (
        <NumberEditModal
          visible={!!editingTrait}
          title={editingTrait.name}
          initialValue={editingTrait.value}
          scheme={scheme}
          onSave={(value) => {
            onUpdateTrait(editingTrait.id, editingTrait.name, value);
            setEditingTrait(null);
          }}
          onClose={() => setEditingTrait(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  npcContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 10,
  },
  headerContent: {
    flex: 1,
  },
  arrow: {
    fontSize: 14,
    fontWeight: '700',
    width: 14,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  descPreview: {
    fontSize: 12,
    marginTop: 1,
  },
  expandedBody: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    paddingTop: 2,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  descEditBtn: {
    paddingTop: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  traitsContainer: {
    gap: 6,
  },
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitName: {
    flex: 1,
    fontSize: 13,
  },
  traitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  traitValueBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
  },
  traitValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  moveButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  moveArrow: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  // ── Edit Modal Styles ──
  modalScroll: {
    maxHeight: 400,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  modalTraitsList: {
    gap: 6,
    marginBottom: 8,
  },
  modalTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  modalTraitName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  modalTraitValueBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  modalTraitValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  addTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addTraitInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },
  addTraitConfirmBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
