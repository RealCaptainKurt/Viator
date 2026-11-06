import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PageScaffold from '../components/layout/PageScaffold';
import GlassButton from '../components/ui/GlassButton';
import { COLOR_SCHEMES, DEFAULT_SCHEME } from '../constants/colorSchemes';
import { useScheme } from '../hooks/useScheme';
import { useGameStore } from '../store/gameStore';
import { GameFileError, exportFileName, serializeGames } from '../utils/gameFile';
import { gamesToPlaintext } from '../utils/gamePlaintext';

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

// ─── File I/O ────────────────────────────────────────────────────────────────
function pickFileWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) ?? null);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

async function pickFileNative(): Promise<string | null> {
  if (!DocumentPicker || !FileSystem) return null;
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const uri = result.assets[0]?.uri;
  return uri ? FileSystem.readAsStringAsync(uri) : null;
}

async function saveFile(content: string, fileName: string, mimeType: string) {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  if (!FileSystem || !Sharing) return;
  const uri = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: 'Export Viator Data' });
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ImportExportScreen() {
  const scheme = useScheme();
  const games = useGameStore((s) => s.games);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const toggleId = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleImport = async () => {
    try {
      const text = Platform.OS === 'web' ? await pickFileWeb() : await pickFileNative();
      if (text === null) return;
      const count = await useGameStore.getState().importGames(text);
      showFeedback(`Imported ${count} game${count === 1 ? '' : 's'}.`, true);
    } catch (e) {
      showFeedback(e instanceof GameFileError ? e.message : 'Failed to read file.', false);
    }
  };

  const runExport = async (kind: 'json' | 'text') => {
    try {
      const selected = await useGameStore.getState().loadGames(games.filter((g) => selectedIds.has(g.id)).map((g) => g.id));
      if (!selected.length) return;
      if (kind === 'json') {
        await saveFile(serializeGames(selected), exportFileName(selected), 'application/json');
      } else {
        // Prepend a UTF-8 BOM so text editors (notably Windows Notepad) detect the
        // encoding correctly; without it curly quotes and accents render as mojibake.
        const name = exportFileName(selected).replace(/\.json$/, '.txt');
        await saveFile('﻿' + gamesToPlaintext(selected), name, 'text/plain;charset=utf-8');
      }
      showFeedback('Exported successfully.', true);
    } catch {
      showFeedback('Export failed.', false);
    }
  };

  const selectedCount = selectedIds.size;
  const countSuffix = selectedCount > 0 ? ` (${selectedCount})` : '';

  return (
    <PageScaffold title="Import / Export" leading="back" bottomInset>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
            <Text style={[styles.feedbackText, { color: feedback.ok ? scheme.primary : scheme.destructive }]}>{feedback.msg}</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleImport} style={[styles.importBox, { borderColor: scheme.surfaceBorder }]} activeOpacity={0.7}>
          <MaterialCommunityIcons name="upload" size={28} color={scheme.textSecondary} />
          <Text style={[styles.importBoxText, { color: scheme.text }]}>Import</Text>
          <Text style={[styles.importBoxHint, { color: scheme.textMuted }]}>
            Select a Viator JSON file. Exports from the old version work too.
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: scheme.textMuted }]}>Saved Games</Text>
        {games.length === 0 && (
          <Text style={[styles.emptyHint, { color: scheme.textMuted }]}>No games yet. Start one from the Characters page.</Text>
        )}
        {games.map((g) => {
          const cs = COLOR_SCHEMES[g.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];
          const checked = selectedIds.has(g.id);
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => toggleId(g.id)}
              style={[styles.listItem, { borderColor: scheme.surfaceBorder }]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={checked ? scheme.primary : scheme.textMuted}
              />
              <View style={[styles.colorDot, { backgroundColor: cs.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: scheme.text }]} numberOfLines={1}>
                  {g.characterName || 'Untitled character'}
                </Text>
                <Text style={[styles.itemSub, { color: scheme.textSecondary }]} numberOfLines={1}>
                  {g.campaignName || 'Untitled campaign'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {games.length > 0 && (
          <View style={styles.exportButtons}>
            <GlassButton
              label={`Export as JSON${countSuffix}`}
              variant="primary"
              scheme={scheme}
              onPress={() => runExport('json')}
              disabled={selectedCount === 0}
            />
            <GlassButton
              label={`Export as Plaintext${countSuffix}`}
              variant="secondary"
              scheme={scheme}
              onPress={() => runExport('text')}
              disabled={selectedCount === 0}
            />
            <Text style={[styles.exportHint, { color: scheme.textMuted }]}>
              JSON can be re-imported. Plaintext is a readable outline of your content.
            </Text>
          </View>
        )}
      </ScrollView>
    </PageScaffold>
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
  },
  itemSub: {
    fontSize: 12,
    marginTop: 1,
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
    marginTop: 24,
    marginBottom: 32,
  },
  exportHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
