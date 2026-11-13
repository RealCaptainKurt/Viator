import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React, { useContext } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScheme } from '../../hooks/useScheme';
import MoveBanner from './MoveBanner';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Tab order here is the swipe order (see PageScaffold). */
export const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'Characters', icon: 'bookshelf', iconActive: 'bookshelf' },
  character: { label: 'Character', icon: 'account-outline', iconActive: 'account' },
  dice: { label: 'Dice', icon: 'dice-multiple-outline', iconActive: 'dice-multiple' },
  campaign: { label: 'Campaign', icon: 'map-outline', iconActive: 'map' },
  oracle: { label: 'Oracle', icon: 'script-text-outline', iconActive: 'script-text' },
};

/**
 * Bottom bar that floats over the pages, so content scrolls behind its frosted
 * fill. On the web it is `position: fixed` against the window bottom, which
 * also lets mobile Safari tint its own toolbar area to match the bar.
 * Pages pad their scroll content by its height (useTabBarOverlap).
 */
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const scheme = useScheme();
  const insets = useSafeAreaInsets();
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);

  return (
    <View style={styles.float} onLayout={(e) => reportHeight?.(e.nativeEvent.layout.height)}>
      {/* Solid base: the banner's own wash is translucent. */}
      <View style={{ backgroundColor: scheme.background }}>
        <MoveBanner />
      </View>
      <View style={[styles.bar, { borderTopColor: scheme.barBorder, paddingBottom: Math.max(insets.bottom, 6) }]}>
        <BlurView intensity={30} tint={scheme.blurTint} style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: scheme.bar + 'd9' }]} />
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === i;
          const color = focused ? scheme.primary : scheme.textMuted;
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.pill, focused && { backgroundColor: scheme.primaryMuted }]}>
                <MaterialCommunityIcons name={focused ? tab.iconActive : tab.icon} size={26} color={color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  float: {
    // 'fixed' is web-only CSS; react-native's types only know absolute/relative.
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as ViewStyle['position'],
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    overflow: 'hidden',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  pill: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 16 },
});
