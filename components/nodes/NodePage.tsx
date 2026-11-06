import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useScheme } from '../../hooks/useScheme';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import type { GamePage } from '../../types/node';
import PageScaffold, { TopBarButton } from '../layout/PageScaffold';
import GlassButton from '../ui/GlassButton';
import { ChildList, DescriptionBlock, ValueChip, dropMovingNode } from './NodeView';

const TITLES: Record<GamePage, string> = { character: 'Character', campaign: 'Campaign' };

/** A full page (Character or Campaign) rendering one tree of the open game. */
export default function NodePage({ page }: { page: GamePage }) {
  const hasGame = useGameStore((s) => !!s.game);
  const isEditMode = useUIStore((s) => s.isEditMode);
  const toggleEditMode = useUIStore((s) => s.toggleEditMode);

  return (
    <PageScaffold
      title={TITLES[page]}
      actions={
        hasGame && (
          <TopBarButton
            icon={isEditMode ? 'create' : 'create-outline'}
            label={isEditMode ? 'Done editing' : 'Edit'}
            active={isEditMode}
            onPress={toggleEditMode}
          />
        )
      }
    >
      {hasGame ? <Tree page={page} /> : <NoGame />}
    </PageScaffold>
  );
}

function Tree({ page }: { page: GamePage }) {
  const scheme = useScheme();
  const root = useGameStore((s) => s.game?.[page]);
  const isEditMode = useUIStore((s) => s.isEditMode);
  const moving = useUIStore((s) => s.moving);
  const setUI = useUIStore((s) => s.set);
  if (!root) return null;
  const ref = { page, nodeId: root.id };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.rootHeader}>
        <Pressable onLongPress={() => setUI({ editing: ref })} style={styles.rootTitleWrap}>
          <Text style={[styles.rootTitle, { color: root.name ? scheme.text : scheme.textMuted }]}>
            {root.name || 'Untitled'}
          </Text>
        </Pressable>
        {root.value !== undefined && !moving && (
          <ValueChip large value={root.value} label={root.valueLabel} scheme={scheme} onPress={() => setUI({ editingValue: ref })} />
        )}
        {moving && root.children === undefined && (
          <GlassButton label="Into" onPress={() => dropMovingNode(page, root.id, 0)} scheme={scheme} small />
        )}
        {isEditMode && !moving && (
          <TouchableOpacity onPress={() => setUI({ editing: ref })} hitSlop={8} style={styles.moreBtn} accessibilityLabel="Edit page">
            <Ionicons name="ellipsis-horizontal" size={20} color={scheme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {root.description !== undefined && (
        <View style={[styles.rootDesc, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}>
          <DescriptionBlock text={root.description} scheme={scheme} onPress={() => setUI({ editingDescription: ref })} />
        </View>
      )}

      {root.children !== undefined && <ChildList parent={root} page={page} depth={0} insideMoving={false} />}

      {!isEditMode && !moving && (
        <Text style={[styles.hint, { color: scheme.textMuted }]}>
          Tap the pencil to add or rearrange. Long-press anything to edit it.
        </Text>
      )}
    </ScrollView>
  );
}

function NoGame() {
  const scheme = useScheme();
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="sword-cross" size={44} color={scheme.textMuted} />
      <Text style={[styles.emptyTitle, { color: scheme.text }]}>No game open</Text>
      <Text style={[styles.emptyText, { color: scheme.textSecondary }]}>Pick a character or start a new game.</Text>
      <GlassButton label="Go to Characters" onPress={() => router.navigate('/')} scheme={scheme} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  rootHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, minHeight: 44 },
  rootTitleWrap: { flex: 1 },
  rootTitle: { fontSize: 26, fontWeight: '800', letterSpacing: 0.3 },
  moreBtn: { width: 32, alignItems: 'center' },
  rootDesc: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 12 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
