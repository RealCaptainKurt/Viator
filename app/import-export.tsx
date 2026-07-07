import React, { useState } from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';
import { Character, Campaign } from '../types';
import { useAppStore } from '../store/appStore';
import { buildPlaintext } from '../utils/plaintextExport';
import GlassButton from '../components/ui/GlassButton';

// Lazy-import native-only modules so web bundle doesn't break
let DocumentPicker: typeof import('expo-document-picker') | null = null;
let FileSystem: typeof import('expo-file-system/legacy') | null = null;
let Sharing: typeof import('expo-sharing') | null = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DocumentPicker = require('expo-document-picker');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FileSystem = require('expo-file-system/legacy');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sharing = require('expo-sharing');
}

interface ViatorExport {
  version: number;
  type: 'viator-export';
  characters: Character[];
  campaigns: Campaign[];
}

function buildPayload(characters: Character[], campaigns: Campaign[]): string {
  const payload: ViatorExport = {
    version: 1,
    type: 'viator-export',
    characters,
    campaigns,
  };
  return JSON.stringify(payload, null, 2);
}

function parsePayload(raw: string): ViatorExport | null {
  try {
    const data = JSON.parse(raw);
    if (data?.type !== 'viator-export') return null;
    if (!Array.isArray(data.characters) || !Array.isArray(data.campaigns)) return null;
    return data as ViatorExport;
  } catch {
    return null;
  }
}

export default function ImportExportScreen() {
  const characters = useAppStore((s) => s.characters);
  const campaigns = useAppStore((s) => s.campaigns);
  const importData = useAppStore((s) => s.importData);

  const scheme = COLOR_SCHEMES[DEFAULT_SCHEME];

  const charList = Object.values(characters).sort((a, b) => b.updatedAt - a.updatedAt);
  const campList = Object.values(campaigns).sort((a, b) => b.updatedAt - a.updatedAt);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 3000);
  };

  // ── Import ───────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    try {
      let jsonText: string | null = null;

      if (Platform.OS === 'web') {
        jsonText = await pickFileWeb();
      } else {
        jsonText = await pickFileNative();
      }

      if (jsonText === null) return; // user cancelled

      const parsed = parsePayload(jsonText);
      if (!parsed) {
        showFeedback('Invalid file — not a Viator export.', false);
        return;
      }

      const totalItems = parsed.characters.length + parsed.campaigns.length;
      if (totalItems === 0) {
        showFeedback('File contains no characters or campaigns.', false);
        return;
      }

      importData(parsed.characters, parsed.campaigns);
      showFeedback(
        `Imported ${parsed.characters.length} character(s) and ${parsed.campaigns.length} campaign(s).`,
        true
      );
    } catch {
      showFeedback('Failed to read file.', false);
    }
  };

  const pickFileWeb = (): Promise<string | null> =>
    new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string ?? null);
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });

  const pickFileNative = async (): Promise<string | null> => {
    if (!DocumentPicker || !FileSystem) return null;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    const uri = result.assets[0]?.uri;
    if (!uri) return null;
    return await FileSystem.readAsStringAsync(uri);
  };

  // ── Export ───────────────────────────────────────────────────────────────────

  const selectedItems = () => ({
    selChars: charList.filter((c) => selectedIds.has(c.id)),
    selCamps: campList.filter((c) => selectedIds.has(c.id)),
  });

  const runExport = async (content: string, fileName: string, mimeType: string) => {
    try {
      if (Platform.OS === 'web') {
        downloadWeb(content, fileName, mimeType);
      } else {
        await exportNative(content, fileName, mimeType);
      }
      showFeedback('Exported successfully.', true);
    } catch {
      showFeedback('Export failed.', false);
    }
  };

  const handleExportJson = async () => {
    const { selChars, selCamps } = selectedItems();
    // We export exactly what the user picked.
    const payload = buildPayload(selChars, selCamps);
    await runExport(payload, `viator-export-${Date.now()}.json`, 'application/json');
  };

  const handleExportPlaintext = async () => {
    const { selChars, selCamps } = selectedItems();
    // Prepend a UTF-8 BOM so text editors (notably Windows Notepad) detect the
    // encoding correctly. Without it, curly apostrophes/dashes and accented
    // characters render as mojibake — e.g. "they're" shows up as "theyâ€™re".
    const payload = '\uFEFF' + buildPlaintext(selChars, selCamps);
    await runExport(payload, `viator-export-${Date.now()}.txt`, 'text/plain;charset=utf-8');
  };

  const downloadWeb = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportNative = async (content: string, fileName: string, mimeType: string) => {
    if (!FileSystem || !Sharing) return;
    const uri = FileSystem.cacheDirectory + fileName;
    await FileSystem.writeAsStringAsync(uri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Export Viator Data' });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const hasItems = charList.length > 0 || campList.length > 0;
  const selectedCount = selectedIds.size;

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: true, animation: 'slide_from_bottom' }} />
      <LinearGradient
        colors={[scheme.backgroundGradientStart, scheme.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={22} color={scheme.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: scheme.text }]}>Import / Export</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Feedback banner ─────────────────────────────────────── */}
          {feedback && (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor: feedback.ok ? scheme.primaryMuted : scheme.destructive + '33',
                  borderColor: feedback.ok ? scheme.primary + '55' : scheme.destructive + '88',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={feedback.ok ? 'check-circle-outline' : 'alert-circle-outline'}
                size={16}
                color={feedback.ok ? scheme.primary : scheme.destructive}
              />
              <Text style={[styles.feedbackText, { color: feedback.ok ? scheme.primary : scheme.destructive }]}>
                {feedback.msg}
              </Text>
            </View>
          )}

          {/* ── Import box ──────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleImport}
            style={[styles.importBox, { borderColor: scheme.surfaceBorder }]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="upload" size={28} color={scheme.textSecondary} />
            <Text style={[styles.importBoxText, { color: scheme.text }]}>Import</Text>
            <Text style={[styles.importBoxHint, { color: scheme.textMuted }]}>
              Tap to select a Viator JSON file
            </Text>
          </TouchableOpacity>

          {/* ── Export list ─────────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: scheme.textMuted }]}>
            Local Characters & Campaigns
          </Text>

          {!hasItems && (
            <Text style={[styles.emptyHint, { color: scheme.textMuted }]}>
              No characters or campaigns yet. Start a New Game to create some.
            </Text>
          )}

          {charList.map((char) => {
            const cs = COLOR_SCHEMES[char.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
            const checked = selectedIds.has(char.id);
            return (
              <TouchableOpacity
                key={char.id}
                onPress={() => toggleId(char.id)}
                style={[styles.listItem, { borderColor: scheme.surfaceBorder }]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={checked ? scheme.primary : scheme.textMuted}
                />
                <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                <Text style={[styles.itemName, { color: scheme.text }]} numberOfLines={1}>
                  {char.name}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: cs.primaryMuted, borderColor: cs.primary + '44' }]}>
                  <Text style={[styles.typeBadgeText, { color: cs.primary }]}>Character</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {campList.map((camp) => {
            const cs = COLOR_SCHEMES[camp.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
            const checked = selectedIds.has(camp.id);
            return (
              <TouchableOpacity
                key={camp.id}
                onPress={() => toggleId(camp.id)}
                style={[styles.listItem, { borderColor: scheme.surfaceBorder }]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={checked ? scheme.primary : scheme.textMuted}
                />
                <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
                <Text style={[styles.itemName, { color: scheme.text }]} numberOfLines={1}>
                  {camp.name}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: cs.primaryMuted, borderColor: cs.primary + '44' }]}>
                  <Text style={[styles.typeBadgeText, { color: cs.primary }]}>Campaign</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 32 }} />

          {/* ── Export buttons ───────────────────────────────────────── */}
          {hasItems && (
            <View style={styles.exportButtons}>
              <GlassButton
                label={selectedCount > 0 ? `Export as JSON (${selectedCount})` : 'Export as JSON'}
                variant="primary"
                scheme={scheme}
                onPress={handleExportJson}
                disabled={selectedCount === 0}
              />
              <GlassButton
                label={selectedCount > 0 ? `Export as Plaintext (${selectedCount})` : 'Export as Plaintext'}
                variant="secondary"
                scheme={scheme}
                onPress={handleExportPlaintext}
                disabled={selectedCount === 0}
              />
              <Text style={[styles.exportHint, { color: scheme.textMuted }]}>
                JSON can be re-imported. Plaintext is a readable list of your content.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  importBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  importBoxText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  importBoxHint: {
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exportButtons: {
    gap: 10,
  },
  exportHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
