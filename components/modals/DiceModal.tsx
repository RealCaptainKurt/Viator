import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassButton from '../ui/GlassButton';
import ModalSheet from './ModalSheet';
import { generateId } from '../../utils/id';

interface DiceResult {
  id: string;
  dice: string;
  rolls: number[];
  total: number;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

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

  const roll = () => {
    const rolls = Array.from({ length: count }, () =>
      Math.floor(Math.random() * selectedDie) + 1
    );
    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    const result: DiceResult = {
      id: generateId(),
      dice: `${count}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`,
      rolls,
      total,
    };
    setHistory((h) => [result, ...h.slice(0, 19)]);
  };

  // One Page Solo Engine oracle roll
  const rollOpse = () => {
    const d6a = Math.floor(Math.random() * 6) + 1;
    const d6b = Math.floor(Math.random() * 6) + 1;
    const chaos = Math.floor(Math.random() * 6) + 1;

    let answer: string;
    const sum = d6a + d6b;
    if (sum <= 4) answer = 'No, and...';
    else if (sum <= 6) answer = 'No';
    else if (sum <= 8) answer = 'No, but...';
    else if (sum <= 10) answer = 'Yes, but...';
    else if (sum <= 12) answer = 'Yes';
    else answer = 'Yes, and...';

    const event = chaos <= 2 ? ' [Random Event!]' : '';
    const result: DiceResult = {
      id: generateId(),
      dice: `OPSE Oracle (${d6a}+${d6b}, chaos:${chaos})`,
      rolls: [d6a, d6b, chaos],
      total: sum,
    };
    // Overwrite total display with text
    setHistory((h) => [
      {
        ...result,
        dice: `Oracle → ${answer}${event}`,
      },
      ...h.slice(0, 19),
    ]);
  };

  return (
    <ModalSheet visible={visible} onClose={onClose} scheme={scheme}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: scheme.text }]}>Dice Roller</Text>
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

      {/* Die selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dieRow}>
        {DICE_TYPES.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setSelectedDie(d)}
            style={[
              styles.dieBtn,
              {
                backgroundColor:
                  selectedDie === d ? scheme.primary + '33' : scheme.surface,
                borderColor:
                  selectedDie === d ? scheme.primary : scheme.surfaceBorder,
              },
            ]}
          >
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
      </ScrollView>

      {/* Count & modifier */}
      <View style={styles.countRow}>
        <View style={styles.spinnerBox}>
          <Text style={[styles.spinnerLabel, { color: scheme.textSecondary }]}>
            Count
          </Text>
          <View style={styles.spinner}>
            <TouchableOpacity
              onPress={() => setCount((c) => Math.max(1, c - 1))}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <Text style={{ color: scheme.text, fontSize: 18 }}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.spinValue, { color: scheme.text }]}>{count}</Text>
            <TouchableOpacity
              onPress={() => setCount((c) => Math.min(20, c + 1))}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <Text style={{ color: scheme.text, fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spinnerBox}>
          <Text style={[styles.spinnerLabel, { color: scheme.textSecondary }]}>
            Modifier
          </Text>
          <View style={styles.spinner}>
            <TouchableOpacity
              onPress={() => setModifier((m) => m - 1)}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <Text style={{ color: scheme.text, fontSize: 18 }}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.spinValue, { color: scheme.text }]}>
              {modifier >= 0 ? `+${modifier}` : modifier}
            </Text>
            <TouchableOpacity
              onPress={() => setModifier((m) => m + 1)}
              style={[styles.spinBtn, { borderColor: scheme.surfaceBorder }]}
            >
              <Text style={{ color: scheme.text, fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.rollBtns}>
        <GlassButton
          label={`Roll ${count}d${selectedDie}`}
          onPress={roll}
          scheme={scheme}
          variant="primary"
          style={{ flex: 1 }}
        />
        <GlassButton
          label="Oracle"
          onPress={rollOpse}
          scheme={scheme}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      {/* History */}
      <ScrollView style={styles.history} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <Text style={[styles.emptyHistory, { color: scheme.textMuted }]}>
            Roll some dice!
          </Text>
        ) : null}
        {history.map((r) => (
          <View
            key={r.id}
            style={[
              styles.historyItem,
              { borderBottomColor: scheme.surfaceBorder },
            ]}
          >
            <Text style={[styles.historyDice, { color: scheme.textSecondary }]}>
              {r.dice}
            </Text>
            <Text style={[styles.historyTotal, { color: scheme.primary }]}>
              {r.dice.startsWith('Oracle') ? '' : r.total}
            </Text>
            {!r.dice.startsWith('Oracle') && r.rolls.length > 1 ? (
              <Text style={[styles.historyRolls, { color: scheme.textMuted }]}>
                [{r.rolls.join(', ')}]
              </Text>
            ) : null}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  dieRow: {
    marginBottom: 16,
  },
  dieBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
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
  rollBtns: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  history: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  historyDice: {
    flex: 1,
    fontSize: 13,
  },
  historyTotal: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 40,
    textAlign: 'right',
  },
  historyRolls: {
    fontSize: 11,
    minWidth: 60,
    textAlign: 'right',
  },
  emptyHistory: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});
