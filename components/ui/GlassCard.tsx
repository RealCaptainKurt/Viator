import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';

interface Props {
  scheme: ColorScheme;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  intensity?: number;
  noPadding?: boolean;
  /** Opaque fill instead of the translucent surface (for modals over a dimmed backdrop). */
  solid?: boolean;
}

export default function GlassCard({
  scheme,
  style,
  children,
  intensity = 20,
  noPadding = false,
  solid = false,
}: Props) {
  return (
    <View
      style={[
        styles.wrapper,
        { borderColor: scheme.surfaceBorder },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={scheme.blurTint}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.overlay,
          { backgroundColor: solid ? scheme.surfaceSolid : scheme.surface },
          !noPadding && styles.padding,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  overlay: {
    flexShrink: 0,
  },
  padding: {
    padding: 14,
  },
});
