
import React, { useState, useEffect } from 'react';
import { Filters } from '@/types/dashboard';
import { Button } from '@/components/ui/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/ui/popover';
import { Calendar } from '@/components/ui/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/ui/select';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/ui/sheet';
import { Badge } from '@/components/ui/ui/badge';
import { fetchVersions } from './api';

interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  projectId: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, projectId }) => {
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: null, end: null },
    annotationSource: 'all',
    version: null,
    annotationGroup: null,
    annotationClass: null
  });
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch versions when the component mounts or projectId changes
  useEffect(() => {
    const getVersions = async () => {
      setIsLoading(true);
      try {
        const fetchedVersions = await fetchVersions(projectId);
        setVersions(fetchedVersions);
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getVersions();
  }, [projectId]);
  
  const handleStartDateChange = (date: Date | undefined) => {
    // ... keep existing code (handling start date change)
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    // ... keep existing code (handling end date change)
  };
  
  const handleSourceChange = (value: 'all' | 'manual' | 'model') => {
    // ... keep existing code (handling source change)
  };
  
  const handleVersionChange = (value: string) => {
    const versionId = value === 'all' ? null : parseInt(value);
    const newFilters = { ...filters, version: versionId };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const resetFilters = () => {
    // ... keep existing code (resetting filters)
  };
  
  // Count active filters
  const activeFilterCount = [
    filters.dateRange.start,
    filters.dateRange.end,
    filters.annotationSource !== 'all',
    filters.version !== null,
    filters.annotationGroup !== null,
    filters.annotationClass !== null
  ].filter(Boolean).length;
  
  return (
    <div className="flex items-center gap-2 mb-6">
      {/* Mobile Filters Sheet */}
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-dashboard-blue text-white">{activeFilterCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PP') : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PP') : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Annotation Source</label>
                <Select 
                  value={filters.annotationSource} 
                  onValueChange={(value: 'all' | 'manual' | 'model') => handleSourceChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="model">Model Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Version</label>
                <Select 
                  value={filters.version ? filters.version.toString() : 'all'} 
                  onValueChange={handleVersionChange}
                  disabled={isLoading || versions.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoading ? "Loading..." : "Select version"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Versions</SelectItem>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id.toString()}>
                        {version.version_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <SheetFooter>
              <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {startDate && endDate
                ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                : startDate
                ? `From ${format(startDate, 'MMM d, yyyy')}`
                : endDate
                ? `Until ${format(endDate, 'MMM d, yyyy')}`
                : 'Date Range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Date Range</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-muted-foreground"
                  onClick={() => {
                    handleStartDateChange(undefined);
                    handleEndDateChange(undefined);
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2">
              <div>
                <div className="mb-1 px-1 text-xs text-muted-foreground">Start date</div>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  disabled={(date) => endDate ? date > endDate : false}
                />
              </div>
              <div>
                <div className="mb-1 px-1 text-xs text-muted-foreground">End date</div>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Select 
          value={filters.annotationSource} 
          onValueChange={(value: 'all' | 'manual' | 'model') => handleSourceChange(value)}
        >
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="model">Model Generated</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.version ? filters.version.toString() : 'all'} 
          onValueChange={handleVersionChange}
          disabled={isLoading || versions.length === 0}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder={isLoading ? "Loading..." : "Version"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Versions</SelectItem>
            {versions.map((version) => (
              <SelectItem key={version.id} value={version.id.toString()}>
                {version.version_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={resetFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="ml-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 flex gap-1"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
