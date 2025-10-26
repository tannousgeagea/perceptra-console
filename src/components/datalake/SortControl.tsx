
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/ui/button";

interface SortControlProps {
  sortOrder: "asc" | "desc";
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
}

const SortControl: React.FC<SortControlProps> = ({ sortOrder, setSortOrder }) => {
  return (
    <Button
      variant="outline"
      onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
      className="flex items-center gap-1"
    >
      {/* Date {sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />} */}
      <span>Date</span>
      {sortOrder === "asc" ? 
        <ArrowUp className="h-4 w-4" /> : 
        <ArrowDown className="h-4 w-4" />
      }
    </Button>
  );
};

export default SortControl;
