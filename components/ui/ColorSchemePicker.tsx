import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLOR_SCHEMES, ColorScheme, DEFAULT_SCHEME } from '../../constants/colorSchemes';
import { ColorSchemeId } from '../../types';

interface Props {
  current: ColorSchemeId;
  onChange: (id: ColorSchemeId) => void;
  scheme: ColorScheme;
}

export default function ColorSchemePicker({ current, onChange, scheme }: Props) {
  return (
    <View>
      <Text style={[styles.label, { color: scheme.textSecondary }]}>Color Theme</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {(Object.values(COLOR_SCHEMES) as ColorScheme[]).map((cs) => (
          <TouchableOpacity
            key={cs.id}
            onPress={() => onChange(cs.id)}
            activeOpacity={0.8}
            style={[
              styles.swatch,
              { backgroundColor: cs.primary },
              current === cs.id && [
                styles.selected,
                { borderColor: scheme.text },
              ],
            ]}
          >
            <View
              style={[styles.swatchInner, { backgroundColor: cs.background }]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={[styles.schemeName, { color: scheme.textSecondary }]}>
        {(COLOR_SCHEMES[current] ?? COLOR_SCHEMES[DEFAULT_SCHEME]).label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  selected: {
    borderWidth: 2,
  },
  schemeName: {
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
