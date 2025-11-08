import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/ui/input';
import { Badge } from '@/components/ui/ui/badge';
import { Search, X, Grid3x3, Table2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Toggle } from '@/components/ui/ui/toggle';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/ui/command';

interface ProjectDatasetFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  showAnnotations: boolean;
  onShowAnnotationsChange: (show: boolean) => void;
}

const FILTER_OPTIONS = [
  { value: 'class:', label: 'class:', description: 'Include images with the given class' },
  { value: 'split:', label: 'split:', description: 'Include images in the given split' },
  { value: 'tag:', label: 'tag:', description: 'Include images with the given tag' },
  { value: 'filename:', label: 'filename:', description: 'Match filenames containing the given string' },
  { value: 'sort:', label: 'sort:', description: 'Sort images' },
  { value: 'min-annotations:', label: 'min-annotations:', description: 'Include images with at least the given number of annotations' },
  { value: 'max-annotations:', label: 'max-annotations:', description: 'Include images with at most the given number of annotations' },
  { value: 'min-height:', label: 'min-height:', description: 'Include images with a height of at least the given value' },
  { value: 'max-height:', label: 'max-height:', description: 'Include images with a height of at most the given value' },
  { value: 'min-width:', label: 'min-width:', description: 'Include images with a width of at least the given value' },
  { value: 'max-width:', label: 'max-width:', description: 'Include images with a width of at most the given value' },
  { value: 'job:', label: 'job:', description: 'Include images within the given job' },
  { value: 'like-image:', label: 'like-image:', description: 'Sort images by most visually similar to the given image ID' },
];

const QUICK_FILTERS = [
  { label: 'Annotated', query: 'status:annotated' },
  { label: 'Reviewed', query: 'status:reviewed' },
  { label: 'Unannotated', query: 'status:unannotated' },
  { label: 'Has Annotations', query: 'min-annotations:1' },
  { label: 'Training Set', query: 'tag:training' },
  { label: 'Test Set', query: 'tag:test' },
];

export function ProjectDatasetFilters({ 
  searchText, 
  onSearchChange,
  viewMode,
  onViewModeChange,
  showAnnotations,
  onShowAnnotationsChange
}: ProjectDatasetFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchText);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(FILTER_OPTIONS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Filter suggestions based on current input
  useEffect(() => {
    const lastWord = localSearch.split(' ').pop() || '';
    
    if (lastWord.length === 0) {
      setFilteredOptions(FILTER_OPTIONS);
    } else {
      const filtered = FILTER_OPTIONS.filter(
        (option) =>
          option.value.toLowerCase().includes(lastWord.toLowerCase()) ||
          option.description.toLowerCase().includes(lastWord.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [localSearch]);

  const handleSelectSuggestion = (value: string) => {
    const words = localSearch.split(' ');
    words[words.length - 1] = value;
    const newSearch = words.join(' ');
    setLocalSearch(newSearch);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search images... (e.g., status:annotated tag:car min-annotations:5)"
            className="pl-10 pr-10"
          />
          {localSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {showSuggestions && filteredOptions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50">
              <Command className="rounded-lg border shadow-md bg-popover">
                <CommandList>
                  <CommandEmpty>No filters found.</CommandEmpty>
                  <CommandGroup heading="Available Filters">
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelectSuggestion(option.value)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
          {/* <span className="text-sm text-muted-foreground">View:</span> */}
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('table')}
          >
            <Table2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
          <Toggle
            pressed={showAnnotations}
            onPressedChange={onShowAnnotationsChange}
            aria-label="Toggle annotations"
            disabled={viewMode === 'table'}
          >
            {showAnnotations ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Annotations
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Annotations
              </>
            )}
          </Toggle>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 py-3">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        {QUICK_FILTERS.map((filter) => (
          <Badge
            key={filter.label}
            variant="outline"
            className="cursor-pointer hover:bg-data-hover transition-colors"
            onClick={() => setLocalSearch(filter.query)}
          >
            {filter.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
