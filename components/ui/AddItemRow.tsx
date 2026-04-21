import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from './GlassButton';
import ModalOverlay from './ModalOverlay';

interface Props {
  visible: boolean;
  scheme: ColorScheme;
  title?: string;
  namePlaceholder?: string;
  descPlaceholder?: string;
  onAdd: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function AddItemRow({
  visible,
  scheme,
  title,
  namePlaceholder = 'Name',
  descPlaceholder = 'Description (optional)',
  onAdd,
  onCancel,
}: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (!visible) {
      setName('');
      setDesc('');
    }
  }, [visible]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), desc.trim());
  };

  return (
    <ModalOverlay
      visible={visible}
      onClose={onCancel}
      scheme={scheme}
      title={title}
      maxWidth={460}
    >
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={namePlaceholder}
        placeholderTextColor={scheme.textMuted}
        style={[
          styles.input,
          {
            color: scheme.text,
            borderColor: scheme.surfaceBorder,
            backgroundColor: scheme.primaryMuted,
          },
        ]}
        selectionColor={scheme.primary}
        autoFocus
      />
      <TextInput
        value={desc}
        onChangeText={setDesc}
        placeholder={descPlaceholder}
        placeholderTextColor={scheme.textMuted}
        multiline
        textAlignVertical="top"
        style={[
          styles.input,
          styles.descInput,
          {
            color: scheme.text,
            borderColor: scheme.surfaceBorder,
            backgroundColor: scheme.primaryMuted,
          },
        ]}
        selectionColor={scheme.primary}
      />
      <View style={styles.actions}>
        <GlassButton
          label="Cancel"
          onPress={onCancel}
          scheme={scheme}
          variant="ghost"
          small
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Add"
          onPress={handleAdd}
          scheme={scheme}
          variant="primary"
          small
          style={{ flex: 1 }}
          disabled={!name.trim()}
        />
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  descInput: {
    minHeight: 70,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
