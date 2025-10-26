import { Card, CardContent } from "@/components/ui/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Button } from "@/components/ui/ui/button";
import { Calendar } from "@/components/ui/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/ui/popover";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Badge } from "@/components/ui/ui/badge";
import { CalendarIcon, Filter, Users, X } from "lucide-react";
import { format } from "date-fns";
import { AnalyticsFilters } from "@/types/analytics";
import { cn } from "@/lib/utils";
import { useAnalyticsRoles } from "@/hooks/useTeamAnalytics";

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  availableUsers?: string[];
}

export const AnalyticsFiltersComponent = ({ filters, onFiltersChange, availableUsers = [] }: AnalyticsFiltersProps) => {
  // // const roles = ["Senior Annotator", "Annotator", "Lead Reviewer", "Junior Annotator"];
  const { data: roles } = useAnalyticsRoles();

  console.log(roles)
  const handleUserToggle = (user: string, checked: boolean) => {
    if (showingAllUsers && checked) {
      // If showing all users and user clicks to select specific user,
      // start with just that user selected
      onFiltersChange({
        ...filters,
        selectedUsers: [user]
      });
      return;
    }
    
    if (showingAllUsers && !checked) {
      // If showing all users and user clicks to unselect, 
      // select all other users except this one
      const otherUsers = availableUsers.filter(u => u !== user);
      onFiltersChange({
        ...filters,
        selectedUsers: otherUsers
      });
      return;
    }

    // Normal toggle behavior when specific users are already selected
    const currentUsers = filters.selectedUsers || [];
    const newUsers = checked 
      ? [...currentUsers, user]
      : currentUsers.filter(u => u !== user);
    
    onFiltersChange({
      ...filters,
      selectedUsers: newUsers.length > 0 ? newUsers : undefined
    });
  };

  const selectedUserCount = filters.selectedUsers?.length || 0;
  const showingAllUsers = !filters.selectedUsers || filters.selectedUsers.length === 0;
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* First Row - Main Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters:
            </div>
            
            {/* Time Frame */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Time Frame</label>
              <Select
                value={filters.timeFrame}
                onValueChange={(value: 'day' | 'week' | 'month') => 
                  onFiltersChange({ ...filters, timeFrame: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="flex flex-col gap-1" >
              <label className="text-xs text-muted-foreground">Role</label>
              <Select
                disabled
                value={filters.role || "all"}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    role: value === "all" ? undefined : value 
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles?.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range (Optional) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Custom Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled
                    variant="outline"
                    className={cn(
                      "w-48 justify-start text-left font-normal",
                      !filters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange ? (
                      `${format(filters.dateRange.start, "MMM dd")} - ${format(filters.dateRange.end, "MMM dd")}`
                    ) : (
                      "Pick date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={filters.dateRange?.start}
                    selected={{
                      from: filters.dateRange?.start,
                      to: filters.dateRange?.end,
                    }}
                    onSelect={(range) => {
                      if (!range) {
                        onFiltersChange({
                          ...filters,
                          dateRange: undefined
                        });
                        return;
                      }
                      
                      onFiltersChange({
                        ...filters,
                        dateRange: range.from && range.to ? {
                          start: range.from,
                          end: range.to,
                        } : range.from ? {
                          start: range.from,
                          end: range.from,
                        } : undefined
                      });
                    }}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>


            {/* Top Performers Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Display</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  disabled
                  id="top-performers"
                  checked={filters.showTopPerformersOnly || false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      showTopPerformersOnly: checked as boolean
                    })
                  }
                />
                <label
                  htmlFor="top-performers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Top 5 only
                </label>
              </div>
            </div>
          </div>

          {/* Second Row - User Selection */}
          {availableUsers.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Users ({showingAllUsers ? availableUsers.length : selectedUserCount} selected):
                </span>
                {!showingAllUsers && (
                  <Button
                    disabled
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, selectedUsers: undefined })}
                    className="h-6 px-2 text-xs"
                  >
                    Select All
                  </Button>
                )}
              </div>
              
              {/* Selected Users Badges */}
              {!showingAllUsers && (
                <div className="flex flex-wrap gap-1">
                  {filters.selectedUsers?.map((user) => (
                    <Badge
                      key={user}
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      {user}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleUserToggle(user, false)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* User Selection Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button disabled variant="outline" size="sm" className="w-48">
                    <Users className="mr-2 h-4 w-4" />
                    Select Users
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div key={user} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user}`}
                          checked={showingAllUsers || filters.selectedUsers?.includes(user) || false}
                          onCheckedChange={(checked) => handleUserToggle(user, checked as boolean)}
                        />
                        <label
                          htmlFor={`user-${user}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {user}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Clear Filters */}
          {(filters.role || filters.dateRange || filters.selectedUsers || filters.showTopPerformersOnly) && (
            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => 
                  onFiltersChange({ 
                    timeFrame: filters.timeFrame,
                  })
                }
                className="text-xs"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};