import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';
import ModalSheet from './ModalSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  scheme: ColorScheme;
}

export default function OracleModal({ visible, onClose, scheme }: Props) {
  return (
    <ModalSheet visible={visible} onClose={onClose} scheme={scheme}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: scheme.text }]}>Oracle</Text>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={[styles.closeBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <BlurView intensity={20} tint={scheme.blurTint} style={StyleSheet.absoluteFillObject} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: scheme.surface }]} />
          <Text style={[styles.closeIcon, { color: scheme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyContent}>
        <Text style={[styles.emptyIcon]}>📜</Text>
        <Text style={[styles.emptyText, { color: scheme.textMuted }]}>
          Oracle tools coming soon...
        </Text>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
