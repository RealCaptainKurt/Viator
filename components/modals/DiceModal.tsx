import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import GlassHighlight from '../ui/GlassHighlight';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from '../ui/GlassButton';
import ModalSheet from './ModalSheet';
import { generateId } from '../../utils/id';

interface DiceResult {
  id: string;
  label: string;
  rolls: number[];
  total: number;
}

const DICE_ROW1 = [6, 20, 100];
const DICE_ROW2 = [4, 8, 10, 12];

interface Props {
  visible: boolean;
  onClose: () => void;
  scheme: ColorScheme;
}

export default function DiceModal({ visible, onClose, scheme }: Props) {
  const [count, setCount] = useState(1);
  const [selectedDie, setSelectedDie] = useState(6);
  const [modifier, setModifier] = useState(0);
  const [history, setHistory] = useState<DiceResult[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const roll = () => {
    const rolls = Array.from({ length: count }, () =>
      Math.floor(Math.random() * selectedDie) + 1
    );
    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
    const result: DiceResult = {
      id: generateId(),
      label: `${count}d${selectedDie}${modStr}`,
      rolls,
      total,
    };
    setHistory((h) => [...h.slice(-19), result]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const rollLabel = (() => {
    const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
    return `Roll ${count}d${selectedDie}${modStr}`;
  })();

  const renderDieRow = (dice: number[]) => (
    <View style={styles.dieRow}>
      {dice.map((d) => (
        <TouchableOpacity
          key={d}
          onPress={() => setSelectedDie(d)}
          style={[
            styles.dieBtn,
            {
              backgroundColor: selectedDie === d ? scheme.primary + '33' : scheme.surface,
              borderColor: selectedDie === d ? scheme.primary : scheme.surfaceBorder,
            },
          ]}
        >
          <GlassHighlight borderRadius={10} />
          <Text
            style={[
              styles.dieBtnText,
              { color: selectedDie === d ? scheme.primary : scheme.textSecondary },
            ]}
          >
            d{d}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ModalSheet visible={visible} onClose={onClose} scheme={scheme}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: scheme.text }]}>Dice Roller</Text>
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
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.resultsContent}
        >
          {history.length === 0 ? (
            <Text style={[styles.resultsEmpty, { color: scheme.textMuted }]}>
              Roll some dice!
            </Text>
          ) : (
            history.map((r) => (
              <View key={r.id} style={styles.historyItem}>
                <Text style={[styles.historyLabel, { color: scheme.textSecondary }]}>
                  {r.label}
                </Text>
                {r.rolls.length > 1 && (
                  <Text style={[styles.historyRolls, { color: scheme.textMuted }]}>
                    [{r.rolls.join(', ')}]
                  </Text>
                )}
                <Text style={[styles.historyTotal, { color: scheme.primary }]}>
                  = {r.total}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Die selector — two rows */}
      <View style={styles.diceGrid}>
        {renderDieRow(DICE_ROW1)}
        {renderDieRow(DICE_ROW2)}
      </View>

      {/* Count & modifier */}
      <View style={styles.countRow}>
        <View style={styles.spinnerBox}>
          <Text style={[styles.spinnerLabel, { color: scheme.textSecondary }]}>Count</Text>
          <View style={styles.spinner}>
            <TouchableOpacity
              onPress={() => setCount((c) => Math.max(1, c - 1))}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <GlassHighlight borderRadius={8} />
              <Text style={{ color: scheme.text, fontSize: 18 }}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.spinValue, { color: scheme.text }]}>{count}</Text>
            <TouchableOpacity
              onPress={() => setCount((c) => Math.min(20, c + 1))}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <GlassHighlight borderRadius={8} />
              <Text style={{ color: scheme.text, fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spinnerBox}>
          <Text style={[styles.spinnerLabel, { color: scheme.textSecondary }]}>Modifier</Text>
          <View style={styles.spinner}>
            <TouchableOpacity
              onPress={() => setModifier((m) => m - 1)}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <GlassHighlight borderRadius={8} />
              <Text style={{ color: scheme.text, fontSize: 18 }}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.spinValue, { color: scheme.text }]}>
              {modifier >= 0 ? `+${modifier}` : modifier}
            </Text>
            <TouchableOpacity
              onPress={() => setModifier((m) => m + 1)}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <GlassHighlight borderRadius={8} />
              <Text style={{ color: scheme.text, fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Roll button */}
      <GlassButton
        label={rollLabel}
        onPress={roll}
        scheme={scheme}
        variant="primary"
      />
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
    height: 130,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  resultsContent: {
    padding: 10,
    gap: 4,
  },
  resultsEmpty: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyRolls: {
    fontSize: 12,
    flex: 1,
  },
  historyTotal: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 'auto',
  },
  diceGrid: {
    gap: 8,
    marginBottom: 16,
  },
  dieRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dieBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dieBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  spinnerBox: {
    flex: 1,
    gap: 6,
  },
  spinnerLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  spinner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});
