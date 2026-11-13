import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { router, useNavigation } from 'expo-router';
import React, { useContext, useRef } from 'react';
import { Dimensions, PanResponder, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScheme } from '../../hooks/useScheme';
import { useUIStore } from '../../store/uiStore';

const SWIPE_THRESHOLD = Dimensions.get('window').width * 0.2;
/** Content column width cap so pages stay readable on desktop. */
export const CONTENT_MAX_WIDTH = 760;

const BUTTON_SIZE = 40;
const BUTTON_MARGIN = 10;
/**
 * Top padding that keeps a page's first row clear of the floating buttons.
 * Scrolling pages that opt into `underlay` apply this to their scroll content.
 */
export const FLOATING_INSET = BUTTON_SIZE + BUTTON_MARGIN * 2;

/**
 * Height of the floating tab bar covering the bottom of the page (0 off the
 * tab pages). `underlay` pages add it to their scroll content's bottom padding
 * so the last row can scroll clear of the bar.
 */
export function useTabBarOverlap(): number {
  return useContext(BottomTabBarHeightContext) ?? 0;
}

interface Props {
  /** 'menu' opens the sidebar (tab pages); 'back' pops the stack (extra pages). */
  leading?: 'menu' | 'back';
  /** Floating buttons shown top-right (use FloatingButton). */
  actions?: React.ReactNode;
  /** Include the bottom safe-area inset (pages without the tab bar). */
  bottomInset?: boolean;
  /**
   * Let the page's own scroll view run under the floating buttons. The page
   * must then pad its scroll content by FLOATING_INSET. Otherwise the scaffold
   * reserves that space itself.
   */
  underlay?: boolean;
  children: React.ReactNode;
}

export default function PageScaffold({ leading = 'menu', actions, bottomInset, underlay, children }: Props) {
  const scheme = useScheme();
  const openSidebar = useUIStore((s) => s.openSidebar);
  const overlap = useTabBarOverlap();
  const navigation = useNavigation();

  // Tab pages: swipe left/right anywhere to move to the next/previous tab.
  // Swiping right on the first tab opens the sidebar instead.
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        leading === 'menu' && Math.abs(g.dx) > 10 && Math.abs(g.dy) < 40 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        const flick = Math.abs(g.vx) > 0.5 && Math.abs(g.dx) > 40;
        if (Math.abs(g.dx) < SWIPE_THRESHOLD && !flick) return;
        // The screen's navigation object is stable, so the first render's copy is fine.
        const nav = navigation;
        const { routes, index } = nav.getState() ?? { routes: [], index: 0 };
        if (g.dx > 0) {
          if (index === 0) useUIStore.getState().openSidebar();
          else nav.navigate(routes[index - 1].name as never);
        } else if (index < routes.length - 1) {
          nav.navigate(routes[index + 1].name as never);
        }
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
      <SafeAreaView
        style={styles.root}
        edges={bottomInset ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
      >
        <View style={styles.column}>
          <View style={[styles.body, !underlay && { paddingTop: FLOATING_INSET, paddingBottom: overlap }]}>
            {children}
          </View>

          {/* Floating controls sit above the page content. */}
          <View style={styles.floatRow} pointerEvents="box-none">
            {leading === 'menu' ? (
              <FloatingButton icon="menu" label="Open menu" onPress={openSidebar} />
            ) : (
              <FloatingButton
                icon="arrow-back"
                label="Back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              />
            )}
            <View style={styles.actions} pointerEvents="box-none">
              {actions}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/** A round icon button that floats over page content. */
export function FloatingButton({
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
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={6}
      accessibilityLabel={label}
      accessibilityState={active === undefined ? undefined : { selected: active }}
      style={[
        styles.fab,
        { backgroundColor: active ? scheme.primary : scheme.surfaceSolid + 'ee', borderColor: scheme.surfaceBorder },
      ]}
    >
      <Ionicons name={icon} size={22} color={active ? scheme.background : scheme.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
  body: { flex: 1 },
  floatRow: {
    position: 'absolute',
    top: BUTTON_MARGIN,
    left: BUTTON_MARGIN,
    right: BUTTON_MARGIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
});
