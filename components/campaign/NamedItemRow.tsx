import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NamedItem } from '../../types';
import GlassInput from '../ui/GlassInput';
import GlassButton from '../ui/GlassButton';
import ModalOverlay from '../ui/ModalOverlay';

interface Props {
  item: NamedItem;
  scheme: ColorScheme;
  onUpdate: (name: string, description: string) => void;
  onRemove: () => void;
  accentColor?: string;
}

export default function NamedItemRow({
  item,
  scheme,
  onUpdate,
  onRemove,
  accentColor,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDesc, setEditDesc] = useState(item.description);

  const dot = accentColor ?? scheme.primary;

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate(editName.trim(), editDesc.trim());
    setEditing(false);
  };

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
        style={[styles.row, { borderBottomColor: scheme.surfaceBorder }]}
      >
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: scheme.text }]}>{item.name}</Text>
          {expanded && item.description ? (
            <Text style={[styles.desc, { color: scheme.textSecondary }]}>
              {item.description}
            </Text>
          ) : null}
        </View>
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
              setTimeout(() => {
                Alert.alert('Remove', `Remove "${item.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: onRemove },
                ]);
              }, 200);
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
    borderBottomWidth: 1,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
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
  editIcon: {
    fontSize: 16,
    paddingTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
