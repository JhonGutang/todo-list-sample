import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

type Variant = 'label' | 'filter';

type Props = {
  label: string;
  color?: string;
  variant?: Variant;
  active?: boolean;
  onPress?: () => void;
  style?: any;
};

export default function Chip({ label, color = '#999', variant = 'label', active = false, onPress, style }: Props) {
  const content = (
    <View
      style={[
        styles.base,
        variant === 'label' ? styles.label : styles.filter,
        variant === 'label'
          ? { backgroundColor: color }
          : active
          ? { backgroundColor: color, borderWidth: 0 }
          : { borderColor: color },
      ]}
    >
      <Text style={[styles.text, variant === 'label' ? styles.labelText : active ? styles.filterActiveText : { color }]}>{label}</Text>
    </View>
  );

  const Wrapper: any = onPress ? TouchableOpacity : View;
  const wrapperProps: any = { style };
  if (onPress) wrapperProps.onPress = onPress;
  if (onPress) wrapperProps.activeOpacity = 0.8;

  return <Wrapper {...wrapperProps}>{content}</Wrapper>;
}

const styles = StyleSheet.create({
  base: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16 },
  label: { minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  filter: { borderWidth: 1, backgroundColor: 'transparent' },
  text: { fontWeight: '600', fontSize: 13 },
  labelText: { color: '#fff', textTransform: 'capitalize' },
  filterActiveText: { color: '#fff' },
});
