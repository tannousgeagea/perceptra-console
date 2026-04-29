import { Button } from '@/components/ui/ui/button';

interface SelectAllMatchingBannerProps {
  /** True when only the current page is fully selected (offer to expand). */
  showSelectAllMatchingPrompt: boolean;
  /** True when the user has selected every matching item across pages. */
  allMatchingSelected: boolean;
  /** Number of items currently selected (only used in the confirmed state). */
  selectedCount: number;
  /** Number of items on the current page (used in the prompt copy). */
  pageSize: number;
  /** Total number of items matching the active filters. */
  totalMatching: number;
  onSelectAllMatching: () => void;
  onClear: () => void;
}

/**
 * Google-style banner shown above a paginated list when the user has
 * selected the entire current page. Offers a one-click action to extend
 * the selection across every matching item.
 *
 * Pair with `useSelectAllMatching` — most props map 1:1 to the hook output.
 */
export function SelectAllMatchingBanner({
  showSelectAllMatchingPrompt,
  allMatchingSelected,
  selectedCount,
  pageSize,
  totalMatching,
  onSelectAllMatching,
  onClear,
}: SelectAllMatchingBannerProps) {
  if (allMatchingSelected) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 border border-primary/20 rounded-lg text-sm">
        <span className="font-medium text-primary">
          All {selectedCount.toLocaleString()} matching items are selected.
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-muted-foreground"
          onClick={onClear}
        >
          Clear selection
        </Button>
      </div>
    );
  }

  console.log(totalMatching)

  if (showSelectAllMatchingPrompt) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
        <span className="text-muted-foreground">
          All {pageSize} items on this page are selected.
        </span>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-primary font-medium"
          onClick={onSelectAllMatching}
        >
          Select all {totalMatching.toLocaleString()} matching items
        </Button>
      </div>
    );
  }

  return null;
}
