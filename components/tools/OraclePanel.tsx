import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import { ORACLE_SECTIONS, type OracleSection } from '../../constants/oracleSections';
import { useGameStore } from '../../store/gameStore';
import { rollOracle } from '../../utils/oracle';
import GlassButton from '../ui/GlassButton';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

interface Props {
  scheme: ColorScheme;
}

export default function OraclePanel({ scheme }: Props) {
  const [results, setResults] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const oracleOpen = useGameStore((s) => s.prefs.oracleOpen);
  const setSectionOpen = useGameStore((s) => s.setOracleSectionOpen);

  const addResult = (text: string) => {
    setResults((prev) => [...prev, text]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const toggle = (section: OracleSection, isOpen: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionOpen(section.id, !isOpen);
  };

  return (
    <View style={styles.panel}>
      {/* Results box — pinned above everything so it stays in view while the sections scroll */}
      <View style={[styles.resultsBox, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          contentContainerStyle={styles.resultsContent}
        >
          {results.length === 0 ? (
            <Text style={[styles.resultsEmpty, { color: scheme.textMuted }]}>Ask the oracle...</Text>
          ) : (
            results.map((r, i) => (
              <Text key={i} style={[styles.resultText, { color: scheme.text }]}>
                {r}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Yes/no oracle — always one tap away */}
      <View style={styles.btnRow}>
        <GlassButton label="Oracle Unlikely" onPress={() => addResult(rollOracle('unlikely'))} scheme={scheme} variant="secondary" small style={{ flex: 1 }} />
        <GlassButton label="Oracle" onPress={() => addResult(rollOracle('even'))} scheme={scheme} variant="primary" style={{ flex: 1.5 }} />
        <GlassButton label="Oracle Likely" onPress={() => addResult(rollOracle('likely'))} scheme={scheme} variant="secondary" small style={{ flex: 1 }} />
      </View>

      {/* Collapsible generator sections */}
      <ScrollView style={styles.sections} contentContainerStyle={styles.sectionsContent} showsVerticalScrollIndicator={false}>
        {ORACLE_SECTIONS.map((section) => {
          const isOpen = oracleOpen[section.id] ?? !!section.defaultOpen;
          return (
            <View
              key={section.id}
              style={[styles.section, { borderColor: scheme.surfaceBorder, backgroundColor: scheme.surface }]}
            >
              <TouchableOpacity
                onPress={() => toggle(section, isOpen)}
                activeOpacity={0.7}
                style={styles.sectionHeader}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
              >
                <Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward'} size={16} color={scheme.primary} />
                <Text style={[styles.sectionTitle, { color: scheme.text }]} numberOfLines={1}>
                  {section.title}
                </Text>
                <Text style={[styles.sectionCount, { color: scheme.textMuted }]}>{section.generators.length}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.grid}>
                  {section.generators.length === 0 ? (
                    <Text style={[styles.empty, { color: scheme.textMuted }]}>No generators yet</Text>
                  ) : (
                    section.generators.map((g) => (
                      <GlassButton
                        key={g.id}
                        label={g.label}
                        onPress={() => addResult(g.roll())}
                        scheme={scheme}
                        variant="secondary"
                        small
                        style={styles.gridBtn}
                        textStyle={styles.gridBtnText}
                      />
                    ))
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultsBox: {
    height: 170,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  sections: {
    flex: 1,
  },
  sectionsContent: {
    gap: 10,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  // ~3 per row on a phone, more on wider screens; buttons grow to fill each row.
  gridBtn: {
    flexGrow: 1,
    flexBasis: 100,
    paddingHorizontal: 8,
  },
  gridBtnText: {
    textAlign: 'center',
  },
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
