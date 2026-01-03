export type TagId = 'low' | 'medium' | 'high';
export type FilterId = TagId | 'all';

export type Tag = {
  id: TagId;
  label: string;
  color: string; // used for badge background
  chipColor?: string; // used for filter chip appearance (optional)
};

export const TAGS: Tag[] = [
  { id: 'low', label: 'Low', color: '#2ecc71', chipColor: '#2ecc71' },
  { id: 'medium', label: 'Medium', color: '#f39c12', chipColor: '#f39c12' },
  { id: 'high', label: 'High', color: '#e74c3c', chipColor: '#e74c3c' },
];

export const FILTER_TAGS: { id: FilterId; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: '#999' },
  ...TAGS.map((t) => ({ id: t.id as FilterId, label: t.label, color: t.chipColor ?? t.color })),
];

export default TAGS;
