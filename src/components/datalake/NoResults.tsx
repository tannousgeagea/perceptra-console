
import React from "react";
import { Button } from "@/components/ui/ui/button";

interface NoResultsProps {
  onClearFilters: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ onClearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-lg font-medium">No images match your search criteria</p>
      <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default NoResults;
