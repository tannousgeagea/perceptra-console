
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ui/toggle-group";
import { Table, LayoutGrid } from "lucide-react";

interface ViewToggleProps {
  view: "grid" | "table";
  setView: (view: "grid" | "table") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => {
  return (
    <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as "grid" | "table")}>
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-2 hidden md:inline">Grid</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table className="h-4 w-4" />
        <span className="ml-2 hidden md:inline">Table</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;