import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ColorScheme } from '../../constants/colorSchemes';
import { NODE_TEMPLATES } from '../../constants/nodeTemplates';
import { useScheme } from '../../hooks/useScheme';
import { useGameStore } from '../../store/gameStore';
import { useUIStore, type NodeRef } from '../../store/uiStore';
import type { Node } from '../../types/node';
import { findNode } from '../../utils/tree';
import ModalOverlay from '../modals/ModalOverlay';
import NumberEditModal from '../modals/NumberEditModal';
import TextEditModal from '../modals/TextEditModal';
import GlassButton from '../ui/GlassButton';

/** Look up a node (and its parent's child label) in the open game. Stable references only. */
function useNodeAt(ref: NodeRef | null): { node: Node | null; inheritedLabel?: string; isRoot: boolean } {
  const node = useGameStore((s) => (ref && s.game ? findNode(s.game[ref.page], ref.nodeId)?.node ?? null : null));
  const inheritedLabel = useGameStore((s) =>
    ref && s.game ? findNode(s.game[ref.page], ref.nodeId)?.parent?.childValueLabel : undefined,
  );
  const isRoot = useGameStore((s) => !!ref && !!s.game && s.game[ref.page].id === ref.nodeId);
  return { node, inheritedLabel, isRoot };
}

/** Renders every node editor once for the whole app. */
export default function NodeModalHost() {
  return (
    <>
      <NodeEditModal />
      <AddNodeModal />
      <ValueModal />
      <DescriptionModal />
    </>
  );
}

// ─── Quick edits ─────────────────────────────────────────────────────────────
function ValueModal() {
  const scheme = useScheme();
  const ref = useUIStore((s) => s.editingValue);
  const close = () => useUIStore.getState().set({ editingValue: null });
  const { node, inheritedLabel } = useNodeAt(ref);
  const label = node?.valueLabel ?? inheritedLabel;
  return (
    <NumberEditModal
      visible={!!node && node.value !== undefined}
      title={`${node?.name || 'Untitled'}${label ? ` · ${label}` : ''}`}
      initialValue={node?.value ?? 0}
      allowNameEdit={false}
      scheme={scheme}
      onSave={(value) => ref && useGameStore.getState().updateNode(ref.page, ref.nodeId, { value })}
      onClose={close}
    />
  );
}

function DescriptionModal() {
  const scheme = useScheme();
  const ref = useUIStore((s) => s.editingDescription);
  const close = () => useUIStore.getState().set({ editingDescription: null });
  const { node } = useNodeAt(ref);
  return (
    <TextEditModal
      visible={!!node && node.description !== undefined}
      scheme={scheme}
      title={node?.name || 'Description'}
      initialDesc={node?.description ?? ''}
      descPlaceholder="Description"
      showNameInput={false}
      confirmLabel="Save"
      onConfirm={(_, description) => {
        if (ref) useGameStore.getState().updateNode(ref.page, ref.nodeId, { description });
        close();
      }}
      onCancel={close}
    />
  );
}

// ─── Add node ────────────────────────────────────────────────────────────────
function AddNodeModal() {
  const scheme = useScheme();
  const target = useUIStore((s) => s.adding);
  const close = () => useUIStore.getState().set({ adding: null });
  const [templateId, setTemplateId] = useState(NODE_TEMPLATES[0].id);
  const [name, setName] = useState('');

  useEffect(() => {
    if (target) setName('');
  }, [target]);

  const add = () => {
    if (!target) return;
    const gs = useGameStore.getState();
    gs.addChild(target.page, target.parentId, templateId, name.trim() || undefined);
    if (gs.prefs.collapsed[target.parentId]) gs.toggleCollapsed(target.parentId);
    close();
  };

  return (
    <ModalOverlay visible={!!target} onClose={close} scheme={scheme} title="Add">
      <View style={styles.templateRow}>
        {NODE_TEMPLATES.map((t) => {
          const active = t.id === templateId;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTemplateId(t.id)}
              style={[
                styles.templateChip,
                { borderColor: active ? scheme.primary : scheme.surfaceBorder, backgroundColor: active ? scheme.primaryMuted : 'transparent' },
              ]}
            >
              <Text style={[styles.templateText, { color: active ? scheme.primary : scheme.textSecondary }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Input
        scheme={scheme}
        value={name}
        onChangeText={setName}
        placeholder={NODE_TEMPLATES.find((t) => t.id === templateId)?.create().name}
        autoFocus
        onSubmitEditing={add}
        returnKeyType="done"
      />
      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={close} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton label="Add" onPress={add} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
      </View>
    </ModalOverlay>
  );
}

// ─── Full node editor ────────────────────────────────────────────────────────
function NodeEditModal() {
  const scheme = useScheme();
  const ref = useUIStore((s) => s.editing);
  const close = () => useUIStore.getState().set({ editing: null });
  const { node, inheritedLabel, isRoot } = useNodeAt(ref);

  const [name, setName] = useState('');
  const [hasValue, setHasValue] = useState(false);
  const [value, setValue] = useState('0');
  const [valueLabel, setValueLabel] = useState('');
  const [hasDesc, setHasDesc] = useState(false);
  const [desc, setDesc] = useState('');
  const [hasKids, setHasKids] = useState(false);
  const [childLabel, setChildLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset the form whenever a different node is opened.
  useEffect(() => {
    if (!node) return;
    setName(node.name);
    setHasValue(node.value !== undefined);
    setValue(String(node.value ?? 0));
    setValueLabel(node.valueLabel ?? '');
    setHasDesc(node.description !== undefined);
    setDesc(node.description ?? '');
    setHasKids(node.children !== undefined);
    setChildLabel(node.childValueLabel ?? '');
    setConfirmDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.nodeId]);

  if (!ref || !node) return <ModalOverlay visible={false} onClose={close} scheme={scheme}>{null}</ModalOverlay>;

  const lostKids = !hasKids && (node.children?.length ?? 0) > 0;

  const save = () => {
    const gs = useGameStore.getState();
    if (hasKids && node.children === undefined) gs.addAttachment(ref.page, ref.nodeId, 'children');
    if (!hasKids && node.children !== undefined) gs.removeAttachment(ref.page, ref.nodeId, 'children');
    gs.updateNode(ref.page, ref.nodeId, {
      name: name.trim(),
      value: hasValue ? parseInt(value, 10) || 0 : undefined,
      valueLabel: hasValue && valueLabel.trim() ? valueLabel.trim() : undefined,
      description: hasDesc ? desc.trim() : undefined,
      childValueLabel: hasKids && childLabel.trim() ? childLabel.trim() : undefined,
    });
    close();
  };

  const remove = () => {
    if (!confirmDelete) return setConfirmDelete(true);
    useGameStore.getState().removeNode(ref.page, ref.nodeId);
    close();
  };

  const move = () => useUIStore.getState().startMove(ref, node.name);

  return (
    <ModalOverlay visible onClose={close} scheme={scheme} title={isRoot ? 'Edit page' : 'Edit'} maxWidth={480}>
      <ScrollView style={styles.editScroll} keyboardShouldPersistTaps="handled">
        <Input scheme={scheme} value={name} onChangeText={setName} placeholder="Name" />

        <Toggle scheme={scheme} label="Number" value={hasValue} onChange={setHasValue} />
        {hasValue && (
          <View style={styles.inlineRow}>
            <Input
              scheme={scheme}
              value={value}
              onChangeText={(v) => (v === '' || v === '-' || /^-?\d+$/.test(v)) && setValue(v)}
              keyboardType="numbers-and-punctuation"
              style={styles.numberInput}
              selectTextOnFocus
            />
            <Input
              scheme={scheme}
              value={valueLabel}
              onChangeText={setValueLabel}
              placeholder={inheritedLabel ? `Label (${inheritedLabel})` : 'Label (e.g. XP)'}
              style={{ flex: 1 }}
            />
          </View>
        )}

        <Toggle scheme={scheme} label="Description" value={hasDesc} onChange={setHasDesc} />
        {hasDesc && (
          <Input scheme={scheme} value={desc} onChangeText={setDesc} placeholder="Description" multiline style={styles.descInput} />
        )}

        <Toggle scheme={scheme} label="Sub-items" value={hasKids} onChange={setHasKids} />
        {hasKids && (
          <Input
            scheme={scheme}
            value={childLabel}
            onChangeText={setChildLabel}
            placeholder="Label for sub-item numbers (e.g. Level)"
          />
        )}
        {lostKids && (
          <Text style={[styles.warning, { color: scheme.destructive }]}>
            Saving will delete {node.children!.length} sub-item{node.children!.length === 1 ? '' : 's'}.
          </Text>
        )}
      </ScrollView>

      {!isRoot && (
        <View style={styles.actions}>
          <GlassButton
            label="Move"
            icon={<Ionicons name="move" size={14} color={scheme.text} />}
            onPress={move}
            scheme={scheme}
            variant="secondary"
            small
            style={{ flex: 1 }}
          />
          <GlassButton
            label={confirmDelete ? 'Tap to confirm' : 'Delete'}
            onPress={remove}
            scheme={scheme}
            variant="destructive"
            small
            style={{ flex: 1 }}
          />
        </View>
      )}
      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={close} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton label="Save" onPress={save} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
      </View>
    </ModalOverlay>
  );
}

// ─── Small form pieces ───────────────────────────────────────────────────────
function Input({ scheme, style, ...rest }: React.ComponentProps<typeof TextInput> & { scheme: ColorScheme }) {
  return (
    <TextInput
      placeholderTextColor={scheme.textMuted}
      selectionColor={scheme.primary}
      textAlignVertical={rest.multiline ? 'top' : 'center'}
      {...rest}
      style={[styles.input, { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }, style]}
    />
  );
}

function Toggle({ scheme, label, value, onChange }: { scheme: ColorScheme; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: scheme.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: scheme.primary, false: scheme.surfaceBorder }}
        thumbColor="#fff"
        // @ts-ignore - web only prop
        activeThumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editScroll: { maxHeight: 460 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontSize: 16, marginBottom: 10 },
  numberInput: { width: 90, textAlign: 'center', fontWeight: '700' },
  descInput: { minHeight: 100, maxHeight: 200 },
  inlineRow: { flexDirection: 'row', gap: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, marginBottom: 4 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  warning: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  templateRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  templateChip: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 7 },
  templateText: { fontSize: 14, fontWeight: '600' },
});
