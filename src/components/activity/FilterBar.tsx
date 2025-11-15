// FilterBar.tsx
import { useState } from "react";
import { Calendar, Search, X, Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface FilterBarProps {
  viewMode: "project" | "organization";
  dateRange?: DateRange;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  onProjectChange: (projectId: string) => void;
  onUserSearch: (query: string) => void;
  onExport: (type: "csv" | "pdf") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  projects?: Array<{ id: string; name: string }>;
  selectedProject?: string;
}

export const FilterBar = ({
  viewMode,
  dateRange,
  onDateRangeChange,
  onProjectChange,
  onUserSearch,
  onExport,
  onRefresh,
  isRefreshing,
  lastUpdated,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  projects = [],
  selectedProject
}: FilterBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [internalDateRange, setInternalDateRange] = useState<DateRange | undefined>();

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setInternalDateRange(range); // Update internal state immediately
    
    // Only trigger parent callback when we have a complete range
    if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
      onDateRangeChange(range.from, range.to);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onUserSearch(value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    onDateRangeChange(null, null);
    onUserSearch("");
    onProjectChange("");
  };

  const hasActiveFilters = dateRange?.from || dateRange?.to || searchQuery || selectedProject;

  console.log(showFilters)
  return (
    <div className="bg-card border-b border-border">
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters Toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {[dateRange?.from, dateRange?.to, searchQuery, selectedProject].filter(Boolean).length}
              </span>
            )}
          </Button>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Auto-refresh Toggle */}
            <Button
              variant={autoRefreshEnabled ? "default" : "outline"}
              size="sm"
              onClick={onToggleAutoRefresh}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", autoRefreshEnabled && "animate-spin")} />
              Auto-refresh
            </Button>

            {/* Manual Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>

            {/* Export */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onExport("csv")}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onExport("pdf")}
                  >
                    Export PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Expandable Filter Section */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Date Range */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Date Range
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={internalDateRange || dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Project Filter (Organization view only) */}
              {viewMode === "organization" && projects.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Project
                  </label>
                  <Select value={selectedProject} onValueChange={onProjectChange}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* User Search */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Search User
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Username or name..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </Button>
                <span className="text-xs text-muted-foreground">
                  Last updated: {format(lastUpdated, "PPp")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};