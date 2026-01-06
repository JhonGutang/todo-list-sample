import React, { forwardRef, useImperativeHandle, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

type Props = {
    value: string; // ISO timestamp
    onChange: (iso: string | undefined) => void;
};

export type TimeInputRef = {
    openPicker: () => void;
};

const TimeInput = forwardRef<TimeInputRef, Props>(({ value, onChange }, ref) => {
    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());

    useImperativeHandle(ref, () => ({
        openPicker: () => {
            setShow(true);
        },
    }));

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }

        if (event.type === 'set' && selectedDate) {
            setTempDate(selectedDate);
            onChange(selectedDate.toISOString());

            if (Platform.OS === 'ios') {
                setShow(false);
            }
        } else if (event.type === 'dismissed') {
            setShow(false);
        }
    };

    if (!show) return null;

    return (
        <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
        />
    );
});

TimeInput.displayName = 'TimeInput';

export default TimeInput;
