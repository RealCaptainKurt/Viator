import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from '../ui/GlassButton';
import ModalOverlay from './ModalOverlay';

interface Props {
  visible: boolean;
  title: string;
  initialValue: number;
  initialName?: string;
  allowNameEdit?: boolean;
  scheme: ColorScheme;
  onSave: (value: number, name?: string) => void;
  onClose: () => void;
}

export default function NumberEditModal({
  visible,
  title,
  initialValue,
  initialName = '',
  allowNameEdit = true,
  scheme,
  onSave,
  onClose,
}: Props) {
  const [draftValue, setDraftValue] = useState(String(initialValue));
  const [draftName, setDraftName] = useState(initialName);

  useEffect(() => {
    if (visible) {
      setDraftValue(String(initialValue));
      setDraftName(initialName);
    }
  }, [visible, initialValue, initialName]);

  const adjust = (delta: number) =>
    setDraftValue((v) => String((parseInt(v, 10) || 0) + delta));

  const handleSave = () => {
    const n = parseInt(draftValue, 10);
    if (!isNaN(n)) onSave(n, allowNameEdit ? draftName.trim() : undefined);
    onClose();
  };

  return (
    <ModalOverlay
      visible={visible}
      onClose={onClose}
      scheme={scheme}
      title={title}
    >
      {allowNameEdit && (
        <TextInput
          value={draftName}
          onChangeText={setDraftName}
          placeholder="Name"
          placeholderTextColor={scheme.textMuted}
          style={[
            styles.nameInput,
            { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted },
          ]}
          selectionColor={scheme.primary}
          autoFocus
        />
      )}

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => adjust(-1)}
          style={[styles.adjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.adjustText, { color: scheme.destructive }]}>−</Text>
        </TouchableOpacity>

        <TextInput
          value={draftValue}
          onChangeText={(v) => { if (v === '' || /^-?\d+$/.test(v)) setDraftValue(v); }}
          keyboardType="number-pad"
          style={[styles.input, { color: scheme.primary, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
          selectionColor={scheme.primary}
          selectTextOnFocus
          autoFocus={!allowNameEdit}
        />

        <TouchableOpacity
          onPress={() => adjust(1)}
          style={[styles.adjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.adjustText, { color: scheme.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={onClose} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton
          label="Confirm"
          onPress={handleSave}
          scheme={scheme}
          variant="primary"
          small
          style={{ flex: 1 }}
          disabled={allowNameEdit && !draftName.trim()}
        />
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
