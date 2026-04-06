import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';

interface Props {
  scheme: ColorScheme;
  onDicePress: () => void;
  onOraclePress: () => void;
}

export default function FloatingToolbar({ scheme, onDicePress, onOraclePress }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <TouchableOpacity
          onPress={onDicePress}
          activeOpacity={0.7}
          style={[styles.fab, { borderColor: scheme.surfaceBorder }]}
        >
          <BlurView
            intensity={30}
            tint={scheme.blurTint}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: scheme.surface }]} />
          <Text style={[styles.fabIcon, { color: scheme.text }]}>🎲</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOraclePress}
          activeOpacity={0.7}
          style={[styles.fab, { borderColor: scheme.surfaceBorder }]}
        >
          <BlurView
            intensity={30}
            tint={scheme.blurTint}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: scheme.surface }]} />
          <Text style={[styles.fabIcon, { color: scheme.text }]}>📜</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 28,
    paddingHorizontal: 28,
    zIndex: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
});
