import GlassHighlight from '../ui/GlassHighlight';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import {
  rollActionFocus,
  rollDetailFocus,
  rollFailureMove,
  rollHowMuch,
  rollOracle,
  rollPacingMove,
  rollRandomEvent,
  rollSetScene,
  rollTopicFocus,
} from '../../utils/oracle';
import GlassButton from '../ui/GlassButton';
import ModalSheet from './ModalSheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  scheme: ColorScheme;
}

export default function OracleModal({ visible, onClose, scheme }: Props) {
  const [results, setResults] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const addResult = (text: string) => {
    setResults((prev) => [...prev, text]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} scheme={scheme} height="75%">
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: scheme.text }]}>Oracle</Text>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={[styles.closeBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <BlurView intensity={20} tint={scheme.blurTint} style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: scheme.surface, borderRadius: 16 }]} />
          <GlassHighlight borderRadius={16} />
          <Ionicons name="close" size={16} color={scheme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Results box */}
      <View
        style={[
          styles.resultsBox,
          { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContent}
        >
          {results.length === 0 ? (
            <Text style={[styles.resultsEmpty, { color: scheme.textMuted }]}>
              Ask the oracle...
            </Text>
          ) : (
            results.map((r, i) => (
              <Text key={i} style={[styles.resultText, { color: scheme.text }]}>
                {r}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Row 1: Recluse oracle — Unlikely | Oracle | Likely */}
      <View style={styles.btnRow}>
        <GlassButton
          label="Oracle Unlikely"
          onPress={() => addResult(rollOracle('unlikely'))}
          scheme={scheme}
          variant="secondary"
          small
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Oracle"
          onPress={() => addResult(rollOracle('even'))}
          scheme={scheme}
          variant="primary"
          style={{ flex: 1.5 }}
        />
        <GlassButton
          label="Oracle Likely"
          onPress={() => addResult(rollOracle('likely'))}
          scheme={scheme}
          variant="secondary"
          small
          style={{ flex: 1 }}
        />
      </View>

      {/* Row 2: OPSE scene tools */}
      <View style={styles.btnRow}>
        <GlassButton
          label="Set a Scene"
          onPress={() => addResult(rollSetScene())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="How Much"
          onPress={() => addResult(rollHowMuch())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Random Event"
          onPress={() => addResult(rollRandomEvent())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      {/* Row 3: OPSE focus draws */}
      <View style={styles.btnRow}>
        <GlassButton
          label="Action / Activity"
          onPress={() => addResult(rollActionFocus())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Detail / Type"
          onPress={() => addResult(rollDetailFocus())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Topic / Focus"
          onPress={() => addResult(rollTopicFocus())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      {/* Row 4: OPSE GM moves */}
      <View style={styles.btnRow}>
        <GlassButton
          label="Pacing Move"
          onPress={() => addResult(rollPacingMove())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Failure Move"
          onPress={() => addResult(rollFailureMove())}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="More >"
          onPress={() => {}}
          scheme={scheme}
          variant="ghost"
          disabled
          style={{ flex: 1 }}
        />
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  resultsBox: {
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  resultsContent: {
    padding: 10,
    gap: 6,
  },
  resultsEmpty: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  resultText: {
    fontSize: 13,
    lineHeight: 19,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
});
