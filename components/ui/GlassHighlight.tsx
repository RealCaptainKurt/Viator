import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

interface Props {
  borderRadius: number;
}

// Ratio of the horizontal/vertical gradient component.
// A = 3/7 gives highlight coverage of 70% of top/bottom edges and 30% of side edges;
// shadows get the complementary 30%/70%.
// All 4 gradient endpoints stay within [0,1]×[0,1] — no out-of-bounds clamping issues.
const A = 3 / 7;

// Gradient fraction where the bright→transparent transition midpoint falls.
// Both (0.7, 0) on the top edge and (0, 0.3) on the left edge project to this value
// on the highlight axis, so the coverage is exactly 70%/30%.
const CUT = (0.7 * A) / (A * A + 1); // ≈ 0.253

const HALF_SOFT_PX = 5; // half of the desired pixel-space transition width

const WHITE: readonly [string, string, string, string] = [
  'rgba(255, 255, 255, 0.6)',
  'rgba(255, 255, 255, 0.6)',
  'rgba(255, 255, 255, 0)',
  'rgba(255, 255, 255, 0)',
];

const BLACK: readonly [string, string, string, string] = [
  'rgba(0, 0, 0, 0.4)',
  'rgba(0, 0, 0, 0.4)',
  'rgba(0, 0, 0, 0)',
  'rgba(0, 0, 0, 0)',
];

export default function GlassHighlight({ borderRadius }: Props) {
  const [sz, setSz] = useState({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSz(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
  };

  const { w, h } = sz;

  // Highlight axes run in direction (A, 1) → pixel length sqrt((Aw)² + h²).
  // Shadow axes run in direction (1, A) → pixel length sqrt(w² + (Ah)²).
  const hLen = Math.sqrt((A * w) ** 2 + h ** 2);
  const sLen = Math.sqrt(w ** 2 + (A * h) ** 2);

  const hHalf = hLen > 0 ? HALF_SOFT_PX / hLen : 0.025;
  const sHalf = sLen > 0 ? HALF_SOFT_PX / sLen : 0.025;

  const hLocs: [number, number, number, number] = [
    0,
    Math.max(0, CUT - hHalf),
    Math.min(1, CUT + hHalf),
    1,
  ];

  const sLocs: [number, number, number, number] = [
    0,
    Math.max(0, CUT - sHalf),
    Math.min(1, CUT + sHalf),
    1,
  ];

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}
      onLayout={onLayout}
      pointerEvents="none"
    >
      {w > 0 && (
        <MaskedView
          style={StyleSheet.absoluteFillObject}
          maskElement={
            <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius,
                  borderWidth: 1,
                  borderColor: 'white',
                  backgroundColor: 'transparent',
                },
              ]}
            />
          }
        >
          {/* Top-left highlight: bright at corner (0,0), fades toward (A, 1) */}
          <LinearGradient
            colors={WHITE}
            locations={hLocs}
            start={{ x: 0, y: 0 }}
            end={{ x: A, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Bottom-right highlight: bright at corner (1,1), fades toward (1−A, 0) */}
          <LinearGradient
            colors={WHITE}
            locations={hLocs}
            start={{ x: 1, y: 1 }}
            end={{ x: 1 - A, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Top-right shadow: dark at corner (1,0), fades toward (0, A) */}
          <LinearGradient
            colors={BLACK}
            locations={sLocs}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: A }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Bottom-left shadow: dark at corner (0,1), fades toward (1, 1−A) */}
          <LinearGradient
            colors={BLACK}
            locations={sLocs}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 1 - A }}
            style={StyleSheet.absoluteFillObject}
          />
        </MaskedView>
      )}
    </View>
  );
}
