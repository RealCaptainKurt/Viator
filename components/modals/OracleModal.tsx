import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import {
  rollActionFocus,
  rollDetailFocus,
  rollDungeonLoot,
  rollDungeonRoom,
  rollDungeonTheme,
  rollFailureMove,
  rollGroup,
  rollHowMuch,
  rollNPC,
  rollOracle,
  rollPacingMove,
  rollPlotHook,
  rollRandomEvent,
  rollSetScene,
  rollTopicFocus,
  rollTown,
  rollMagicPower,
  rollRandomItem,
  rollMagicItem,
  rollWorld,
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
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const addResult = (text: string) => {
    setResults((prev) => [...prev, text]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const goToPage2 = () => {
    Animated.timing(slideAnim, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  };

  const goToPage1 = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 240, useNativeDriver: true }).start();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -containerWidth],
  });

  return (
    <ModalSheet visible={visible} onClose={onClose} scheme={scheme} height="85%">
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: scheme.text }]}>Oracle</Text>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={[styles.closeBtn, { borderColor: scheme.surfaceBorder }]}
        >
          <BlurView intensity={20} tint={scheme.blurTint} style={[StyleSheet.absoluteFillObject, { borderRadius: 28 }]} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: scheme.surface, borderRadius: 28 }]} />
          <Ionicons name="close" size={22} color={scheme.textSecondary} />
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
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled
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

      {/* Button pages — overflow hidden clips the off-screen page */}
      <View
        style={styles.pagesContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.pagesSlider,
            { width: containerWidth * 2, transform: [{ translateX }] },
          ]}
        >
          {/* ── Page 1 ── */}
          <View style={{ width: containerWidth }}>
            {/* Row 1: Recluse oracle — Unlikely | Oracle | Likely */}
            <View style={styles.btnRow}>
              <GlassButton label="Oracle Unlikely" onPress={() => addResult(rollOracle('unlikely'))} scheme={scheme} variant="secondary" small style={{ flex: 1 }} />
              <GlassButton label="Oracle" onPress={() => addResult(rollOracle('even'))} scheme={scheme} variant="primary" style={{ flex: 1.5 }} />
              <GlassButton label="Oracle Likely" onPress={() => addResult(rollOracle('likely'))} scheme={scheme} variant="secondary" small style={{ flex: 1 }} />
            </View>
            {/* Row 2: OPSE scene tools */}
            <View style={styles.btnRow}>
              <GlassButton label="Set a Scene" onPress={() => addResult(rollSetScene())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="How Much" onPress={() => addResult(rollHowMuch())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Random Event" onPress={() => addResult(rollRandomEvent())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
            </View>
            {/* Row 3: OPSE focus draws */}
            <View style={styles.btnRow}>
              <GlassButton label="Action / Activity" onPress={() => addResult(rollActionFocus())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Detail / Type" onPress={() => addResult(rollDetailFocus())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Topic / Focus" onPress={() => addResult(rollTopicFocus())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
            </View>
            {/* Row 4: OPSE GM moves */}
            <View style={styles.btnRow}>
              <GlassButton label="Pacing Move" onPress={() => addResult(rollPacingMove())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Failure Move" onPress={() => addResult(rollFailureMove())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="More >" onPress={goToPage2} scheme={scheme} variant="ghost" style={{ flex: 1 }} />
            </View>
          </View>

          {/* ── Page 2 ── */}
          <View style={{ width: containerWidth }}>
            {/* Row 1: Dungeon */}
            <View style={styles.btnRow}>
              <GlassButton label="Dungeon Theme" onPress={() => addResult(rollDungeonTheme())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Dungeon Room" onPress={() => addResult(rollDungeonRoom())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Dungeon Loot" onPress={() => addResult(rollDungeonLoot())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
            </View>
            {/* Row 2: People & Places */}
            <View style={styles.btnRow}>
              <GlassButton label="NPC" onPress={() => addResult(rollNPC())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Group" onPress={() => addResult(rollGroup())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Town" onPress={() => addResult(rollTown())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
            </View>
            {/* Row 3: Magic & Items */}
            <View style={styles.btnRow}>
              <GlassButton label="Magic / Power" onPress={() => addResult(rollMagicPower())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Random Item" onPress={() => addResult(rollRandomItem())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="Magic Item" onPress={() => addResult(rollMagicItem())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
            </View>
            {/* Row 4: Misc & Back */}
            <View style={styles.btnRow}>
              <GlassButton label="Plot Hook" onPress={() => addResult(rollPlotHook())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="World" onPress={() => addResult(rollWorld())} scheme={scheme} variant="secondary" style={{ flex: 1 }} />
              <GlassButton label="< Back" onPress={goToPage1} scheme={scheme} variant="ghost" style={{ flex: 1 }} />
            </View>
          </View>
        </Animated.View>
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
  pagesContainer: {
    overflow: 'hidden',
  },
  pagesSlider: {
    flexDirection: 'row',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
});
