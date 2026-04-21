import React, { useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NamedItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassInput from './GlassInput';
import GlassButton from './GlassButton';
import ModalOverlay from './ModalOverlay';
import EditControls from './EditControls';

interface Props {
  item: NamedItem;
  scheme: ColorScheme;
  onUpdate: (name: string, description: string) => void;
  onRemove: () => void;
  accentColor?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function NamedItemRow({
  item,
  scheme,
  onUpdate,
  onRemove,
  accentColor,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { isEditMode } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDesc, setEditDesc] = useState(item.description);

  const arrowColor = accentColor ?? scheme.primary;

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate(editName.trim(), editDesc.trim());
    setEditing(false);
  };

  const openEdit = () => {
    setEditName(item.name);
    setEditDesc(item.description);
    setEditing(true);
  };

  return (
    <>
      <View style={[styles.card, { borderColor: scheme.surfaceBorder }]}>
        {/* Header row — always visible */}
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          onLongPress={openEdit}
          activeOpacity={0.75}
          style={styles.headerRow}
        >
          <Text style={[styles.arrow, { color: arrowColor }]}>
            {expanded ? '⌄' : '›'}
          </Text>
          <Text style={[styles.name, { color: scheme.text, flex: 1 }]}>{item.name}</Text>
          
          {isEditMode && (
            <EditControls
              scheme={scheme}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRemove={onRemove}
            />
          )}
        </TouchableOpacity>

        {/* Expanded body — description + edit icon */}
        {expanded && (
          <View style={styles.expandedBody}>
            <View style={styles.descRow}>
              <Text style={[
                styles.desc,
                { flex: 1, color: item.description ? scheme.textSecondary : scheme.textMuted,
                  fontStyle: item.description ? 'normal' : 'italic' },
              ]}>
                {item.description || 'No description — tap to edit.'}
              </Text>
              <TouchableOpacity onPress={openEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.editBtn}>
                <Feather name="edit-2" size={13} color={scheme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <ModalOverlay
        visible={editing}
        onClose={() => setEditing(false)}
        scheme={scheme}
      >
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
          containerStyle={{ marginBottom: 20 }}
        />
        <View style={styles.actions}>
          <GlassButton
            label="Remove"
            onPress={() => { setEditing(false); setTimeout(onRemove, 200); }}
            scheme={scheme}
            variant="destructive"
            small
            style={{ flex: 1 }}
          />
          <GlassButton
            label="Cancel"
            onPress={() => setEditing(false)}
            scheme={scheme}
            variant="ghost"
            small
            style={{ flex: 1 }}
          />
          <GlassButton
            label="Save"
            onPress={handleSave}
            scheme={scheme}
            variant="primary"
            small
            style={{ flex: 1 }}
            disabled={!editName.trim()}
          />
        </View>
      </ModalOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
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
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  editBtn: {
    paddingTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
