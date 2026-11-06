import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import type { ColorScheme } from '../../constants/colorSchemes';

interface Props {
  /** Draft text, so a field can be briefly empty or "-" while typing. */
  value: string;
  onChange: (value: string) => void;
  scheme: ColorScheme;
  autoFocus?: boolean;
  keyboardType?: KeyboardTypeOptions;
  style?: ViewStyle;
}

/** A centered number box with a minus button on the left and a plus button on the right. */
export default function NumberStepper({ value, onChange, scheme, autoFocus, keyboardType = 'number-pad', style }: Props) {
  const adjust = (delta: number) => onChange(String((parseInt(value, 10) || 0) + delta));

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        onPress={() => adjust(-1)}
        style={[styles.adjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
        activeOpacity={0.7}
        accessibilityLabel="Decrease"
      >
        <Text style={[styles.adjustText, { color: scheme.destructive }]}>−</Text>
      </TouchableOpacity>

      <TextInput
        value={value}
        onChangeText={(v) => {
          if (v === '' || v === '-' || /^-?\d+$/.test(v)) onChange(v);
        }}
        keyboardType={keyboardType}
        style={[styles.input, { color: scheme.primary, borderColor: scheme.surfaceBorder, backgroundColor: scheme.primaryMuted }]}
        selectionColor={scheme.primary}
        selectTextOnFocus
        autoFocus={autoFocus}
      />

      <TouchableOpacity
        onPress={() => adjust(1)}
        style={[styles.adjustBtn, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
        activeOpacity={0.7}
        accessibilityLabel="Increase"
      >
        <Text style={[styles.adjustText, { color: scheme.primary }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
