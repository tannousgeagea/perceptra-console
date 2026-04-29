import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Reusable selection hook that mirrors Google/Gmail "select all matching"
 * across paginated lists.
 *
 * Behavior:
 *  - Tracks an explicit Set<ID> of selected items.
 *  - When every item on the current page is selected and there are more
 *    matching items than the page can hold, callers can show a banner
 *    inviting the user to "Select all N matching" — backed by `allMatchingIds`
 *    (the full ID list returned by the backend).
 *  - Toggling an individual item after `selectAllMatching` simply removes
 *    or re-adds it from/to the explicit set.
 *  - Selection is automatically cleared when `resetKey` changes
 *    (e.g. when search/filters/page-size change).
 *
 * The hook is data-shape agnostic: pass IDs as strings. Convert to your
 * native ID type at the call site when submitting to APIs.
 */
export interface UseSelectAllMatchingOptions {
  /** IDs visible on the current page. */
  pageIds: string[];
  /** Total number of items matching the current filters (across all pages). */
  totalMatching: number;
  /**
   * Full ID list of every item matching the current filters.
   * Required for "select all matching" to function — when omitted the
   * banner action falls back to selecting only the current page.
   */
  allMatchingIds?: string[];
  /**
   * Any value that, when changed, should clear the current selection
   * (search text, active filters, page size, etc.). Pass a stable string
   * such as `JSON.stringify(filters)` or just the search string.
   */
  resetKey?: unknown;
}

export interface UseSelectAllMatchingResult {
  selectedIds: Set<string>;
  selectedCount: number;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  togglePage: () => void;
  selectAllMatching: () => void;
  clear: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  /** True when every visible page id is in the selection set. */
  allPageSelected: boolean;
  /** True when the user explicitly selected the entire matching set. */
  allMatchingSelected: boolean;
  /** True when the selection bar should offer the "Select all N matching" action. */
  showSelectAllMatchingPrompt: boolean;
}

export function useSelectAllMatching({
  pageIds,
  totalMatching,
  allMatchingIds,
  resetKey,
}: UseSelectAllMatchingOptions): UseSelectAllMatchingResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);

  // Reset whenever the caller-controlled key changes.
  useEffect(() => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, [resetKey]);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allPageSelected = useMemo(
    () => pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id)),
    [pageIds, selectedIds]
  );

  const togglePage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (pageIds.every((id) => next.has(id))) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [pageIds]);

  const selectAllMatching = useCallback(() => {
    if (allMatchingIds && allMatchingIds.length > 0) {
      setSelectedIds(new Set(allMatchingIds));
      setAllMatchingSelected(true);
    } else {
      // Fallback: just select the current page.
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [allMatchingIds, pageIds]);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, []);
  
  const showSelectAllMatchingPrompt =
    allPageSelected &&
    !allMatchingSelected &&
    totalMatching > pageIds.length &&
    pageIds.length > 0;

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggle,
    togglePage,
    selectAllMatching,
    clear,
    setSelectedIds,
    allPageSelected,
    allMatchingSelected,
    showSelectAllMatchingPrompt,
  };
}
