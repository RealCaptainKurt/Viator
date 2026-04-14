import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  DimensionValue,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDE_DURATION = 320;

interface Props {
  visible: boolean;
  onClose: () => void;
  scheme: ColorScheme;
  height?: DimensionValue;
  keyboardAvoiding?: boolean;
  contentStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Standard bottom-sheet modal wrapper used across the app.
 * The backdrop blurs in immediately while the sheet slides up
 * from the bottom independently, avoiding the awkward
 * "blur-slides-with-content" look of animationType="slide".
 *
 * Dismiss by tapping the backdrop or the X button inside the modal.
 */
export default function ModalSheet({
  visible,
  onClose,
  scheme,
  height = '85%',
  keyboardAvoiding = false,
  contentStyle,
  children,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Phase 1: mount/unmount the Modal.
  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_HEIGHT);
      setShowModal(true);
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  // Phase 2: entrance animation after native views exist.
  useEffect(() => {
    if (showModal && visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: SLIDE_DURATION, useNativeDriver: true }),
      ]).start();
    }
  }, [showModal]);

  if (!showModal) return null;

  const resolvedHeight =
    typeof height === 'string' && height.endsWith('%')
      ? (parseFloat(height) / 100) * SCREEN_HEIGHT
      : height;

  const inner = (
    <View style={styles.backdrop}>
      {/* Blurred backdrop — fades in independently */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}>
        <BlurView intensity={30} tint={scheme.blurTint} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      {/* Full-screen dismiss target */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Sheet — slides up from bottom independently */}
      <Animated.View
        style={[styles.sheetWrapper, { transform: [{ translateY: sheetTranslateY }] }]}
        pointerEvents="box-none"
      >
        <View
          style={[styles.sheet, { height: resolvedHeight, borderColor: scheme.surfaceBorder }]}
        >
          <BlurView intensity={40} tint={scheme.blurTint} style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]} />
          <View style={[styles.sheetInner, { backgroundColor: scheme.surface }, contentStyle]}>
            {children}
          </View>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : inner}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  sheetInner: {
    padding: 24,
    flex: 1,
  },
});
