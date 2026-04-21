import React, { useState } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { TextListItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import GlassButton from './GlassButton';
import ModalOverlay from './ModalOverlay';
import EditControls from './EditControls';

interface Props {
  item: TextListItem;
  scheme: ColorScheme;
  onUpdate: (name: string, content: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function TextListItemRow({
  item,
  scheme,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { isEditMode } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const openEdit = () => {
    setDraft(item.content);
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(item.name, draft);
    setEditing(false);
  };

  return (
    <>
      <View style={[styles.card, { borderColor: scheme.surfaceBorder }]}>
        {/* Header row — always visible */}
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.75}
          style={styles.headerRow}
        >
          <Text style={[styles.arrow, { color: scheme.primary }]}>
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

        {/* Expanded body — content + edit icon */}
        {expanded && (
          <View style={styles.expandedBody}>
            <View style={styles.contentRow}>
              <TouchableOpacity onPress={openEdit} activeOpacity={0.75} style={{ flex: 1 }}>
                {item.content ? (
                  <Text style={[styles.content, { color: scheme.textSecondary }]}>{item.content}</Text>
                ) : (
                  <Text style={[styles.placeholder, { color: scheme.textMuted }]}>Tap to add content…</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={openEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.editBtn}>
                <Feather name="edit-2" size={13} color={scheme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Edit modal */}
      <ModalOverlay
        visible={editing}
        onClose={() => setEditing(false)}
        scheme={scheme}
        title={item.name}
        maxWidth={460}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          autoFocus
          textAlignVertical="top"
          style={[
            styles.input,
            {
              color: scheme.text,
              borderColor: scheme.surfaceBorder,
              backgroundColor: scheme.primaryMuted,
            },
          ]}
          placeholder="Tap to add content…"
          placeholderTextColor={scheme.textMuted}
          selectionColor={scheme.primary}
        />
        <View style={styles.actions}>
          <GlassButton label="Cancel" onPress={() => setEditing(false)} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
          <GlassButton label="Save" onPress={handleSave} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
  },
  placeholder: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  editBtn: {
    paddingTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 110,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
