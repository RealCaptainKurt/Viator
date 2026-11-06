import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_ACCENT } from '../../constants/colorSchemes';
import { useScheme } from '../../hooks/useScheme';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import AccentModal from '../modals/AccentModal';

const SIDEBAR_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Left-side menu for secondary pages. Main pages live in the bottom tab bar. */
export default function Sidebar() {
  const scheme = useScheme();
  const insets = useSafeAreaInsets();
  const visible = useUIStore((s) => s.isSidebarOpen);
  const close = useUIStore((s) => s.closeSidebar);
  const game = useGameStore((s) => s.game);
  const setAccent = useGameStore((s) => s.setAccent);
  const setThemeMode = useGameStore((s) => s.setThemeMode);
  const [showAccents, setShowAccents] = useState(false);
  const isDark = scheme.mode === 'dark';

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: visible ? 0 : -SIDEBAR_WIDTH, duration: 230, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: visible ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible, translateX, backdrop]);

  const go = (href: Href) => {
    close();
    router.push(href);
  };

  const items: { icon: IconName; label: string; onPress: () => void; hidden?: boolean }[] = [
    { icon: 'palette-outline', label: 'Accent Color', onPress: () => setShowAccents(true), hidden: !game },
    { icon: 'swap-vertical', label: 'Import / Export', onPress: () => go('/import-export') },
    { icon: 'book-open-variant', label: 'Rules Reference', onPress: () => go('/rules-reference') },
  ];

  return (
    <>
      <Animated.View style={[styles.root, { opacity: backdrop }]} pointerEvents={visible ? 'auto' : 'none'}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.panel,
            { width: SIDEBAR_WIDTH, borderRightColor: scheme.surfaceBorder, transform: [{ translateX }] },
          ]}
        >
          <BlurView intensity={40} tint={scheme.blurTint} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.inner, { backgroundColor: scheme.background + 'd2', paddingTop: insets.top + 24 }]}>
            <Text style={[styles.appName, { color: scheme.text }]}>Viator</Text>
            <Text style={[styles.appSubtitle, { color: scheme.textSecondary }]}>Character Builder & Solo Engine</Text>
            <View style={[styles.divider, { backgroundColor: scheme.surfaceBorder }]} />
            <View style={styles.navItem}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={18} color={scheme.primary} />
              <Text style={[styles.navLabel, styles.navGrow, { color: scheme.text }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={(on) => setThemeMode(on ? 'dark' : 'light')}
                trackColor={{ true: scheme.primary, false: scheme.surfaceBorder }}
                thumbColor="#fff"
                // @ts-ignore - web only: without it the "on" thumb falls back to a teal default
                activeThumbColor="#fff"
                accessibilityLabel="Dark mode"
              />
            </View>
            {items
              .filter((i) => !i.hidden)
              .map((i) => (
                <TouchableOpacity key={i.label} onPress={i.onPress} style={styles.navItem} activeOpacity={0.7}>
                  <MaterialCommunityIcons name={i.icon} size={18} color={scheme.primary} />
                  <Text style={[styles.navLabel, { color: scheme.text }]}>{i.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </Animated.View>
      </Animated.View>
      <AccentModal
        visible={showAccents}
        onClose={() => setShowAccents(false)}
        current={game?.accent ?? DEFAULT_ACCENT}
        onChange={setAccent}
        scheme={scheme}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 },
  panel: { position: 'absolute', top: 0, left: 0, bottom: 0, overflow: 'hidden', borderRightWidth: 1 },
  inner: { flex: 1, paddingHorizontal: 20 },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, marginVertical: 18 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  navLabel: { fontSize: 16, fontWeight: '600' },
  navGrow: { flex: 1 },
});
