import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

export type ComponentType = 'text' | 'number' | 'npc' | 'text-list' | 'number-list' | 'npc-list';

const COMP_TYPES: { type: ComponentType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'number', label: 'Number' },
  { type: 'npc', label: 'NPC' },
  { type: 'text-list', label: 'Text List' },
  { type: 'number-list', label: 'Number List' },
  { type: 'npc-list', label: 'NPC List' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (type: ComponentType, name: string) => void;
  scheme: ColorScheme;
}

export default function AddSectionModal({ visible, onClose, onAdd, scheme }: Props) {
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<ComponentType>('text');

  useEffect(() => {
    if (visible) {
      setNewCompName('');
      setNewCompType('text');
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleAdd = () => {
    if (!newCompName.trim()) return;
    onAdd(newCompType, newCompName.trim());
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                // @ts-ignore
                onClick={(e: any) => e.stopPropagation()}
                style={styles.modalCard}
              >
                <GlassCard scheme={scheme}>
                  <Text style={[styles.modalTitle, { color: scheme.text }]}>New Section</Text>
                  <TextInput
                    value={newCompName}
                    onChangeText={setNewCompName}
                    placeholder="Section name (e.g. Equipment, Notes)"
                    placeholderTextColor={scheme.textMuted}
                    style={[styles.modalInput, { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
                    autoFocus
                    selectionColor={scheme.primary}
                  />
                  <View style={styles.typeGrid}>
                    {COMP_TYPES.map(({ type, label }) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setNewCompType(type)}
                        style={[
                          styles.typeBtn,
                          {
                            backgroundColor: newCompType === type ? scheme.primaryMuted : scheme.surface,
                            borderColor: newCompType === type ? scheme.primary : scheme.surfaceBorder,
                          },
                        ]}
                      >
                        <Text style={[styles.typeBtnText, { color: newCompType === type ? scheme.primary : scheme.textSecondary }]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.modalActions}>
                    <GlassButton label="Cancel" onPress={handleClose} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
                    <GlassButton label="Add" onPress={handleAdd} scheme={scheme} variant="primary" small style={{ flex: 1 }} disabled={!newCompName.trim()} />
                  </View>
                </GlassCard>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { maxWidth: 400, alignSelf: 'center', width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { width: '30%', flexGrow: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  typeBtnText: { fontSize: 12, fontWeight: '600' },
});
