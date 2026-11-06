import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from '../ui/GlassButton';
import NumberStepper from '../ui/NumberStepper';
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
            { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.inputBackground },
          ]}
          selectionColor={scheme.primary}
          autoFocus
        />
      )}

      <NumberStepper
        value={draftValue}
        onChange={setDraftValue}
        scheme={scheme}
        autoFocus={!allowNameEdit}
        style={styles.stepper}
      />

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
  stepper: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
