import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Search, X, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/ui/command';

interface DataLakeFiltersProps {
  searchText: string;
  onSearchChange: (text: string) => void;
}

const FILTER_OPTIONS = [
  { value: 'class:', label: 'class:', description: 'Include images with the given class', example: 'class:car' },
  { value: 'split:', label: 'split:', description: 'Include images in the given split', example: 'split:train' },
  { value: 'tag:', label: 'tag:', description: 'Include images with the given tag', example: 'tag:car' },
  { value: 'filename:', label: 'filename:', description: 'Match filenames containing the given string', example: 'filename:IMG' },
  { value: 'sort:', label: 'sort:', description: 'Sort images', example: 'sort:oldest' },
  { value: 'min-annotations:', label: 'min-annotations:', description: 'Include images with at least the given number of annotations', example: 'min-annotations:5' },
  { value: 'max-annotations:', label: 'max-annotations:', description: 'Include images with at most the given number of annotations', example: 'max-annotations:5' },
  { value: 'min-height:', label: 'min-height:', description: 'Include images with a height of at least the given value', example: 'min-height:1080' },
  { value: 'max-height:', label: 'max-height:', description: 'Include images with a height of at most the given value', example: 'max-height:1080' },
  { value: 'min-width:', label: 'min-width:', description: 'Include images with a width of at least the given value', example: 'min-width:1920' },
  { value: 'max-width:', label: 'max-width:', description: 'Include images with a width of at most the given value', example: 'max-width:1920' },
  { value: 'job:', label: 'job:', description: 'Include images within the given job', example: 'job:annotation' },
  { value: 'like-image:', label: 'like-image:', description: 'Sort images by most visually similar to the given image ID', example: 'like-image:1' },
];

export function DataLakeFilters({ searchText, onSearchChange }: DataLakeFiltersProps) {
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
  };

  const quickFilters = [
    { label: 'Cars', query: 'tag:car tag:vehicle' },
    { label: 'People', query: 'tag:person tag:portrait' },
    { label: 'Animals', query: 'tag:animal' },
    { label: 'Buildings', query: 'tag:building tag:architecture' },
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar with Autocomplete */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search images or use filters: tag:car min-width:1920"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          {localSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Info className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Search Syntax</h4>
                <div className="space-y-1 text-xs">
                  {FILTER_OPTIONS.map((option) => (
                    <p key={option.value}>
                      <code className="bg-muted px-1 rounded">{option.value}</code> - {option.description}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Combine multiple filters with spaces
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Autocomplete Suggestions */}
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

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        {quickFilters.map((filter) => (
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
