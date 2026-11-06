import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, PanResponder, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScheme } from '../../hooks/useScheme';
import { useUIStore } from '../../store/uiStore';

const SWIPE_THRESHOLD = Dimensions.get('window').width * 0.2;
/** Content column width cap so pages stay readable on desktop. */
export const CONTENT_MAX_WIDTH = 760;

interface Props {
  title: string;
  /** 'menu' opens the sidebar (tab pages); 'back' pops the stack (extra pages). */
  leading?: 'menu' | 'back';
  actions?: React.ReactNode;
  /** Include the bottom safe-area inset (pages without the tab bar). */
  bottomInset?: boolean;
  children: React.ReactNode;
}

export default function PageScaffold({ title, leading = 'menu', actions, bottomInset, children }: Props) {
  const scheme = useScheme();
  const openSidebar = useUIStore((s) => s.openSidebar);

  // Swipe right anywhere to open the sidebar (tab pages only).
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        leading === 'menu' && g.dx > 8 && Math.abs(g.dy) < 40 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) useUIStore.getState().openSidebar();
      },
    }),
  ).current;

  return (
    <View style={styles.root} {...pan.panHandlers}>
      <StatusBar barStyle={scheme.blurTint === 'light' ? 'dark-content' : 'light-content'} />
      <LinearGradient
        colors={[scheme.backgroundGradientStart, scheme.backgroundGradientEnd]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.root} edges={bottomInset ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}>
        <View style={styles.column}>
          <View style={styles.topBar}>
            {leading === 'menu' ? (
              <TouchableOpacity onPress={openSidebar} style={styles.iconBtn} hitSlop={8} accessibilityLabel="Open menu">
                <Ionicons name="menu" size={26} color={scheme.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                style={styles.iconBtn}
                hitSlop={8}
                accessibilityLabel="Back"
              >
                <Ionicons name="arrow-back" size={24} color={scheme.text} />
              </TouchableOpacity>
            )}
            <Text style={[styles.title, { color: scheme.text }]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.actions}>{actions}</View>
          </View>
          <View style={styles.body}>{children}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/** A small icon button for the top bar's action slot. */
export function TopBarButton({
  icon,
  onPress,
  active,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  label: string;
}) {
  const scheme = useScheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} hitSlop={8} accessibilityLabel={label}>
      <Ionicons name={icon} size={22} color={active ? scheme.primary : scheme.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minHeight: 52,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1 },
});
