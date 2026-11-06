import React from 'react';
import type { ColorScheme } from '../../constants/colorSchemes';
import type { AccentId } from '../../types';
import AccentPicker from '../ui/AccentPicker';
import ModalOverlay from './ModalOverlay';

interface Props {
  visible: boolean;
  onClose: () => void;
  current: AccentId;
  onChange: (id: AccentId) => void;
  scheme: ColorScheme;
}

export default function AccentModal({ visible, onClose, current, onChange, scheme }: Props) {
  return (
    <ModalOverlay visible={visible} onClose={onClose} scheme={scheme} title="Accent Color" maxWidth={360}>
      <AccentPicker current={current} onChange={onChange} scheme={scheme} />
    </ModalOverlay>
  );
}
