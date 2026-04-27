import React, { memo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NPCItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import EditControls from './EditControls';
import NPCEditModal from '../modals/NPCEditModal';
import NPCTraitList from './NPCTraitList';

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

function NPCRow({
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

  return (
    <>
      {/* NPC card */}
      <View style={[styles.npcContainer, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}>
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          onLongPress={() => setEditing(true)}
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
              <Text
                style={[
                  styles.desc,
                  {
                    flex: 1,
                    color: item.description ? scheme.textSecondary : scheme.textMuted,
                    fontStyle: item.description ? 'normal' : 'italic',
                  },
                ]}
              >
                {item.description || 'No description — tap to edit.'}
              </Text>
              <TouchableOpacity
                onPress={() => setEditing(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.descEditBtn}
              >
                <Feather name="edit-2" size={13} color={scheme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Traits */}
            {item.traits.length > 0 && (
              <>
                <View style={[styles.sectionDivider, { backgroundColor: scheme.surfaceBorder }]} />
                <NPCTraitList
                  traits={item.traits}
                  scheme={scheme}
                  onUpdateTrait={onUpdateTrait}
                  onRemoveTrait={onRemoveTrait}
                />
              </>
            )}
          </View>
        )}
      </View>

      {/* Edit modal */}
      <NPCEditModal
        visible={editing}
        scheme={scheme}
        title={`Edit ${item.name}`}
        initialName={item.name}
        initialDesc={item.description}
        traits={item.traits}
        showNameInput={true}
        onConfirm={(name, desc) => { onUpdate(name, desc); setEditing(false); }}
        onCancel={() => setEditing(false)}
        onAddTrait={onAddTrait}
        onUpdateTrait={onUpdateTrait}
        onRemoveTrait={onRemoveTrait}
      />
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
});

export default memo(NPCRow);
