import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

type Variant = 'label' | 'filter';

type Props = {
  label: string;
  color?: string;
  variant?: Variant;
  active?: boolean;
  onPress?: () => void;
  style?: any;
};

export default function Chip({ label, color = Colors.textSecondary, variant = 'label', active = false, onPress, style }: Props) {
  const content = (
    <View
      style={[
        styles.base,
        variant === 'label' ? styles.label : styles.filter,
        variant === 'label'
          ? { backgroundColor: color }
          : active
            ? { backgroundColor: Colors.primary, borderWidth: 0 }
            : { borderColor: Colors.border, backgroundColor: Colors.white },
      ]}
    >
      <Text style={[
        styles.text,
        variant === 'label'
          ? styles.labelText
          : active
            ? styles.filterActiveText
            : { color: Colors.textSecondary }
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 29, // Ensures consistent height (13px font + 8px top + 8px bottom)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filter: {
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 13
  },
  labelText: {
    color: Colors.white,
    textTransform: 'capitalize'
  },
  filterActiveText: {
    color: Colors.white
  },
});
