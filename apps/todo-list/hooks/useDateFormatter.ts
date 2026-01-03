import { useCallback } from 'react';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseToLocalDate(dateStr?: string) {
  if (!dateStr) return undefined;
  const ymdMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (ymdMatch) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

function toLocalMidnight(d: Date) {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

export default function useDateFormatter() {
  const formatEndDate = useCallback((endIso?: string) => {
    if (!endIso) return '';
    const date = parseToLocalDate(endIso);
    if (!date) return '';
    const today = toLocalMidnight(new Date());
    const target = toLocalMidnight(date);
    const diffDays = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 6) {
      return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
  }, []);

  const formatRange = useCallback((startIso?: string, endIso?: string) => {
    // For ranges, display only the end date per spec; fall back to start if no end
    if (endIso) return formatEndDate(endIso);
    if (startIso) return formatEndDate(startIso);
    return '';
  }, [formatEndDate]);

  return { formatEndDate, formatRange };
}
