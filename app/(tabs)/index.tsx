import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PageScaffold from '../../components/layout/PageScaffold';
import ModalOverlay from '../../components/modals/ModalOverlay';
import ColorSchemePicker from '../../components/ui/ColorSchemePicker';
import GlassButton from '../../components/ui/GlassButton';
import { COLOR_SCHEMES, DEFAULT_SCHEME, type ColorScheme } from '../../constants/colorSchemes';
import { useScheme } from '../../hooks/useScheme';
import { useGameStore } from '../../store/gameStore';
import type { ColorSchemeId } from '../../types';
import type { GameSummary } from '../../utils/gameStorage';

export default function CharactersScreen() {
  const scheme = useScheme();
  const games = useGameStore((s) => s.games);
  const activeId = useGameStore((s) => s.game?.id);
  const [creating, setCreating] = useState(false);

  const open = async (id: string) => {
    if (await useGameStore.getState().openGame(id)) router.navigate('/character');
  };

  return (
    <PageScaffold title="Characters">
      <ScrollView contentContainerStyle={styles.scroll}>
        <GlassButton
          label="New Game"
          icon={<MaterialCommunityIcons name="star-four-points" size={16} color={scheme.primary} />}
          onPress={() => setCreating(true)}
          scheme={scheme}
          style={{ marginBottom: 16 }}
        />
        {games.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="sword-cross" size={44} color={scheme.textMuted} />
            <Text style={[styles.emptyTitle, { color: scheme.text }]}>No games yet</Text>
            <Text style={[styles.emptyText, { color: scheme.textSecondary }]}>
              Start a new game, or import a save from the menu.
            </Text>
          </View>
        ) : (
          games.map((g) => <GameCard key={g.id} game={g} active={g.id === activeId} onOpen={() => open(g.id)} scheme={scheme} />)
        )}
      </ScrollView>
      <NewGameModal visible={creating} onClose={() => setCreating(false)} />
    </PageScaffold>
  );
}

function GameCard({ game, active, onOpen, scheme }: { game: GameSummary; active: boolean; onOpen: () => void; scheme: ColorScheme }) {
  const [confirming, setConfirming] = useState(false);
  const cs = COLOR_SCHEMES[game.colorScheme] ?? COLOR_SCHEMES[DEFAULT_SCHEME];

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  return (
    <TouchableOpacity
      onPress={onOpen}
      activeOpacity={0.75}
      style={[
        styles.card,
        { borderColor: active ? cs.primary : scheme.surfaceBorder, backgroundColor: active ? cs.primaryMuted : scheme.surface },
      ]}
    >
      <View style={[styles.swatch, { backgroundColor: cs.primary }]} />
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: scheme.text }]} numberOfLines={1}>
          {game.characterName || 'Untitled character'}
        </Text>
        <Text style={[styles.cardSub, { color: scheme.textSecondary }]} numberOfLines={1}>
          {game.campaignName || 'Untitled campaign'} · {formatDate(game.updatedAt)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => (confirming ? useGameStore.getState().deleteGame(game.id) : setConfirming(true))}
        hitSlop={8}
        style={[styles.deleteBtn, confirming && { backgroundColor: scheme.destructive + '33', borderColor: scheme.destructive }]}
        accessibilityLabel={confirming ? 'Confirm delete' : 'Delete game'}
      >
        {confirming ? (
          <Text style={[styles.deleteText, { color: scheme.destructive }]}>Delete?</Text>
        ) : (
          <Ionicons name="trash-outline" size={18} color={scheme.textMuted} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function NewGameModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scheme = useScheme();
  const [characterName, setCharacterName] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [colorScheme, setColorScheme] = useState<ColorSchemeId>(DEFAULT_SCHEME);

  useEffect(() => {
    if (visible) {
      setCharacterName('');
      setCampaignName('');
    }
  }, [visible]);

  const create = async () => {
    await useGameStore.getState().newGame({
      characterName: characterName.trim() || undefined,
      campaignName: campaignName.trim() || (characterName.trim() ? `${characterName.trim()}'s Campaign` : undefined),
      colorScheme,
    });
    onClose();
    router.navigate('/character');
  };

  const inputStyle = [styles.input, { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }];

  return (
    <ModalOverlay visible={visible} onClose={onClose} scheme={scheme} title="New Game" maxWidth={460}>
      <TextInput
        value={characterName}
        onChangeText={setCharacterName}
        placeholder="Character name"
        placeholderTextColor={scheme.textMuted}
        selectionColor={scheme.primary}
        style={inputStyle}
        autoFocus
      />
      <TextInput
        value={campaignName}
        onChangeText={setCampaignName}
        placeholder={characterName.trim() ? `${characterName.trim()}'s Campaign` : 'Campaign name'}
        placeholderTextColor={scheme.textMuted}
        selectionColor={scheme.primary}
        style={inputStyle}
      />
      <ColorSchemePicker current={colorScheme} onChange={setColorScheme} scheme={scheme} />
      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={onClose} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton label="Create" onPress={create} scheme={scheme} variant="primary" small style={{ flex: 1 }} />
      </View>
    </ModalOverlay>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  swatch: { width: 10, alignSelf: 'stretch', borderRadius: 5 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: 2 },
  deleteBtn: { minWidth: 36, height: 32, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  deleteText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, paddingTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
