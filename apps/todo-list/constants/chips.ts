import { ChipDef, FilterId, ChipId } from '../types/ui';

export const CHIPS: ChipDef[] = [
  { id: 'low', label: 'Low', color: '#2ecc71', chipColor: '#2ecc71' },
  { id: 'medium', label: 'Medium', color: '#f39c12', chipColor: '#f39c12' },
  { id: 'high', label: 'High', color: '#e74c3c', chipColor: '#e74c3c' },
];

export const FILTER_CHIPS: { id: FilterId; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: '#999' },
  ...CHIPS.map((c) => ({ id: c.id as FilterId, label: c.label, color: c.chipColor ?? c.color })),
];

export default CHIPS;

