import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

type Props = {
  startDate?: string | null;
  endDate?: string | null;
  onChange?: (start?: string | null, end?: string | null) => void;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatLocalYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseToLocalDate(dateStr?: string | null) {
  if (!dateStr) return undefined;
  // If it's already a YYYY-MM-DD (calendar.dateString), construct local date
  const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (ymdMatch) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

function toYMD(dateStr?: string | null) {
  const d = parseToLocalDate(dateStr);
  if (!d) return undefined;
  return formatLocalYMD(d);
}

function getDatesBetween(start: Date, end: Date) {
  const dates: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    dates.push(formatLocalYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function CalendarRangePicker({ startDate, endDate, onChange }: Props) {
  const [start, setStart] = useState<string | undefined>(toYMD(startDate));
  const [end, setEnd] = useState<string | undefined>(toYMD(endDate));

  useEffect(() => {
    setStart(toYMD(startDate));
    setEnd(toYMD(endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    if (onChange) onChange(start ?? null, end ?? null);
  }, [start, end]);

  const buildMarked = () => {
    const marked: Record<string, any> = {};
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const between = getDatesBetween(s, e);
      between.forEach((d, i) => {
        marked[d] = {
          color: '#4c9aff',
          textColor: '#fff',
          startingDay: i === 0,
          endingDay: i === between.length - 1,
        };
      });
    } else if (start) {
      marked[start] = { selected: true, color: '#4c9aff', textColor: '#fff' };
    }
    return marked;
  };

  function onDayPress(day: DateData) {
    const ds = day.dateString;
    if (!start || (start && end)) {
      setStart(ds);
      setEnd(undefined);
      return;
    }
    // start exists, no end yet
    if (new Date(ds) < new Date(start)) {
      setStart(ds);
      setEnd(start);
      return;
    }
    setEnd(ds);
  }

  return (
    <View style={styles.wrapper}>
      <Calendar
        markingType={'period'}
        markedDates={buildMarked()}
        onDayPress={onDayPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 12 },
});
