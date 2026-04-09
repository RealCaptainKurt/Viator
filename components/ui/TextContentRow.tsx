import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from './GlassButton';
import ModalOverlay from './ModalOverlay';

interface Props {
  content: string;
  scheme: ColorScheme;
  placeholder?: string;
  title?: string;
  onSave: (content: string) => void;
}

export default function TextContentRow({
  content,
  scheme,
  placeholder = 'Tap to edit...',
  title,
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const openEdit = () => {
    setDraft(content);
    setEditing(true);
  };

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <>
      <TouchableOpacity onPress={openEdit} activeOpacity={0.75} style={styles.row}>
        {content ? (
          <Text style={[styles.content, { color: scheme.text }]}>{content}</Text>
        ) : (
          <Text style={[styles.placeholder, { color: scheme.textMuted }]}>
            {placeholder}
          </Text>
        )}
        <Feather name="edit-2" size={14} color={scheme.textMuted} style={{ paddingTop: 2 }} />
      </TouchableOpacity>

      <ModalOverlay
        visible={editing}
        onClose={() => setEditing(false)}
        scheme={scheme}
        title={title}
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
          placeholder={placeholder}
          placeholderTextColor={scheme.textMuted}
          selectionColor={scheme.primary}
        />
        <View style={styles.actions}>
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
    gap: 8,
    paddingVertical: 4,
  },
  content: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
  },
  editIcon: {
    fontSize: 16,
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
