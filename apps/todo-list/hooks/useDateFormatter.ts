import { useCallback } from 'react';
import { formatEndDate as formatEndDateUtil, formatRange as formatRangeUtil } from '../utils/date';

/**
 * React hook providing memoized date formatting functions
 */
export default function useDateFormatter() {
  const formatEndDate = useCallback((endIso?: string) => {
    return formatEndDateUtil(endIso);
  }, []);

  const formatRange = useCallback((startIso?: string, endIso?: string) => {
    return formatRangeUtil(startIso, endIso);
  }, []);

  return { formatEndDate, formatRange };
}

