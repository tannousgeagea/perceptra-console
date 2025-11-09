import { Card, CardContent } from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { Calendar } from "@/components/ui/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface AnalyticsFiltersProps {
  dateRange?: DateRange;
  onDateRangeChange: (range?: DateRange) => void;
  timeGranularity: "daily" | "weekly" | "monthly";
  onTimeGranularityChange: (granularity: "daily" | "weekly" | "monthly") => void;
  selectedVersion?: string;
  onVersionChange: (version?: string) => void;
  versions: Array<{ id: string; name: string }>;
}

export const AnalyticsFilters = ({
  dateRange,
  onDateRangeChange,
  timeGranularity,
  onTimeGranularityChange,
  selectedVersion,
  onVersionChange,
  versions,
}: AnalyticsFiltersProps) => {
  const hasActiveFilters = dateRange || selectedVersion;

  const clearFilters = () => {
    onDateRangeChange(undefined);
    onVersionChange(undefined);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Time Granularity */}
          <Select value={timeGranularity} onValueChange={onTimeGranularityChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          {/* Version Filter */}
          <Select value={selectedVersion} onValueChange={onVersionChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All versions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All versions</SelectItem>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};