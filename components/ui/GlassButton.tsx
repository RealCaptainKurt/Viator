import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import GlassHighlight from './GlassHighlight';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface Props {
  label: string;
  onPress: () => void;
  scheme: ColorScheme;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
}

export default function GlassButton({
  label,
  onPress,
  scheme,
  variant = 'primary',
  style,
  textStyle,
  disabled,
  loading,
  small,
}: Props) {
  const bg =
    variant === 'primary'
      ? scheme.primary + '33'
      : variant === 'destructive'
      ? scheme.destructive + '33'
      : variant === 'secondary'
      ? scheme.surface
      : 'transparent';

  const border =
    variant === 'primary'
      ? scheme.primary + '66'
      : variant === 'destructive'
      ? scheme.destructive + '66'
      : variant === 'secondary'
      ? scheme.surfaceBorder
      : 'transparent';

  const color =
    variant === 'primary'
      ? scheme.primary
      : variant === 'destructive'
      ? scheme.destructive
      : variant === 'secondary'
      ? scheme.text
      : scheme.textSecondary;

  const borderRadius = small ? 9 : 12;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.btn,
        small && styles.small,
        { backgroundColor: bg, borderColor: border },
        disabled && styles.disabled,
        style,
      ]}
    >
      <BlurView
        intensity={15}
        tint={scheme.blurTint}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      <GlassHighlight borderRadius={borderRadius} />
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={[styles.label, { color }, small && styles.smallLabel, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  small: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 9,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  smallLabel: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.4,
  },
});
