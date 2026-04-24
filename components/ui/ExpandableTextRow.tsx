import React, { memo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { useAppStore } from '../../store/appStore';
import TextEditModal from '../modals/TextEditModal';
import EditControls from './EditControls';

interface Props {
  name: string;
  content: string;
  scheme: ColorScheme;
  onUpdate: (name: string, content: string) => void;
  onRemove: () => void;
  accentColor?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  placeholder?: string;
}

function ExpandableTextRow({
  name,
  content,
  scheme,
  onUpdate,
  onRemove,
  accentColor,
  onMoveUp,
  onMoveDown,
  placeholder = 'Tap to edit...',
}: Props) {
  const { isEditMode } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editContent, setEditContent] = useState(content);

  const arrowColor = accentColor ?? scheme.primary;

  const handleSave = (updatedName: string, updatedContent: string) => {
    if (!updatedName.trim()) return;
    onUpdate(updatedName.trim(), updatedContent.trim());
    setEditing(false);
  };

  const openEdit = () => {
    setEditName(name);
    setEditContent(content);
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
          <Text style={[styles.name, { color: scheme.text, flex: 1 }]}>{name}</Text>
          
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
                <Text style={[
                  styles.content,
                  { color: content ? scheme.textSecondary : scheme.textMuted,
                    fontStyle: content ? 'normal' : 'italic' },
                ]}>
                  {content || placeholder}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.editBtn}>
                <Feather name="edit-2" size={13} color={scheme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TextEditModal
        visible={editing}
        scheme={scheme}
        title={`Edit ${name}`}
        initialName={editName}
        initialDesc={editContent}
        namePlaceholder="Name"
        descPlaceholder={placeholder}
        onConfirm={handleSave}
        onCancel={() => setEditing(false)}
      />
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
  editBtn: {
    paddingTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default memo(ExpandableTextRow);
