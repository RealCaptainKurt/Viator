import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorScheme } from '../../constants/colorSchemes';

interface Props {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  confirmRemove?: boolean;
  scheme: ColorScheme;
}

export default function EditControls({ onMoveUp, onMoveDown, onRemove, confirmRemove, scheme }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onMoveUp}
        disabled={!onMoveUp}
        style={[styles.btn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons name="chevron-up" size={16} color={onMoveUp ? scheme.primary : scheme.textMuted} />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onMoveDown}
        disabled={!onMoveDown}
        style={[styles.btn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons name="chevron-down" size={16} color={onMoveDown ? scheme.primary : scheme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRemove}
        style={[styles.btn, { borderColor: scheme.destructive + '40', backgroundColor: scheme.destructive + '10' }]}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        {confirmRemove ? (
          <Ionicons name="checkmark" size={16} color={scheme.destructive} />
        ) : (
          <Ionicons name="close" size={16} color={scheme.destructive} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
