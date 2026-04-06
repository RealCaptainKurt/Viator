import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  DimensionValue,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
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
 */
export default function ModalSheet({
  visible,
  onClose,
  scheme,
  height = '70%',
  keyboardAvoiding = false,
  contentStyle,
  children,
}: Props) {
  // Two-phase mount: `visible` controls the Modal, `ready` triggers animations
  // after the native views exist.
  const [showModal, setShowModal] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Phase 1: when visible goes true, mount the Modal.
  // When visible goes false, run exit animation then unmount.
  useEffect(() => {
    if (visible) {
      // Reset animated values before mounting
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_HEIGHT);
      setShowModal(true);
    } else if (showModal) {
      // Animate out, then unmount the Modal
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  // Phase 2: once the Modal is mounted (native views exist),
  // run the entrance animation.
  useEffect(() => {
    if (showModal && visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showModal]);

  if (!showModal) return null;

  // Resolve percentage height to pixels since the wrapper
  // has no explicit height for percentages to resolve against.
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
        style={[
          styles.sheetWrapper,
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
        pointerEvents="box-none"
      >
        <TouchableWithoutFeedback>
          <View style={[styles.sheet, { height: resolvedHeight, borderColor: scheme.surfaceBorder }]}>
            <BlurView intensity={40} tint={scheme.blurTint} style={StyleSheet.absoluteFillObject} />
            <View style={[styles.sheetInner, { backgroundColor: scheme.surface }, contentStyle]}>
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
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
