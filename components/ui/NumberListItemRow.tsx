import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { NumberListItem } from '../../types';
import { useAppStore } from '../../store/appStore';
import NumberEditModal from './NumberEditModal';
import EditControls from './EditControls';

interface Props {
  item: NumberListItem;
  scheme: ColorScheme;
  onUpdateValue: (value: number) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function NumberListItemRow({
  item,
  scheme,
  onUpdateValue,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const { isEditMode } = useAppStore();
  const [editing, setEditing] = useState(false);

  return (
    <>
      <View style={styles.row}>
        {/* Name pill — takes remaining space */}
        <View style={[styles.namePill, { borderColor: scheme.surfaceBorder }]}>
          <Text style={[styles.name, { color: scheme.textSecondary }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        {/* Value pill */}
        <TouchableOpacity
          onPress={() => setEditing(true)}
          style={[styles.valuePill, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
          hitSlop={{ top: 4, bottom: 4, left: 6, right: 6 }}
        >
          <Text style={[styles.value, { color: scheme.primary }]}>{item.value}</Text>
        </TouchableOpacity>

        {/* Edit controls (right edge) */}
        {isEditMode && (
          <EditControls
            scheme={scheme}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onRemove={onRemove}
          />
        )}
      </View>

      <NumberEditModal
        visible={editing}
        title={item.name}
        initialValue={item.value}
        scheme={scheme}
        onSave={(n) => { onUpdateValue(n); setEditing(false); }}
        onClose={() => setEditing(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  namePill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  valuePill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});
