import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ACCENTS, ACCENT_IDS, type ColorScheme } from '../../constants/colorSchemes';
import type { AccentId } from '../../types';

interface Props {
  current: AccentId;
  onChange: (id: AccentId) => void;
  scheme: ColorScheme;
}

/** Row of the 8 accent swatches, shaded for the current light/dark mode. */
export default function AccentPicker({ current, onChange, scheme }: Props) {
  return (
    <View>
      <Text style={[styles.label, { color: scheme.textSecondary }]}>Accent Color</Text>
      <View style={styles.row}>
        {ACCENT_IDS.map((id) => {
          const selected = id === current;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => onChange(id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${ACCENTS[id].label} accent`}
              accessibilityState={{ selected }}
              style={[styles.ring, { borderColor: selected ? scheme.text : 'transparent' }]}
            >
              <View style={[styles.swatch, { backgroundColor: ACCENTS[id][scheme.mode] }]} />
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.name, { color: scheme.textSecondary }]}>{ACCENTS[current].label}</Text>
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ring: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  name: { fontSize: 12, marginTop: 6, letterSpacing: 0.3 },
});
