import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        { backgroundColor: scheme.background, borderTopColor: scheme.surfaceBorder, paddingBottom: Math.max(insets.bottom, 6) },
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
            <MaterialCommunityIcons name={focused ? tab.iconActive : tab.icon} size={24} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {tab.label}
            </Text>
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
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 2 },
  label: { fontSize: 11, fontWeight: '600' },
});
