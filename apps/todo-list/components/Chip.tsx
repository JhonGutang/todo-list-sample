import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type Variant = 'label' | 'filter';
type Size = 'small' | 'medium';

type Props = {
  label: string;
  color?: string;
  variant?: Variant;
  size?: Size;
  active?: boolean;
  onPress?: () => void;
  style?: any;
};

export default function Chip({
  label,
  color,
  variant = 'label',
  size = 'medium',
  active = false,
  onPress,
  style
}: Props) {
  const { theme } = useTheme();
  const isSmall = size === 'small';
  const defaultColor = color || theme.textSecondary;

  const content = (
    <View
      style={[
        styles.base,
        isSmall ? styles.small : styles.medium,
        variant === 'label' ? styles.label : styles.filter,
        variant === 'label'
          ? { backgroundColor: defaultColor }
          : active
            ? { backgroundColor: theme.primary, borderWidth: 0 }
            : { borderColor: theme.border, backgroundColor: theme.cardBg },
      ]}
    >
      <Text style={[
        styles.text,
        isSmall && styles.smallText,
        variant === 'label'
          ? { color: theme.white }
          : active
            ? { color: theme.white }
            : { color: theme.textSecondary }
      ]}>{label}</Text>
    </View>
  );

  const Wrapper: any = onPress ? TouchableOpacity : View;
  const wrapperProps: any = { style };
  if (onPress) wrapperProps.onPress = onPress;
  if (onPress) wrapperProps.activeOpacity = 0.7;

  return <Wrapper {...wrapperProps}>{content}</Wrapper>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 28,
  },
  small: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    minHeight: 20,
  },
  label: {
    minWidth: 40,
  },
  filter: {
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 13,
  },
  smallText: {
    fontSize: 11,
  },
});

