import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  DimensionValue,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDE_DURATION = 320;
const DISMISS_THRESHOLD = 120;
const DISMISS_VELOCITY = 0.8;

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
 * Swipe down anywhere on the sheet (header, handle, non-scroll content)
 * to dismiss. Swipe up resists and springs back.
 */
export default function ModalSheet({
  visible,
  onClose,
  scheme,
  height = '75%',
  keyboardAvoiding = false,
  contentStyle,
  children,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const totalTranslateY = useRef(Animated.add(sheetTranslateY, dragY)).current;

  // Keep a stable ref to onClose so the PanResponder closure is never stale.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const panResponder = useRef(
    PanResponder.create({
      // Claim the touch from the start. This is safe because React Native resolves
      // the responder bottom-up: deeper views (TouchableOpacity, ScrollView) are
      // asked first and win for their own areas. This view only wins for empty areas
      // like the drag handle and the header background.
      onStartShouldSetPanResponder: () => true,
      // Don't steal from ScrollViews that already own the touch.
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (_, { dy }) => {
        // Resist upward drags; allow downward drags 1:1.
        dragY.setValue(dy < 0 ? dy * 0.25 : dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > DISMISS_VELOCITY) {
          Animated.parallel([
            Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(dragY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
          ]).start(() => {
            setShowModal(false);
            onCloseRef.current();
          });
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }).start();
        }
      },
    })
  ).current;

  // Phase 1: mount/unmount the Modal.
  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_HEIGHT);
      dragY.setValue(0);
      setShowModal(true);
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }),
      ]).start(() => {
        setShowModal(false);
        dragY.setValue(0);
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
        style={[styles.sheetWrapper, { transform: [{ translateY: totalTranslateY }] }]}
        pointerEvents="box-none"
      >
        {/*
          panHandlers on the sheet View itself — covers the drag handle, header,
          and any non-scrollable area. onStartShouldSetPanResponder=false means
          buttons still fire on tap; ScrollViews keep their responder while scrolling.
        */}
        <View
          style={[styles.sheet, { height: resolvedHeight, borderColor: scheme.surfaceBorder }]}
          {...panResponder.panHandlers}
        >
          <BlurView intensity={40} tint={scheme.blurTint} style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]} />
          {/* Visual drag handle */}
          <View style={styles.handleZone}>
            <View style={[styles.handle, { backgroundColor: scheme.textMuted }]} />
          </View>
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
  handleZone: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.35,
  },
  sheetInner: {
    padding: 24,
    flex: 1,
  },
});
