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
import GlassInput from '../ui/GlassInput';
import GlassButton from '../ui/GlassButton';
import ModalOverlay from '../ui/ModalOverlay';

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

  const handleRemove = () => {
    onRemove();
  };

  const showMoveButtons = onMoveUp !== undefined || onMoveDown !== undefined;

  return (
    <>
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        onLongPress={() => {
          setEditName(item.name);
          setEditDesc(item.description);
          setEditing(true);
        }}
        activeOpacity={0.75}
        style={styles.row}
      >
        <Text style={[styles.arrow, { color: arrowColor }]}>
          {expanded ? '⌄' : '›'}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: scheme.text }]}>{item.name}</Text>
          {expanded && (
            <Text style={[
              styles.desc,
              { color: item.description ? scheme.textSecondary : scheme.textMuted,
                fontStyle: item.description ? 'normal' : 'italic' },
            ]}>
              {item.description || 'No description, tap to edit.'}
            </Text>
          )}
        </View>
        {showMoveButtons && (
          <View style={styles.moveButtons}>
            <TouchableOpacity
              onPress={onMoveUp}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Text style={[styles.moveArrow, { color: onMoveUp ? scheme.primary : scheme.textMuted }]}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onMoveDown}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              <Text style={[styles.moveArrow, { color: onMoveDown ? scheme.primary : scheme.textMuted }]}>↓</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            setEditName(item.name);
            setEditDesc(item.description);
            setEditing(true);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="edit-2" size={14} color={scheme.textMuted} style={{ paddingTop: 2 }} />
        </TouchableOpacity>
        {isEditMode && (
          <TouchableOpacity
            onPress={handleRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={scheme.destructive} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

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
            onPress={() => {
              setEditing(false);
              setTimeout(onRemove, 200);
            }}
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingLeft: 4,
    gap: 10,
  },
  arrow: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    width: 14,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
