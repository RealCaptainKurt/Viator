import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import GlassHighlight from './GlassHighlight';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';
import { ColorSchemeId } from '../../types';
import { useAppStore } from '../../store/appStore';
import ColorSchemePicker from './ColorSchemePicker';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface Props {
  scheme: ColorScheme;
  onDismiss: () => void;
  activeCharacterId: string | null;
  activeCampaignId: string | null;
}

type EditMode = 'char' | 'camp' | null;

export default function PageSettingsPanel({
  scheme,
  onDismiss,
  activeCharacterId,
  activeCampaignId,
}: Props) {
  const {
    characters,
    campaigns,
    updateCharacterField,
    updateCampaignField,
    removeCharacter,
    removeCampaign,
    addCharacterComponent,
    removeCharacterComponent,
    addCampaignComponent,
    removeCampaignComponent,
  } = useAppStore();

  const char = activeCharacterId ? characters[activeCharacterId] : null;
  const camp = activeCampaignId ? campaigns[activeCampaignId] : null;

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [addingComp, setAddingComp] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<'text' | 'list' | 'number'>('text');
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvent, (e) =>
      setKbHeight(e.endCoordinates.height)
    );
    const onHide = Keyboard.addListener(hideEvent, () => setKbHeight(0));
    return () => { onShow.remove(); onHide.remove(); };
  }, []);

  const currentScheme = char?.colorScheme ?? camp?.colorScheme ?? (scheme.id as ColorSchemeId);
  const showCampaignScheme = !char && !!camp;

  const handleCharScheme = (id: ColorSchemeId) => {
    if (!activeCharacterId) return;
    updateCharacterField(activeCharacterId, 'colorScheme', id);
    if (char?.campaignId) {
      updateCampaignField(char.campaignId, 'colorScheme', id);
    }
  };

  const handleCampScheme = (id: ColorSchemeId) => {
    if (!activeCampaignId) return;
    updateCampaignField(activeCampaignId, 'colorScheme', id);
  };

  const handleDeleteChar = () => {
    if (!char) return;
    Alert.alert('Delete Character', `Permanently delete "${char.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { removeCharacter(char.id); onDismiss(); },
      },
    ]);
  };

  const handleDeleteCamp = () => {
    if (!camp) return;
    Alert.alert('Delete Campaign', `Permanently delete "${camp.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { removeCampaign(camp.id); onDismiss(); },
      },
    ]);
  };

  const handleRemoveCharComp = (compId: string, compName: string) => {
    if (!activeCharacterId) return;
    Alert.alert('Remove Section', `Remove "${compName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeCharacterComponent(activeCharacterId, compId),
      },
    ]);
  };

  const handleRemoveCampComp = (compId: string, compName: string) => {
    if (!activeCampaignId) return;
    Alert.alert('Remove Section', `Remove "${compName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeCampaignComponent(activeCampaignId, compId),
      },
    ]);
  };

  const handleAddCharComp = () => {
    if (!newCompName.trim() || !activeCharacterId) return;
    addCharacterComponent(activeCharacterId, newCompType, newCompName.trim());
    setNewCompName('');
    setNewCompType('text');
    setAddingComp(false);
  };

  const handleAddCampComp = () => {
    if (!newCompName.trim() || !activeCampaignId) return;
    addCampaignComponent(activeCampaignId, newCompType, newCompName.trim());
    setNewCompName('');
    setAddingComp(false);
  };

  const exitEditMode = () => {
    setEditMode(null);
    setAddingComp(false);
    setNewCompName('');
    setNewCompType('text');
  };

  // ── Render content based on mode ──────────────────────────────────────────
  let content: React.ReactNode;

  if (editMode === 'char' && char) {
    content = (
      <>
        <View style={styles.editHeader}>
          <TouchableOpacity
            onPress={exitEditMode}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.backBtn, { color: scheme.primary }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.editTitle, { color: scheme.text }]} numberOfLines={1}>
            {char.name}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: scheme.textSecondary }]}>
          Custom Sections
        </Text>

        {char.additionalComponents.length === 0 && !addingComp && (
          <Text style={[styles.emptyText, { color: scheme.textMuted }]}>
            No custom sections yet.
          </Text>
        )}
        {char.additionalComponents.map((comp) => (
          <View
            key={comp.id}
            style={[styles.compRow, { borderBottomColor: scheme.surfaceBorder }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.compName, { color: scheme.text }]}>{comp.name}</Text>
              <Text style={[styles.compType, { color: scheme.textMuted }]}>
                {comp.type === 'list' ? 'List' : comp.type === 'number' ? 'Number' : 'Text'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveCharComp(comp.id, comp.name)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={scheme.destructive} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => setAddingComp(true)}
          style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <Text style={[styles.addSectionText, { color: scheme.textSecondary }]}>
            + Add Custom Section
          </Text>
        </TouchableOpacity>

        <View style={styles.deleteArea}>
          <TouchableOpacity
            onPress={handleDeleteChar}
            style={[styles.deleteBtn, { borderColor: scheme.destructive + '55' }]}
          >
            <GlassHighlight borderRadius={10} />
            <Text style={[styles.deleteBtnText, { color: scheme.destructive }]}>
              Delete Character
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add section modal */}
        <Modal
          visible={addingComp && editMode === 'char'}
          transparent
          animationType="fade"
          onRequestClose={() => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={() => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); }}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <GlassCard scheme={scheme} style={styles.modalCard}>
                    <Text style={[styles.modalTitle, { color: scheme.text }]}>
                      New Section
                    </Text>
                    <TextInput
                      value={newCompName}
                      onChangeText={setNewCompName}
                      placeholder="Section name (e.g. Equipment, Notes)"
                      placeholderTextColor={scheme.textMuted}
                      style={[
                        styles.modalInput,
                        {
                          color: scheme.text,
                          borderColor: scheme.surfaceBorder,
                          backgroundColor: scheme.primaryMuted,
                        },
                      ]}
                      autoFocus
                      selectionColor={scheme.primary}
                    />
                    <View style={styles.typeRow}>
                      {(['text', 'list', 'number'] as const).map((t) => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setNewCompType(t)}
                          style={[
                            styles.typeBtn,
                            {
                              backgroundColor:
                                newCompType === t ? scheme.primaryMuted : scheme.surface,
                              borderColor:
                                newCompType === t ? scheme.primary : scheme.surfaceBorder,
                            },
                          ]}
                        >
                          <GlassHighlight borderRadius={8} />
                          <Text
                            style={[
                              styles.typeBtnText,
                              {
                                color:
                                  newCompType === t ? scheme.primary : scheme.textSecondary,
                              },
                            ]}
                          >
                            {t === 'text' ? 'Text' : t === 'list' ? 'List' : 'Number'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.modalActions}>
                      <GlassButton
                        label="Cancel"
                        onPress={() => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); }}
                        scheme={scheme}
                        variant="ghost"
                        small
                        style={{ flex: 1 }}
                      />
                      <GlassButton
                        label="Add"
                        onPress={handleAddCharComp}
                        scheme={scheme}
                        variant="primary"
                        small
                        style={{ flex: 1 }}
                        disabled={!newCompName.trim()}
                      />
                    </View>
                  </GlassCard>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  } else if (editMode === 'camp' && camp) {
    content = (
      <>
        <View style={styles.editHeader}>
          <TouchableOpacity
            onPress={exitEditMode}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.backBtn, { color: scheme.primary }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.editTitle, { color: scheme.text }]} numberOfLines={1}>
            {camp.name}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: scheme.textSecondary }]}>
          Custom Sections
        </Text>

        {camp.additionalComponents.length === 0 && !addingComp && (
          <Text style={[styles.emptyText, { color: scheme.textMuted }]}>
            No custom sections yet.
          </Text>
        )}
        {camp.additionalComponents.map((comp) => (
          <View
            key={comp.id}
            style={[styles.compRow, { borderBottomColor: scheme.surfaceBorder }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.compName, { color: scheme.text }]}>{comp.name}</Text>
              <Text style={[styles.compType, { color: scheme.textMuted }]}>{comp.type}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveCampComp(comp.id, comp.name)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color={scheme.destructive} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => setAddingComp(true)}
          style={[styles.addSectionBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <Text style={[styles.addSectionText, { color: scheme.textSecondary }]}>
            + Add Custom Section
          </Text>
        </TouchableOpacity>

        <View style={styles.deleteArea}>
          <TouchableOpacity
            onPress={handleDeleteCamp}
            style={[styles.deleteBtn, { borderColor: scheme.destructive + '55' }]}
          >
            <GlassHighlight borderRadius={10} />
            <Text style={[styles.deleteBtnText, { color: scheme.destructive }]}>
              Delete Campaign
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add section modal */}
        <Modal
          visible={addingComp && editMode === 'camp'}
          transparent
          animationType="fade"
          onRequestClose={() => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={() => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); }}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <GlassCard scheme={scheme} style={styles.modalCard}>
                    <Text style={[styles.modalTitle, { color: scheme.text }]}>
                      New Section
                    </Text>
                    <TextInput
                      value={newCompName}
                      onChangeText={setNewCompName}
                      placeholder="Section name"
                      placeholderTextColor={scheme.textMuted}
                      style={[
                        styles.modalInput,
                        {
                          color: scheme.text,
                          borderColor: scheme.surfaceBorder,
                          backgroundColor: scheme.primaryMuted,
                        },
                      ]}
                      autoFocus
                      selectionColor={scheme.primary}
                    />
                    <View style={styles.typeRow}>
                      {(['text', 'list', 'number'] as const).map((t) => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setNewCompType(t)}
                          style={[
                            styles.typeBtn,
                            {
                              backgroundColor:
                                newCompType === t ? scheme.primaryMuted : 'transparent',
                              borderColor:
                                newCompType === t ? scheme.primary : scheme.surfaceBorder,
                            },
                          ]}
                        >
                          <GlassHighlight borderRadius={8} />
                          <Text
                            style={[
                              styles.typeBtnText,
                              {
                                color: newCompType === t ? scheme.primary : scheme.textMuted,
                              },
                            ]}
                          >
                            {t === 'text' ? 'Text' : t === 'list' ? 'List' : 'Number'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.modalActions}>
                      <GlassButton
                        label="Cancel"
                        onPress={() => { setAddingComp(false); setNewCompName(''); setNewCompType('text'); }}
                        scheme={scheme}
                        variant="ghost"
                        small
                        style={{ flex: 1 }}
                      />
                      <GlassButton
                        label="Add"
                        onPress={handleAddCampComp}
                        scheme={scheme}
                        variant="primary"
                        small
                        style={{ flex: 1 }}
                        disabled={!newCompName.trim()}
                      />
                    </View>
                  </GlassCard>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  } else {
    content = (
      <>
        {/* ── Color Theme ──────────── */}
        {(char || camp) && (
          <View style={styles.section}>
            <ColorSchemePicker
              current={currentScheme}
              onChange={showCampaignScheme ? handleCampScheme : handleCharScheme}
              scheme={scheme}
            />
          </View>
        )}

        {/* ── Manage ───────────────── */}
        {(char || camp) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: scheme.textSecondary }]}>
              Manage
            </Text>
            {char && (
              <TouchableOpacity
                onPress={() => setEditMode('char')}
                style={[
                  styles.editBtn,
                  {
                    borderColor: scheme.surfaceBorder,
                    backgroundColor: scheme.primaryMuted,
                  },
                ]}
              >
                <GlassHighlight borderRadius={10} />
                <Text style={[styles.editBtnText, { color: scheme.text }]}>
                  Edit Character
                </Text>
                <Text style={[styles.editBtnChevron, { color: scheme.textSecondary }]}>›</Text>
              </TouchableOpacity>
            )}
            {camp && (
              <TouchableOpacity
                onPress={() => setEditMode('camp')}
                style={[
                  styles.editBtn,
                  {
                    borderColor: scheme.surfaceBorder,
                    backgroundColor: scheme.primaryMuted,
                    marginTop: char ? 8 : 0,
                  },
                ]}
              >
                <GlassHighlight borderRadius={10} />
                <Text style={[styles.editBtnText, { color: scheme.text }]}>
                  Edit Campaign
                </Text>
                <Text style={[styles.editBtnChevron, { color: scheme.textSecondary }]}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </>
    );
  }

  const screenHeight = Dimensions.get('window').height;
  const panelTop = 56;
  const panelMaxHeight = kbHeight > 0
    ? screenHeight - panelTop - kbHeight - 16
    : 480;

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onDismiss(); }}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={[styles.panel, { borderColor: scheme.surfaceBorder, maxHeight: panelMaxHeight }]}>
            <BlurView
              intensity={50}
              tint={scheme.blurTint}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[styles.panelInner, { backgroundColor: scheme.surface }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {content}
                <View style={{ height: 4 }} />
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  panel: {
    position: 'absolute',
    top: 56,
    right: 12,
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  panelInner: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editBtnChevron: {
    fontSize: 18,
    fontWeight: '600',
  },
  // ── Edit mode ─────────────────────────────────
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    fontSize: 15,
    fontWeight: '600',
  },
  editTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 8,
  },
  compName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  compType: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  removeIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addSectionBtn: {
    marginTop: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addSectionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteArea: {
    marginTop: 20,
  },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
