import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
} from 'react-native';
import { ColorScheme } from '../../constants/colorSchemes';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  title: string;
  scheme: ColorScheme;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
  indent?: boolean;
}

export default function CollapsibleSection({
  title,
  scheme,
  collapsed,
  onToggle,
  children,
  rightContent,
  style,
  indent,
}: Props) {
  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.7}
          style={styles.headerLeft}
        >
          <Text style={[styles.chevron, { color: scheme.primary }]}>
            {collapsed ? '›' : '⌄'}
          </Text>
          <Text style={[styles.title, { color: scheme.text }]}>{title}</Text>
        </TouchableOpacity>
        {rightContent ? <View style={styles.rightSlot}>{rightContent}</View> : null}
      </View>
      {!collapsed && (
        <View
          style={[
            styles.content,
            indent && styles.indent,
            {
              borderWidth: 1,
              borderColor: scheme.surfaceBorder,
              borderRadius: 10,
              padding: 8,
              backgroundColor: scheme.surface,
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rightSlot: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '700',
    width: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  content: {},
  indent: {
    paddingLeft: 24,
  },
});
