
import React from "react";
import { Filter } from "lucide-react";

interface TagFilterProps {
  allTags: string[];
  filterTags: string[];
  toggleFilterTag: (tag: string) => void;
  handleClearFilters: () => void;
  hasActiveFilters: boolean;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  allTags, 
  filterTags, 
  toggleFilterTag, 
  handleClearFilters,
  hasActiveFilters
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by Tags:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleFilterTag(tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              filterTags.includes(tag)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {tag}
          </button>
        ))}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground ml-2 underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TagFilter;
