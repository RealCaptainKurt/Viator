import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScheme } from '../../hooks/useScheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'Characters', icon: 'bookshelf', iconActive: 'bookshelf' },
  character: { label: 'Character', icon: 'account-outline', iconActive: 'account' },
  dice: { label: 'Dice', icon: 'dice-multiple-outline', iconActive: 'dice-multiple' },
  campaign: { label: 'Campaign', icon: 'map-outline', iconActive: 'map' },
  oracle: { label: 'Oracle', icon: 'script-text-outline', iconActive: 'script-text' },
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const scheme = useScheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: scheme.bar, borderTopColor: scheme.barBorder, paddingBottom: Math.max(insets.bottom, 6) },
      ]}
    >
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
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  pill: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 16 },
});
