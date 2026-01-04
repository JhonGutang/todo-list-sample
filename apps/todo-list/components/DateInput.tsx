import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Props = {
  value?: string;
  onChange: (iso?: string) => void;
  placeholder?: string;
};

const DateInput = forwardRef(({ value, onChange, placeholder = 'Set date' }: Props, ref) => {
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    openPicker: () => setShow(true),
  }));

  const handleConfirm = (date: Date) => {
    setShow(false);
    onChange(date.toISOString());
  };

  const display = value ? new Date(value).toLocaleDateString() : placeholder;

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Text style={value ? styles.text : styles.placeholder}>{display}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={show}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setShow(false)}
      />
    </View>
  );
});

export default DateInput;

const styles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  text: { color: '#111' },
  placeholder: { color: '#888' },
});
