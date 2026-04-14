import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';
import GlassCard from './GlassCard';

interface Props {
  visible: boolean;
  onClose: () => void;
  scheme: ColorScheme;
  title?: string;
  maxWidth?: number;
  cardStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Shared centered-modal overlay used for editing modals (traits, named items,
 * text content, add-item dialogs). Provides a blurred backdrop, tap-to-dismiss,
 * keyboard avoidance, and a GlassCard container.
 */
export default function ModalOverlay({
  visible,
  onClose,
  scheme,
  title,
  maxWidth = 420,
  cardStyle,
  children,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            {/* On web, DOM clicks bubble so we stop propagation at the card to prevent
                the outer TouchableWithoutFeedback from closing the modal when
                tapping inputs inside the card. On native the onClick prop is ignored
                and the nested TouchableWithoutFeedback responder chain handles it. */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                // @ts-ignore - web only: stops click from bubbling to backdrop dismiss handler
                onClick={(e: any) => e.stopPropagation()}
              >
                <GlassCard
                  scheme={scheme}
                  style={cardStyle ? [styles.card, { maxWidth }, cardStyle] : [styles.card, { maxWidth }]}
                >
                  {title ? (
                    <Text style={[styles.title, { color: scheme.text }]}>
                      {title}
                    </Text>
                  ) : null}
                  {children}
                </GlassCard>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
});
