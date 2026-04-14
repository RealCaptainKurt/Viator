import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import GlassHighlight from './GlassHighlight';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';
import { ColorSchemeId } from '../../types';
import { useAppStore } from '../../store/appStore';
import ColorSchemePicker from './ColorSchemePicker';

interface Props {
  scheme: ColorScheme;
  onDismiss: () => void;
  activeCharacterId: string | null;
  activeCampaignId: string | null;
}

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
    isEditMode,
    toggleEditMode,
  } = useAppStore();

  const [confirmDelete, setConfirmDelete] = useState<'char' | 'camp' | null>(null);

  const char = activeCharacterId ? characters[activeCharacterId] : null;
  const camp = activeCampaignId ? campaigns[activeCampaignId] : null;

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
    if (confirmDelete === 'char') {
      removeCharacter(char.id);
      onDismiss();
    } else {
      setConfirmDelete('char');
    }
  };

  const handleDeleteCamp = () => {
    if (!camp) return;
    if (confirmDelete === 'camp') {
      removeCampaign(camp.id);
      onDismiss();
    } else {
      setConfirmDelete('camp');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={[styles.panel, { borderColor: scheme.surfaceBorder, maxHeight: 480 }]}>
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

                    <TouchableOpacity
                      onPress={toggleEditMode}
                      style={[
                        styles.editBtn,
                        {
                          borderColor: isEditMode ? scheme.primary : scheme.surfaceBorder,
                          backgroundColor: isEditMode ? scheme.primaryMuted : scheme.surface,
                        },
                      ]}
                    >
                      <GlassHighlight borderRadius={10} />
                      <Text style={[styles.editBtnText, { color: isEditMode ? scheme.primary : scheme.text }]}>
                        Edit Mode
                      </Text>
                      <Text style={[styles.editBtnChevron, { color: isEditMode ? scheme.primary : scheme.textSecondary }]}>
                        {isEditMode ? '✓' : '›'}
                      </Text>
                    </TouchableOpacity>

                    {char && (
                      <TouchableOpacity
                        onPress={handleDeleteChar}
                        onBlur={() => setConfirmDelete(null)}
                        style={[styles.deleteBtn, { borderColor: scheme.destructive + '55', marginTop: 8 }]}
                      >
                        <GlassHighlight borderRadius={10} />
                        <Text style={[styles.deleteBtnText, { color: scheme.destructive }]}>
                          {confirmDelete === 'char' ? 'Tap again to confirm' : 'Delete Character'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {camp && (
                      <TouchableOpacity
                        onPress={handleDeleteCamp}
                        onBlur={() => setConfirmDelete(null)}
                        style={[styles.deleteBtn, { borderColor: scheme.destructive + '55', marginTop: char ? 8 : 0 }]}
                      >
                        <GlassHighlight borderRadius={10} />
                        <Text style={[styles.deleteBtnText, { color: scheme.destructive }]}>
                          {confirmDelete === 'camp' ? 'Tap again to confirm' : 'Delete Campaign'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

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
