import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useScheme } from '../../hooks/useScheme';
import { useUIStore } from '../../store/uiStore';

/** Shown above the tab bar while a node is picked up, on every page. */
export default function MoveBanner() {
  const scheme = useScheme();
  const moving = useUIStore((s) => s.moving);
  const cancel = useUIStore((s) => s.cancelMove);
  if (!moving) return null;

  return (
    <View style={[styles.banner, { backgroundColor: scheme.primaryMuted, borderColor: scheme.primary + '66' }]}>
      <MaterialCommunityIcons name="cursor-move" size={18} color={scheme.primary} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: scheme.text }]} numberOfLines={1}>
          Moving “{moving.name || 'Untitled'}”
        </Text>
        <Text style={[styles.hint, { color: scheme.textSecondary }]}>
          Tap a drop spot. You can switch between Character and Campaign.
        </Text>
      </View>
      <TouchableOpacity onPress={cancel} style={[styles.cancel, { borderColor: scheme.surfaceBorder }]}>
        <Text style={[styles.cancelText, { color: scheme.text }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12, marginTop: 1 },
  cancel: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  cancelText: { fontSize: 13, fontWeight: '600' },
});
