
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import { Badge } from "@/components/ui/ui/badge";
import { ParsedQuery } from "@/utils/queryParse";

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  parsedQuery: ParsedQuery;
  onRemoveFilter: (key: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  parsedQuery,
  onRemoveFilter 
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or use filters like tag:value..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Show active structured filters as pills */}
      {Object.keys(parsedQuery).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {Object.entries(parsedQuery).map(([key, value]) => (
            <Badge 
              key={key} 
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="font-medium">{key}:</span>
              <span>{value}</span>
              <button 
                onClick={() => onRemoveFilter(key)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
