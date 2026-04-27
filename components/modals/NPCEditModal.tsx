import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NPCTrait } from '../../types';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import ModalOverlay from './ModalOverlay';
import NPCTraitList from '../ui/NPCTraitList';

interface Props {
  visible: boolean;
  scheme: ColorScheme;
  /** Title shown in the modal header, e.g. "Edit Aldric" or "Add to NPC List" */
  title: string;
  initialName?: string;
  initialDesc?: string;
  traits?: NPCTrait[];
  /** When false the name input is hidden (e.g. standalone NPC whose name lives in the section header) */
  showNameInput?: boolean;
  /** When false the traits section is hidden (e.g. when adding a new NPC) */
  showTraits?: boolean;
  /** When true, the modal manages traits locally until Confirm is pressed */
  isAdding?: boolean;
  onConfirm: (name: string, desc: string, traits?: NPCTrait[]) => void;
  onCancel: () => void;
  onAddTrait: (name: string) => void;
  onUpdateTrait: (traitId: string, name: string, value: number) => void;
  onRemoveTrait: (traitId: string) => void;
}

export default function NPCEditModal({
  visible,
  scheme,
  title,
  initialName = '',
  initialDesc = '',
  traits = [],
  showNameInput = true,
  showTraits = true,
  isAdding = false,
  onConfirm,
  onCancel,
  onAddTrait,
  onUpdateTrait,
  onRemoveTrait,
}: Props) {
  const [draftName, setDraftName] = useState(initialName);
  const [draftDesc, setDraftDesc] = useState(initialDesc);
  const [localTraits, setLocalTraits] = useState<NPCTrait[]>([]);
  const [newTraitName, setNewTraitName] = useState('');

  useEffect(() => {
    if (visible) {
      setDraftName(initialName);
      setDraftDesc(initialDesc);
      setLocalTraits([]);
      setNewTraitName('');
    }
  }, [visible, initialName, initialDesc]);

  const handleConfirm = () => {
    onConfirm(draftName.trim(), draftDesc.trim(), isAdding ? localTraits : undefined);
  };

  const handleAddTrait = () => {
    if (!newTraitName.trim()) return;
    if (isAdding) {
      const newTrait: NPCTrait = { id: `temp-${Date.now()}`, name: newTraitName.trim(), value: 0 };
      setLocalTraits([...localTraits, newTrait]);
    } else {
      onAddTrait(newTraitName.trim());
    }
    setNewTraitName('');
  };

  const handleUpdateTrait = (traitId: string, name: string, value: number) => {
    if (isAdding) {
      setLocalTraits(localTraits.map(t => t.id === traitId ? { ...t, name, value } : t));
    } else {
      onUpdateTrait(traitId, name, value);
    }
  };

  const handleRemoveTrait = (traitId: string) => {
    if (isAdding) {
      setLocalTraits(localTraits.filter(t => t.id !== traitId));
    } else {
      onRemoveTrait(traitId);
    }
  };

  const displayedTraits = isAdding ? localTraits : traits;

  const confirmDisabled = showNameInput && !draftName.trim();

  return (
    <ModalOverlay
      visible={visible}
      onClose={onCancel}
      scheme={scheme}
      title={title}
      maxWidth={460}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        {showNameInput && (
          <GlassInput
            scheme={scheme}
            label="Name"
            value={draftName}
            onChangeText={setDraftName}
            containerStyle={{ marginBottom: 12 }}
            autoFocus
          />
        )}

        {/* Description */}
        <GlassInput
          scheme={scheme}
          label="Description"
          value={draftDesc}
          onChangeText={setDraftDesc}
          multiline
          minHeight={80}
          containerStyle={{ marginBottom: 16 }}
          autoFocus={!showNameInput}
        />

        {/* Traits divider */}
        {showTraits && (
          <>
            <View style={[styles.divider, { backgroundColor: scheme.surfaceBorder }]} />
            <Text style={[styles.sectionLabel, { color: scheme.textSecondary }]}>TRAITS</Text>

            {/* Existing traits */}
            <NPCTraitList
              traits={displayedTraits}
              scheme={scheme}
              onUpdateTrait={handleUpdateTrait}
              onRemoveTrait={handleRemoveTrait}
            />

            {/* Add trait inline */}
            <View style={styles.addTraitRow}>
              <TextInput
                value={newTraitName}
                onChangeText={setNewTraitName}
                placeholder="New trait name..."
                placeholderTextColor={scheme.textMuted}
                style={[
                  styles.addTraitInput,
                  {
                    color: scheme.text,
                    borderColor: scheme.surfaceBorder,
                    backgroundColor: scheme.surface,
                  },
                ]}
                onSubmitEditing={handleAddTrait}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddTrait}
                disabled={!newTraitName.trim()}
                style={[
                  styles.addTraitBtn,
                  {
                    backgroundColor: newTraitName.trim() ? scheme.primaryMuted : scheme.surface,
                    borderColor: scheme.surfaceBorder,
                  },
                ]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="add" size={18} color={newTraitName.trim() ? '#fff' : scheme.textMuted} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={onCancel} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton
          label="Confirm"
          onPress={handleConfirm}
          scheme={scheme}
          variant="primary"
          small
          style={{ flex: 1 }}
          disabled={confirmDisabled}
        />
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  addTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  addTraitInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  addTraitBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
