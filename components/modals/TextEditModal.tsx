import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from '../ui/GlassButton';
import ModalOverlay from './ModalOverlay';

interface Props {
  visible: boolean;
  scheme: ColorScheme;
  title: string;
  initialName?: string;
  initialDesc?: string;
  namePlaceholder?: string;
  descPlaceholder?: string;
  showNameInput?: boolean;
  onConfirm: (name: string, description: string) => void;
  onCancel: () => void;
  onRemove?: () => void;
  confirmLabel?: string;
}

export default function TextEditModal({
  visible,
  scheme,
  title,
  initialName = '',
  initialDesc = '',
  namePlaceholder = 'Name',
  descPlaceholder = 'Description (optional)',
  showNameInput = true,
  onConfirm,
  onCancel,
  onRemove,
  confirmLabel = 'Confirm',
}: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDesc(initialDesc);
    }
  }, [visible, initialName, initialDesc]);

  const handleConfirm = () => {
    onConfirm(name.trim(), desc.trim());
  };

  return (
    <ModalOverlay
      visible={visible}
      onClose={onCancel}
      scheme={scheme}
      title={title}
      maxWidth={460}
    >
      {showNameInput && (
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
      )}
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
        autoFocus={!showNameInput}
      />
      <View style={styles.actions}>
        {onRemove && (
          <GlassButton
            label="Remove"
            onPress={onRemove}
            scheme={scheme}
            variant="destructive"
            small
            style={{ flex: 1 }}
          />
        )}
        <GlassButton
          label="Cancel"
          onPress={onCancel}
          scheme={scheme}
          variant="ghost"
          small
          style={{ flex: 1 }}
        />
        <GlassButton
          label={confirmLabel}
          onPress={handleConfirm}
          scheme={scheme}
          variant="primary"
          small
          style={{ flex: 1 }}
          disabled={showNameInput && !name.trim()}
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
    fontSize: 16,
    marginBottom: 10,
  },
  descInput: {
    minHeight: 110,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
