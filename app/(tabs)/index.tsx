import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PageScaffold, { FLOATING_INSET, FloatingButton } from '../../components/layout/PageScaffold';
import ModalOverlay from '../../components/modals/ModalOverlay';
import AccentPicker from '../../components/ui/AccentPicker';
import GlassButton from '../../components/ui/GlassButton';
import { DEFAULT_ACCENT, buildScheme, type ColorScheme } from '../../constants/colorSchemes';
import { useScheme } from '../../hooks/useScheme';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import type { AccentId } from '../../types';
import { formatDate } from '../../utils/date';
import type { GameSummary } from '../../utils/gameStorage';

export default function CharactersScreen() {
  const scheme = useScheme();
  const games = useGameStore((s) => s.games);
  const activeId = useGameStore((s) => s.game?.id);
  const favorites = useGameStore((s) => s.prefs.favorites);
  const isEditMode = useUIStore((s) => s.isEditMode);
  const toggleEditMode = useUIStore((s) => s.toggleEditMode);
  const [creating, setCreating] = useState(false);

  // Favorites are pinned to the top; within each group the list keeps its recency order.
  const sorted = useMemo(
    () => [...games].sort((a, b) => Number(!!favorites[b.id]) - Number(!!favorites[a.id])),
    [games, favorites],
  );

  const open = async (id: string) => {
    if (await useGameStore.getState().openGame(id)) router.navigate('/character');
  };

  return (
    <PageScaffold
      underlay
      actions={
        <FloatingButton
          icon={isEditMode ? 'create' : 'create-outline'}
          label={isEditMode ? 'Done editing' : 'Edit'}
          active={isEditMode}
          onPress={toggleEditMode}
        />
      }
    >
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
          sorted.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              active={g.id === activeId}
              favorite={!!favorites[g.id]}
              editMode={isEditMode}
              onOpen={() => open(g.id)}
              scheme={scheme}
            />
          ))
        )}
      </ScrollView>
      <NewGameModal visible={creating} onClose={() => setCreating(false)} />
    </PageScaffold>
  );
}

interface GameCardProps {
  game: GameSummary;
  active: boolean;
  favorite: boolean;
  /** Shows the favorite and delete buttons. */
  editMode: boolean;
  onOpen: () => void;
  scheme: ColorScheme;
}

function GameCard({ game, active, favorite, editMode, onOpen, scheme }: GameCardProps) {
  const [confirming, setConfirming] = useState(false);
  // This game's own accent, in the current light/dark mode.
  const cs = buildScheme(scheme.mode, game.accent);

  // Leaving edit mode cancels a pending delete.
  useEffect(() => {
    if (!editMode) setConfirming(false);
  }, [editMode]);

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
        <View style={styles.titleRow}>
          <Text style={[styles.cardTitle, { color: scheme.text }]} numberOfLines={1}>
            {game.characterName || 'Untitled character'}
          </Text>
          {favorite && <Ionicons name="star" size={14} color={cs.primary} accessibilityLabel="Favorite" />}
        </View>
        <Text style={[styles.cardSub, { color: scheme.textSecondary }]} numberOfLines={1}>
          {formatDate(game.updatedAt)}
        </Text>
      </View>
      {editMode && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => useGameStore.getState().toggleFavorite(game.id)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Ionicons name={favorite ? 'star' : 'star-outline'} size={19} color={favorite ? cs.primary : scheme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => (confirming ? useGameStore.getState().deleteGame(game.id) : setConfirming(true))}
            hitSlop={8}
            style={[styles.iconBtn, confirming && { backgroundColor: scheme.destructive + '33', borderColor: scheme.destructive }]}
            accessibilityLabel={confirming ? 'Confirm delete' : 'Delete game'}
          >
            {confirming ? (
              <Text style={[styles.deleteText, { color: scheme.destructive }]}>Delete?</Text>
            ) : (
              <Ionicons name="trash-outline" size={18} color={scheme.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function NewGameModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scheme = useScheme();
  const [characterName, setCharacterName] = useState('');
  const [accent, setAccent] = useState<AccentId>(DEFAULT_ACCENT);

  useEffect(() => {
    if (visible) setCharacterName('');
  }, [visible]);

  const create = async () => {
    await useGameStore.getState().newGame({
      characterName: characterName.trim() || undefined,
      accent,
    });
    onClose();
    router.navigate('/character');
  };

  const inputStyle = [styles.input, { color: scheme.text, borderColor: scheme.surfaceBorder, backgroundColor: scheme.inputBackground }];
  // Live preview: the Create button wears the selected accent; the rest of the modal stays put.
  const previewScheme = buildScheme(scheme.mode, accent);

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
      <AccentPicker current={accent} onChange={setAccent} scheme={scheme} />
      <View style={styles.actions}>
        <GlassButton label="Cancel" onPress={onClose} scheme={scheme} variant="ghost" small style={{ flex: 1 }} />
        <GlassButton label="Create" onPress={create} scheme={previewScheme} variant="primary" small style={{ flex: 1 }} />
      </View>
    </ModalOverlay>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: FLOATING_INSET, paddingBottom: 32 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  swatch: { width: 10, alignSelf: 'stretch', borderRadius: 5 },
  cardText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  cardSub: { fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { minWidth: 36, height: 32, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  deleteText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, paddingTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
