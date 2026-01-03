import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Props = {
  value?: string;
  onChange: (iso?: string) => void;
  placeholder?: string;
};

export default function DateInput({ value, onChange, placeholder = 'Set date' }: Props) {
  const [show, setShow] = useState(false);

  const handleConfirm = (date: Date) => {
    setShow(false);
    onChange(date.toISOString());
  };

  const display = value ? new Date(value).toLocaleString() : placeholder;

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={value ? styles.text : styles.placeholder}>{display}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={show}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setShow(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  text: { color: '#111' },
  placeholder: { color: '#888' },
});
