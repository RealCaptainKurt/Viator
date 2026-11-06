import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import type { ColorScheme } from '../../constants/colorSchemes';
import { useScheme } from '../../hooks/useScheme';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import type { GamePage, Node } from '../../types/node';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

/** Drop a picked-up node into `parentId` at `index`, then expand the parent. */
export function dropMovingNode(page: GamePage, parentId: string, index: number) {
  const { moving, cancelMove } = useUIStore.getState();
  if (!moving) return;
  const gs = useGameStore.getState();
  animate();
  gs.moveNode(moving.nodeId, page, parentId, index);
  if (gs.prefs.collapsed[parentId]) gs.toggleCollapsed(parentId);
  cancelMove();
}

// ─── Value chip ──────────────────────────────────────────────────────────────
export function ValueChip({
  value,
  onPress,
  scheme,
  large,
}: {
  value: number;
  onPress: () => void;
  scheme: ColorScheme;
  large?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={6}
      style={[styles.chip, large && styles.chipLarge, { borderColor: scheme.primary + '55', backgroundColor: scheme.primaryMuted }]}
      accessibilityLabel={`Value ${value}, edit`}
    >
      <Text style={[styles.chipValue, large && styles.chipValueLarge, { color: scheme.primary }]}>{value}</Text>
    </TouchableOpacity>
  );
}

// ─── Description block ───────────────────────────────────────────────────────
export function DescriptionBlock({ text, onPress, scheme }: { text: string; onPress: () => void; scheme: ColorScheme }) {
  return (
    <Pressable onPress={onPress} style={styles.desc} accessibilityHint="Edit description">
      <Text style={[styles.descText, text ? { color: scheme.textSecondary } : { color: scheme.textMuted, fontStyle: 'italic' }]}>
        {text || 'Tap to add a description…'}
      </Text>
    </Pressable>
  );
}

// ─── Child list ──────────────────────────────────────────────────────────────
interface ChildListProps {
  parent: Node;
  page: GamePage;
  depth: number;
  /** True when this list sits inside the node being moved (no drop targets). */
  insideMoving: boolean;
}

export function ChildList({ parent, page, depth, insideMoving }: ChildListProps) {
  const scheme = useScheme();
  const isEditMode = useUIStore((s) => s.isEditMode);
  const moving = useUIStore((s) => s.moving);
  const setUI = useUIStore((s) => s.set);
  const children = parent.children ?? [];

  const canDrop = !!moving && !insideMoving;
  const movingIndex = moving && moving.page === page ? children.findIndex((c) => c.id === moving.nodeId) : -1;
  // Slots directly around the picked-up node would be no-op moves, so hide them.
  const isNoOp = (index: number) => movingIndex >= 0 && (index === movingIndex || index === movingIndex + 1);
  const slot = (index: number) =>
    canDrop && !isNoOp(index) ? (
      <DropSlot key={`slot-${index}`} scheme={scheme} onPress={() => dropMovingNode(page, parent.id, index)} />
    ) : null;

  return (
    <View style={styles.childList}>
      {slot(0)}
      {children.map((child, i) => (
        <React.Fragment key={child.id}>
          <NodeView
            node={child}
            page={page}
            depth={depth}
            insideMoving={insideMoving}
          />
          {slot(i + 1)}
        </React.Fragment>
      ))}
      {children.length === 0 && !isEditMode && !canDrop && (
        <Text style={[styles.empty, { color: scheme.textMuted }]}>Nothing here yet</Text>
      )}
      {isEditMode && !moving && (
        <TouchableOpacity
          onPress={() => setUI({ adding: { page, parentId: parent.id } })}
          style={[styles.addRow, { borderColor: scheme.surfaceBorder }]}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={scheme.textSecondary} />
          <Text style={[styles.addText, { color: scheme.textSecondary }]}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DropSlot({ scheme, onPress }: { scheme: ColorScheme; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.dropSlot, { borderColor: scheme.primary, backgroundColor: scheme.primaryMuted }]}
      activeOpacity={0.6}
      accessibilityLabel="Drop here"
    >
      <MaterialCommunityIcons name="arrow-down-bold" size={12} color={scheme.primary} />
      <Text style={[styles.dropText, { color: scheme.primary }]}>Drop here</Text>
    </TouchableOpacity>
  );
}

// ─── Node ────────────────────────────────────────────────────────────────────
interface NodeViewProps {
  node: Node;
  page: GamePage;
  /** 0 = direct child of the page root (rendered as a card). */
  depth: number;
  insideMoving: boolean;
}

function NodeViewImpl({ node, page, depth, insideMoving }: NodeViewProps) {
  const scheme = useScheme();
  const collapsed = useGameStore((s) => !!s.prefs.collapsed[node.id]);
  const toggleCollapsed = useGameStore((s) => s.toggleCollapsed);
  const isEditMode = useUIStore((s) => s.isEditMode);
  const moving = useUIStore((s) => s.moving);
  const setUI = useUIStore((s) => s.set);

  const isMovingThis = moving?.nodeId === node.id;
  const childInsideMoving = insideMoving || isMovingThis;
  const hasBody = node.description !== undefined || node.children !== undefined;
  const expanded = hasBody && !collapsed && !isMovingThis;
  const ref = { page, nodeId: node.id };
  const isCard = depth === 0;

  const toggle = () => {
    if (!hasBody) return;
    animate();
    toggleCollapsed(node.id);
  };
  const openEditor = () => setUI({ editing: ref });

  return (
    <View
      style={[
        isCard ? [styles.card, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }] : styles.row,
        isMovingThis && styles.moving,
      ]}
    >
      <Pressable onPress={toggle} onLongPress={openEditor} delayLongPress={350} style={styles.header}>
        {hasBody ? (
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={isCard ? 16 : 14}
            color={scheme.primary}
            style={styles.chevron}
          />
        ) : (
          <View style={styles.chevron}>
            <View style={[styles.bullet, { backgroundColor: scheme.textMuted }]} />
          </View>
        )}
        <Text
          style={[isCard ? styles.cardTitle : styles.rowTitle, { color: scheme.text }, !node.name && { color: scheme.textMuted }]}
          numberOfLines={2}
        >
          {node.name || 'Untitled'}
        </Text>

        {isMovingThis && <Text style={[styles.movingTag, { color: scheme.primary }]}>Moving…</Text>}
        {moving && !childInsideMoving && (
          <TouchableOpacity
            onPress={() => dropMovingNode(page, node.id, node.children?.length ?? 0)}
            style={[styles.intoBtn, { borderColor: scheme.primary }]}
            hitSlop={4}
          >
            <MaterialCommunityIcons name="tray-arrow-down" size={14} color={scheme.primary} />
            <Text style={[styles.intoText, { color: scheme.primary }]}>Into</Text>
          </TouchableOpacity>
        )}
        {node.value !== undefined && !moving && (
          <ValueChip value={node.value} scheme={scheme} onPress={() => setUI({ editingValue: ref })} />
        )}
        {isEditMode && !moving && (
          <TouchableOpacity onPress={openEditor} hitSlop={8} style={styles.moreBtn} accessibilityLabel={`Edit ${node.name}`}>
            <Ionicons name="ellipsis-horizontal" size={18} color={scheme.textSecondary} />
          </TouchableOpacity>
        )}
      </Pressable>

      {expanded && (
        <View style={isCard ? styles.cardBody : [styles.rowBody, { borderLeftColor: scheme.primary + '88' }, depth > 5 && styles.rowBodyTight]}>
          {node.description !== undefined && (
            <DescriptionBlock
              text={node.description}
              scheme={scheme}
              onPress={() => setUI({ editingDescription: ref })}
            />
          )}
          {node.children !== undefined && (
            <ChildList parent={node} page={page} depth={depth + 1} insideMoving={childInsideMoving} />
          )}
        </View>
      )}
    </View>
  );
}

export const NodeView = memo(NodeViewImpl);

const styles = StyleSheet.create({
  // containers
  card: { borderWidth: 1, borderRadius: 12, marginBottom: 10, paddingHorizontal: 6, paddingVertical: 2 },
  row: {},
  moving: { opacity: 0.45 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4, minHeight: 40 },
  chevron: { width: 16, alignItems: 'center' },
  bullet: { width: 5, height: 5, borderRadius: 3 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  cardBody: { paddingHorizontal: 6, paddingBottom: 8 },
  rowBody: { marginLeft: 11, paddingLeft: 10, borderLeftWidth: 2, marginBottom: 4 },
  rowBodyTight: { marginLeft: 4, paddingLeft: 6 },
  childList: { gap: 0 },
  moreBtn: { width: 28, alignItems: 'center' },
  // value chip
  // Centered (not baseline-aligned) with tight line boxes, so the digits sit in the middle of the box.
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  chipLarge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  chipValue: { fontSize: 15, lineHeight: 18, fontWeight: '800', minWidth: 12, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false },
  chipValueLarge: { fontSize: 20, lineHeight: 24 },
  // description
  desc: { flexDirection: 'row', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  descText: { flex: 1, fontSize: 14, lineHeight: 20 },
  // misc
  empty: { fontSize: 13, fontStyle: 'italic', paddingVertical: 6, paddingHorizontal: 4 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 4,
  },
  addText: { fontSize: 13, fontWeight: '600' },
  dropSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 6,
    marginVertical: 3,
  },
  dropText: { fontSize: 12, fontWeight: '700' },
  movingTag: { fontSize: 12, fontWeight: '700' },
  intoBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  intoText: { fontSize: 12, fontWeight: '700' },
});
