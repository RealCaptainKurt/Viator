import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';

interface Props extends TextInputProps {
  scheme: ColorScheme;
  label?: string;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  minHeight?: number;
}

export default function GlassInput({
  scheme,
  label,
  containerStyle,
  multiline,
  minHeight,
  style,
  ...rest
}: Props) {
  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: scheme.textSecondary }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={scheme.textMuted}
        {...rest}
        multiline={multiline}
        style={[
          styles.input,
          {
            color: scheme.text,
            backgroundColor: scheme.surface,
            borderColor: scheme.surfaceBorder,
            minHeight: multiline ? (minHeight ?? 80) : undefined,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
